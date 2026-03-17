# nuxt-google-sheets-import

> Schema-driven Google Sheets import and export workflows for Nuxt Content.

## Documentation

- Main docs: [nuxt-google-sheets-import.netlify.app](https://nuxt-google-sheets-import.netlify.app/)
- Local docs source: [docs/content](docs/content)

> [!TIP]
> For setup, runtime/API details, and workflow guides, use the hosted docs as the primary reference.

## Features

- 📥 **Import from Google Sheets** - Pull tabular data into Nuxt Content collections.
- ✅ **Zod Validation** - Validate and coerce row values against your schemas.
- 🧭 **Guided Workflow UI** - Built-in page with setup, import, and export tabs.
- 📝 **Multi-format Writes** - Write markdown frontmatter, JSON, or YAML.
- 🔁 **Overwrite Strategies** - Skip, full overwrite, or frontmatter-only overwrite.
- 📤 **Export Helpers** - Copy TSV for Sheets paste or download CSV.
- 🧱 **Nuxt Content Aware** - Resolves collection behavior for page/data collections.

## Quick Start

Install and enable the module:

```bash
pnpm add nuxt-google-sheets-import
```

```ts
export default defineNuxtConfig({
  modules: ['nuxt-google-sheets-import'],
  googleSheetsImport: {
    apiBase: '/api/google-sheets-import',
    defaultContentDir: 'content/data',
  }
})
```

Set your Google API key:

```bash
NUXT_GOOGLE_API_KEY=your_google_sheets_api_key
```

Then open `/google-sheets-import` in your app.

## Repository Development

Development commands:

```bash
npm install
npm run dev:prepare
npm run test
```

Playground:

```bash
npm run dev
```

Docs (local):

```bash
cd docs
npm install
npm run dev
```
