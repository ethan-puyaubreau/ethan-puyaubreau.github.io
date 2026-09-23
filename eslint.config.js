import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import vue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "playwright-report/",
      "test-results/",
      ".lighthouseci/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...astro.configs.recommended,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  prettier,
  {
    rules: {
      // TypeScript and the Astro/Vue compilers resolve identifiers; the core
      // rule only produces false positives on DOM/WebGPU globals here.
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
