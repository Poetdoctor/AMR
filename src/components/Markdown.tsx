import { useMemo } from 'react'
import { marked } from 'marked'

/**
 * Renders markdown from the content collections.
 *
 * The input is repo-authored — either committed directly or written through
 * Decap CMS by a GitHub collaborator — so it is trusted content, not user
 * input. If markdown ever comes from an untrusted source (Community
 * submissions, for instance), it must be sanitised before it reaches here, or
 * better, rendered as plain text instead.
 */
export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  const html = useMemo(
    () => marked.parse(children, { async: false, gfm: true, breaks: false }) as string,
    [children],
  )

  return (
    <div
      className={`markdown prose-amr ${className}`}
      // eslint-disable-next-line react/no-danger -- trusted repo content, see above
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
