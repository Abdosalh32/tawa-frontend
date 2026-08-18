/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** جذر الـAPI في الباكند — يُضبط في `.env.local` (انظر `.env.example`) */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
