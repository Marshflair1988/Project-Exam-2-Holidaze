/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOROFF_API_KEY?: string;
  readonly VITE_NOROFF_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

