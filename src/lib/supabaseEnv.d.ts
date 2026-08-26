interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  /** Supabase's "publishable" key — public by design, ships in the bundle. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  /** Legacy name for the same thing. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
