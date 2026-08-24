import type { TeamMember } from '@/lib/content'
import { ImageFrame, Monogram } from './ImageFrame'

/** Matches the intrinsic size of the supplied portrait set (420×280, 3:2). */
const PORTRAIT = { width: 420, height: 280, aspect: 'aspect-[3/2]' }

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-lift)]">
      {member.photo ? (
        <ImageFrame
          src={member.photo}
          alt={`Portrait of ${member.name}`}
          aspect={PORTRAIT.aspect}
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          placeholderLabel="Photo coming soon"
        />
      ) : (
        <Monogram name={member.name} className={`w-full ${PORTRAIT.aspect}`} />
      )}

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl leading-snug font-bold tracking-tight text-ink">
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-rust-deep">{member.role}</p>
        <blockquote className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">
          <p>“{member.quote}”</p>
        </blockquote>
      </div>
    </article>
  )
}
