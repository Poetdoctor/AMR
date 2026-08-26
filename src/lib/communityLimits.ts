/**
 * Shared with the edge functions, which enforce the same numbers server-side.
 * The values here only shape the form; the database constraints are what
 * actually hold.
 */
export const LIMITS = {
  bodyMin: 20,
  bodyMax: 4000,
  nameMax: 40,
} as const
