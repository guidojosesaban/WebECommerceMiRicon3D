/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  // Agrega otras variables aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}