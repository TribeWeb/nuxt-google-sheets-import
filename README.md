# nuxt-google-sheets-import

Schema-driven Google Sheets import and export workflows for Nuxt Content.

## Documentation

Project documentation now lives in the Docus site under [docs/content](docs/content).

- Intro: [docs/content/1.getting-started/2.introduction.md](docs/content/1.getting-started/2.introduction.md)
- Installation: [docs/content/1.getting-started/3.installation.md](docs/content/1.getting-started/3.installation.md)

Use this root README as a repo quick-start and contributor guide. Keep long-form user documentation in the docs site.

## Module Quick Start

Install:

```bash
pnpm add nuxt-google-sheets-import
```

Enable the module:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-google-sheets-import'],
  googleSheetsImport: {
    apiBase: '/api/google-sheets-import',
    defaultContentDir: 'content/data'
  }
})
```

Environment:

```bash
NUXT_GOOGLE_API_KEY=your_google_sheets_api_key
```

## What The Module Provides

- A built-in route at `/google-sheets-import`
- Tabbed workflow with schema setup, import, and export steps
- Zod schema-driven row validation/transforms
- Writes to markdown frontmatter, JSON, and YAML
- Export helpers:
  - copy TSV to clipboard for Google Sheets paste
  - download CSV

Collection type (`page` vs `data`) is resolved from your Nuxt Content collections.

## Schema Source

Define and export `schemas` in `~/utils/googleSheetImportSchemas.ts`.
The module auto-imports it as `googleSheetsImportSchemas` in app and server runtime.

```ts
export const schemas = {
  machines,
  materials
}
```

## Repository Development

Module development:

```bash
npm install
npm run dev:prepare
npm run test
```

Playground app:

```bash
npm run dev
```

Docs site:

```bash
cd docs
npm install
npm run dev
```
