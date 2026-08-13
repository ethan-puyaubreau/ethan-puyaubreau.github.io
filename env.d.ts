/// <reference types="astro/client" />
/// <reference types="@webgpu/types" />

interface ImportMetaEnv {
  /** Short commit SHA injected at build time; shown in the footer. */
  readonly PUBLIC_BUILD_SHA?: string;
  /** ISO build timestamp injected at build time. */
  readonly PUBLIC_BUILD_TIME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
