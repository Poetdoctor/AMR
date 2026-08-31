/**
 * The daily nudge.
 *
 * Six people rotating a daily sweep is sustainable; six people rotating a daily
 * sweep with nothing reminding them is how a rota quietly stops. This posts to
 * Discord when comments have gone unread, so a missed day is visible rather
 * than assumed away.
 *
 * Schedule it with pg_cron — see supabase/README.md.
 */
import { admin, replyFor } from '../_shared/util.ts'

Deno.serve(async (req) => {
  const reply = replyFor(req)
  const db = admin()

  const { count: unswept } = await db
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .is('swept_at', null)

  const { count: reported } = await db
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .gt('report_count', 0)
    .is('swept_at', null)

  const { data: oldest } = await db
    .from('comments')
    .select('created_at')
    .is('swept_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!unswept) return reply({ posted: false, reason: 'queue empty' })

  const hoursWaiting = oldest
    ? Math.floor((Date.now() - new Date(oldest.created_at).getTime()) / 3_600_000)
    : 0

  const webhook = Deno.env.get('DISCORD_WEBHOOK_URL')
  if (!webhook) return reply({ posted: false, reason: 'no webhook configured', unswept })

  const lines = [
    `**${unswept} comment${unswept === 1 ? '' : 's'} waiting to be read.**`,
    reported ? `⚠️ ${reported} ${reported === 1 ? 'has' : 'have'} been reported.` : null,
    hoursWaiting >= 24
      ? `The oldest has been up for ${Math.floor(hoursWaiting / 24)} day${hoursWaiting >= 48 ? 's' : ''} without anyone reading it.`
      : `Oldest has been waiting ${hoursWaiting}h.`,
    'Open Supabase Studio → `sweep_queue`. Set `swept_at` and `swept_by` when you have been through it.',
  ].filter(Boolean)

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n') }),
  })

  return reply({ posted: true, unswept, reported, hoursWaiting })
})
