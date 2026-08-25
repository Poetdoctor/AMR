import { EMPTY_PREP, type VisitPrep } from './visitPrep'

/**
 * Opt-in local saving for the visit-prep worksheet.
 *
 * The worksheet holds health information someone may not want anyone else to
 * see, and the device it is typed on is often shared — a family laptop, a
 * library machine. So saving is **off by default** and has to be switched on
 * deliberately, with the UI saying plainly where the text goes.
 *
 * When it is on, the text is written to this browser's localStorage and nowhere
 * else. It is never transmitted: there is no server to transmit it to. When it
 * is switched off, anything already stored is erased immediately rather than
 * left behind.
 *
 * Every access is wrapped, because localStorage throws rather than returning
 * null in private windows and where site data is blocked.
 */

const KEY = 'amr.visit-prep.v1'
const CONSENT_KEY = 'amr.visit-prep.save-enabled.v1'

export function isSavingEnabled(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'yes'
  } catch {
    return false
  }
}

export function load(): VisitPrep | null {
  if (!isSavingEnabled()) return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<VisitPrep>
    // Merge over the empty shape so a stored copy from an older version, or a
    // hand-edited one, can never produce undefined fields.
    return {
      ...EMPTY_PREP,
      ...parsed,
      selectedQuestions: Array.isArray(parsed.selectedQuestions) ? parsed.selectedQuestions : [],
      customQuestions: Array.isArray(parsed.customQuestions) ? parsed.customQuestions : [],
    }
  } catch {
    return null
  }
}

export function save(prep: VisitPrep): void {
  if (!isSavingEnabled()) return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prep))
  } catch {
    /* Storage full or blocked — the worksheet still works, it just won't persist. */
  }
}

/** Turning saving off erases what was stored; it does not merely stop writing. */
export function setSavingEnabled(enabled: boolean, prep: VisitPrep): void {
  try {
    if (enabled) {
      window.localStorage.setItem(CONSENT_KEY, 'yes')
      window.localStorage.setItem(KEY, JSON.stringify(prep))
    } else {
      window.localStorage.removeItem(CONSENT_KEY)
      window.localStorage.removeItem(KEY)
    }
  } catch {
    /* Nothing to clean up if storage was never available. */
  }
}

export function clearStored(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* Nothing to clean up. */
  }
}

/** True when this browser has anything stored from a previous visit. */
export function hasStored(): boolean {
  try {
    return isSavingEnabled() && window.localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}
