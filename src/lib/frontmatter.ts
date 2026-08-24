/**
 * Minimal YAML front-matter reader for the site's markdown collections.
 *
 * Deliberately not a general YAML parser: it supports exactly the shapes Decap
 * CMS writes for the field types we use — plain scalars, quoted scalars, block
 * scalars (`|`, `|-`, `>`, `>-`) and simple `- item` lists. Anything richer
 * than that should be a reason to reach for a real parser, not to extend this.
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

function coerce(raw: string): FrontmatterValue {
  const value = raw.trim()
  if (value === '' || value === '~' || value === 'null') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
    (value.startsWith("'") && value.endsWith("'") && value.length > 1)
  ) {
    const inner = value.slice(1, -1)
    return value[0] === '"'
      ? inner.replace(/\\"/g, '"').replace(/\\n/g, '\n')
      : inner.replace(/''/g, "'")
  }
  return value
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

    const match = /^([A-Za-z0-9_-]+)\s*:\s?(.*)$/.exec(line)
    if (!match) continue
    const [, key, rest] = match

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
