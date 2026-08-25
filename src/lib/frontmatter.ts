/**
 * Minimal YAML front-matter reader for the site's markdown collections.
 *
 * Deliberately not a general YAML parser. Its job is to survive whatever
 * Decap CMS writes when someone saves a form: plain scalars, quoted scalars
 * (including ones a serialiser wrapped across lines), block scalars
 * (`|`, `>`, `|-`, `>-`), escape sequences, and simple `- item` lists.
 * scripts/test-content.mjs round-trips awkward values through js-yaml — the
 * library Decap serialises with — and back through this parser. Extend that
 * test before extending this file; anything richer than the shapes it covers is
 * a reason to reach for a real YAML library, not to grow this one.
 *
 * Runs in the browser at module-eval time (see content.ts), so it stays
 * dependency-free — gray-matter and friends expect Node's Buffer.
 */

export type FrontmatterValue = string | string[] | boolean | number | null

export interface ParsedDocument {
  data: Record<string, FrontmatterValue>
  body: string
}

const DELIMITER = /^---\s*$/

/** YAML's double-quoted escape table. */
const ESCAPES: Record<string, string> = {
  '0': '\0',
  a: '\x07',
  b: '\b',
  t: '\t',
  '\t': '\t',
  n: '\n',
  v: '\v',
  f: '\f',
  r: '\r',
  e: '\x1b',
  ' ': ' ',
  '"': '"',
  '/': '/',
  '\\': '\\',
  N: '\x85',
  _: '\xa0',
  L: ' ',
  P: ' ',
}

function unescapeDoubleQuoted(input: string): string {
  let out = ''
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== '\\') {
      out += input[i]
      continue
    }
    const next = input[++i]
    if (next === undefined) break
    if (next === 'x' || next === 'u' || next === 'U') {
      const width = next === 'x' ? 2 : next === 'u' ? 4 : 8
      const hex = input.slice(i + 1, i + 1 + width)
      if (new RegExp(`^[0-9a-fA-F]{${width}}$`).test(hex)) {
        out += String.fromCodePoint(parseInt(hex, 16))
        i += width
        continue
      }
    }
    out += ESCAPES[next] ?? next
  }
  return out
}

function coerce(raw: string): FrontmatterValue {
  const value = raw.trim()
  if (value === '' || value === '~' || value === 'null') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if (value.length > 1) {
    if (value.startsWith('"') && value.endsWith('"'))
      return unescapeDoubleQuoted(value.slice(1, -1))
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'")
  }
  return value
}

/** True when a quoted scalar starting with `quote` is closed within `text`. */
function isClosedQuote(text: string, quote: string): boolean {
  if (text.length < 2) return false
  for (let i = 1; i < text.length; i++) {
    if (quote === '"' && text[i] === '\\') {
      i++
      continue
    }
    if (text[i] !== quote) continue
    if (quote === "'" && text[i + 1] === "'") {
      i++
      continue
    }
    return true
  }
  return false
}

/**
 * Join the continuation lines of a quoted scalar that a serialiser wrapped:
 * a line break folds to a space, and a trailing backslash in a double-quoted
 * scalar joins with no space at all.
 */
function foldQuoted(lines: string[]): string {
  return lines.reduce((acc, line) => {
    const trimmed = line.trim()
    if (acc === '') return trimmed
    if (acc.endsWith('\\')) return `${acc.slice(0, -1)}${trimmed}`
    return `${acc} ${trimmed}`
  }, '')
}

function dedent(lines: string[]): string[] {
  const indents = lines.filter((l) => l.trim() !== '').map((l) => l.length - l.trimStart().length)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(min))
}

/** Fold a block scalar's lines according to its `|` / `>` style and chomp indicator. */
function foldBlock(lines: string[], style: '|' | '>', chomp: '' | '-' | '+'): string {
  const content = dedent(lines)
  let text: string
  if (style === '|') {
    text = content.join('\n')
  } else {
    // Folded: blank lines become paragraph breaks, single newlines become spaces.
    text = content
      .reduce<string[]>((acc, line) => {
        if (line.trim() === '') return [...acc, '', '']
        const last = acc[acc.length - 1]
        if (acc.length === 0 || last === '') return [...acc, line]
        acc[acc.length - 1] = `${last} ${line.trim()}`
        return acc
      }, [])
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
  }
  text = text.replace(/\s+$/, '')
  if (chomp === '+') return `${text}\n`
  if (chomp === '') return text ? `${text}\n` : ''
  return text
}

export function parseFrontmatter(source: string): ParsedDocument {
  const normalized = source.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')

  if (!DELIMITER.test(lines[0] ?? '')) {
    return { data: {}, body: normalized.trim() }
  }

  const closing = lines.findIndex((line, i) => i > 0 && DELIMITER.test(line))
  if (closing === -1) return { data: {}, body: normalized.trim() }

  const data: Record<string, FrontmatterValue> = {}
  const head = lines.slice(1, closing)

  for (let i = 0; i < head.length; i++) {
    const line = head[i]
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue

    // Keys may be quoted — js-yaml quotes any that would otherwise read as a
    // boolean, a number, or a reserved word.
    const match = /^\s*(?:'([^']+)'|"([^"]+)"|([A-Za-z0-9_-]+))\s*:\s?(.*)$/.exec(line)
    if (!match) continue
    const key = match[1] ?? match[2] ?? match[3]
    const rest = match[4]

    const block = /^([|>])([+-]?)\s*$/.exec(rest.trim())
    if (block) {
      const [, style, chomp] = block
      const collected: string[] = []
      const baseIndent = line.length - line.trimStart().length
      while (i + 1 < head.length) {
        const next = head[i + 1]
        const indent = next.length - next.trimStart().length
        if (next.trim() !== '' && indent <= baseIndent) break
        collected.push(next)
        i++
      }
      data[key] = foldBlock(collected, style as '|' | '>', chomp as '' | '-' | '+')
      continue
    }

    // A quoted scalar that doesn't close on its own line continues onto the next.
    const quote = rest.trim()[0]
    if ((quote === '"' || quote === "'") && !isClosedQuote(rest.trim(), quote)) {
      const collected = [rest.trim()]
      while (i + 1 < head.length) {
        collected.push(head[i + 1])
        i++
        if (isClosedQuote(foldQuoted(collected), quote)) break
      }
      data[key] = coerce(foldQuoted(collected))
      continue
    }

    if (rest.trim() === '') {
      // Possible `- item` list on the following lines.
      const items: string[] = []
      while (i + 1 < head.length && /^\s*-\s+/.test(head[i + 1])) {
        items.push(String(coerce(head[i + 1].replace(/^\s*-\s+/, ''))))
        i++
      }
      data[key] = items.length ? items : null
      continue
    }

    data[key] = coerce(rest)
  }

  return {
    data,
    body: lines
      .slice(closing + 1)
      .join('\n')
      .trim(),
  }
}

/** Read a front-matter field as a trimmed string, treating blanks as absent. */
export function readString(data: Record<string, FrontmatterValue>, key: string): string {
  const value = data[key]
  if (value === null || value === undefined || typeof value === 'boolean') return ''
  return String(value).trim()
}
