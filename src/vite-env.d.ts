// Shim for CSS module imports.
// The original `/// <reference types="vite/client" />` was removed
// as it was causing a type resolution error in the build environment.
declare module '*.css';

// The rest of the file's original content is preserved below.
// It defines an environment variable that does not appear to be in use.
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
