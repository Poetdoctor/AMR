import { QUESTION_GROUPS, type VisitPrep } from '@/lib/visitPrep'

/**
 * The worksheet as it will look on paper.
 *
 * This — not the form — is what the print stylesheet prints. Rendering a
 * separate sheet from the same state is more reliable than trying to print
 * textareas (browsers clip their content) and it lets people see exactly what
 * they are about to walk in holding.
 */
export function PrepSheet({ prep }: { prep: VisitPrep }) {
  const facts = [
    ['Appointment with', prep.appointmentWith],
    ['When', prep.appointmentWhen],
    ['What I have been told I have', prep.diagnosis],
    ['What I am taking', prep.medications],
  ].filter(([, value]) => value.trim())

  const groups = QUESTION_GROUPS.map((group) => ({
    label: group.label,
    questions: group.questions.filter((q) => prep.selectedQuestions.includes(q.id)),
  })).filter((group) => group.questions.length > 0)

  const custom = prep.customQuestions.filter((q) => q.trim())
  const nothingYet =
    facts.length === 0 &&
    groups.length === 0 &&
    custom.length === 0 &&
    !prep.whatsBeenHappening.trim() &&
    !prep.howItsAffectingMe.trim() &&
    !prep.wantToLeaveWith.trim()

  return (
    <div className="prep-sheet">
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Visit preparation</h2>

      {nothingYet ? (
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-faint">
          Your sheet builds up here as you fill the form in. Nothing you type leaves this page.
        </p>
      ) : null}

      {facts.length > 0 ? (
        <dl className="mt-6 space-y-2">
          {facts.map(([label, value]) => (
            <div key={label} className="flex flex-wrap gap-x-2 text-[0.9375rem]">
              <dt className="font-semibold text-ink">{label}:</dt>
              <dd className="text-ink-soft">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <SheetProse title="What's been happening" body={prep.whatsBeenHappening} />

      {groups.length > 0 || custom.length > 0 ? (
        <section className="mt-7">
          <h3 className="eyebrow mb-3">Questions I want to ask</h3>
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-sm font-semibold text-ink">{group.label}</p>
                <ul className="mt-2 list-none space-y-2">
                  {group.questions.map((question) => (
                    <li key={question.id} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-faint"
                      />
                      <span className="text-ink-soft">{question.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {custom.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-ink">My own questions</p>
                <ul className="mt-2 list-none space-y-2">
                  {custom.map((question, index) => (
                    <li
                      key={`${question}-${index}`}
                      className="flex gap-3 text-[0.9375rem] leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-faint"
                      />
                      <span className="text-ink-soft">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <SheetProse title="How this is actually affecting me" body={prep.howItsAffectingMe} />
      <SheetProse title="What I want to leave with" body={prep.wantToLeaveWith} />

      <p className="mt-8 border-t border-sand-line pt-4 text-xs leading-relaxed text-ink-faint">
        Educational, not medical advice. This worksheet is for your own use and does not replace
        consultation with a healthcare provider.
      </p>
    </div>
  )
}

function SheetProse({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null
  return (
    <section className="mt-7">
      <h3 className="eyebrow mb-2">{title}</h3>
      {body
        .trim()
        .split(/\n{2,}/)
        .map((paragraph, index) => (
          <p
            key={index}
            className="mt-2 text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink-soft"
          >
            {paragraph}
          </p>
        ))}
    </section>
  )
}
