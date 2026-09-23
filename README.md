# ethan-puyaubreau.github.io

Portfolio of **Ethan Puyaubreau**, high-performance computing & infrastructure engineer.
Astro 6, static output, Vue 3 islands, deployed to GitHub Pages.

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build         # static output → dist/
npm run preview       # serve the built site
```

Quality gates (all must be clean; CI enforces them):

```bash
npm run lint          # eslint, zero warnings
npm run typecheck     # astro check + vue-tsc
npm run format:check  # prettier
npm test              # playwright smoke tests
```

## Notes for maintainers

- **Origin**: centralised in [`site.config.mjs`](site.config.mjs), imported by both
  `astro.config.mjs` and `src/lib/site.ts`. A custom domain is a one-line change there.
- **`build.format: "file"`**: GitHub Pages 301-redirects an extensionless URL to its
  trailing-slash form when it finds a directory (Astro's default `build.format`). This site
  runs `trailingSlash: "never"`, so output is emitted as `path.html` instead, served directly.
  `Astro.url.pathname` reflects that `.html` suffix at build time; see the `cleanPathname()`
  helper in `src/lib/i18n.ts`.
- **`public/.nojekyll`**: required. `build.assets` is `"_assets"`, and GitHub Pages' default
  Jekyll processing strips underscore-prefixed directories without this file.
- **`/cluster`**: the numbers are a build-time snapshot of the homelab's own telemetry
  endpoint (`src/data/cluster-snapshot.json`), not a live poll: this site stays static and
  makes no cross-origin request. To refresh the snapshot, regenerate that file by hand from
  the endpoint and rebuild.
- **No analytics**: deliberately.

## License

MIT — see [`LICENSE`](LICENSE).
