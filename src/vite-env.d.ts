// Type definitions for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


// Shim for CSS module imports.
// The original `/// <reference types="vite/client" />` was removed
// as it was causing a type resolution error in the build environment.
declare module '*.css';
