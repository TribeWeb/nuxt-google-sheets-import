# @tribeweb/nuxt-google-sheets-import

Schema-driven Google Sheets importer for Nuxt Content.

## Status

This package scaffold is extracted from a working local module and is ready for standalone hardening/publishing.

## Features

- Fetches sheet list and values from Google Sheets
- Validates/transforms rows with Zod schemas
- Writes frontmatter markdown, JSON, or YAML output
- Supports overwrite strategies (`overwrite`, `skip`, `overwrite-frontmatter`)
- Exposes UI components and composables for import workflow

## Install (workspace)

```bash
pnpm add @tribeweb/nuxt-google-sheets-import
```

## Configure

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@tribeweb/nuxt-google-sheets-import'],
  googleSheetsImport: {
    apiBase: '/api/google-sheets-import',
    googleApiKeyRuntimeKey: 'googleApiKey',
    schemaRegistryImport: '#imports',
    schemaRegistryExport: 'schemas',
    defaultContentDir: 'content',
    collectionTypeBySchema: {
      machines: 'page',
      materials: 'data'
    }
  }
})
```

## Environment

```bash
NUXT_GOOGLE_API_KEY=your_google_sheets_api_key
```

## Google setup (permissions + API key)

This module currently reads Google Sheets using an API key, so the sheet must be publicly readable.

> Security note:
> API-key access is best suited to non-sensitive sheets that are intentionally shared as `Anyone with the link`.
> For private or sensitive spreadsheets, prefer OAuth 2.0 or a service account flow instead of API-key access.

### 1) Set sheet permissions (Google Sheets)

1. Open your sheet in Google Sheets.
2. Click `Share`.
3. Under `General access`, set to `Anyone with the link`.
4. Set role to `Viewer`.
5. Copy the spreadsheet ID from the URL:
  - `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

If your Google Workspace policy blocks public link sharing, API key access will fail. In that case you need OAuth/service-account based auth (not part of this module yet).

### 2) Create API key (Google Cloud Console)

1. Open Google Cloud Console: https://console.cloud.google.com/
2. Create/select a project.
3. Enable Google Sheets API:
  - https://console.cloud.google.com/apis/library/sheets.googleapis.com
4. Create credentials (API key):
  - https://console.cloud.google.com/apis/credentials
  - Click `Create credentials` → `API key`
5. Restrict the key (recommended):
  - **API restrictions**: `Restrict key` → select `Google Sheets API`
  - **Application restrictions**:
    - Server usage: `IP addresses` (recommended for backend)
    - Browser-only usage: `HTTP referrers` (if applicable)
6. Put the key into `NUXT_GOOGLE_API_KEY`.

### 3) Quick verification

Call your module endpoint with a known sheet ID and confirm it returns tab metadata:

`GET /api/google-sheets-import/sheets?spreadsheetId=<SPREADSHEET_ID>`

### 4) Troubleshooting (common errors)

- `403 PERMISSION_DENIED` / `The caller does not have permission`
  - The sheet is not publicly readable with link.
  - Fix: set `Share` → `General access` → `Anyone with the link` + `Viewer`.

- `403 API key not valid` or `API has not been used in project`
  - The key is wrong, restricted to the wrong API, or Sheets API is not enabled.
  - Fix: enable `Google Sheets API` and ensure key restriction includes it.

- `403 Requests from this referrer/IP are blocked`
  - Your key application restrictions do not match where requests come from.
  - Fix: update key restrictions (`IP addresses` for server use is preferred).

- `404 Requested entity was not found`
  - Spreadsheet ID is incorrect or malformed.
  - Fix: copy ID from `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`.

- `400 Unable to parse range`
  - Invalid A1 range (for example typo in sheet tab or columns).
  - Fix: verify tab name and use ranges like `A:Z`.

## Exported runtime

- Components: `GoogleSheetsImportSource`, `GoogleSheetsImportExecute`, `GoogleSheetsImportSchemaGuide`
- Composables: `useGoogleSheetsImport`, `useGoogleSheetsImportWorkflow`

### Schema helper component

Use `GoogleSheetsImportSchemaGuide` to let editors choose a schema and see the expected Google Sheet column headers.

```vue
<GoogleSheetsImportSchemaGuide />
```

Benefits:

- Reduces import failures by giving editors exact header names before filling a sheet
- Supports nested/array header patterns used by schema mapping (for example `items[0].name`)
- For `page` collections, shows Nuxt Content built-in page override fields and allows copying them separately
- Supports two copy modes:
  - line-by-line copy
  - CSV-row copy (pastes horizontally into Google Sheets)

Optional prop:

- `initialSchema?: string`

## Schema registry

The module resolves Zod schemas from a configurable module import so it does not depend on app-specific paths.

- `schemaRegistryImport` (default: `#imports`)
- `schemaRegistryExport` (default: `schemas`)

Expected shape:

```ts
export const schemas = {
  machines,
  materials
}
```

If your schemas are exported from a custom file, point the module to it:

```ts
export default defineNuxtConfig({
  modules: ['@tribeweb/nuxt-google-sheets-import'],
  googleSheetsImport: {
    schemaRegistryImport: '~/server/google-sheets/schemas',
    schemaRegistryExport: 'schemas'
  }
})
```

## Playground smoke test (`values` + `write`)

The playground includes:

- `playground/server/google-sheets/schemas.ts` (tiny local schema registry)
- `POST /api/google-sheets-import/values-smoke` (local transform/validation payload)
- `playground/scripts/smoke.mjs` (calls `values-smoke`, then module `write` for `frontmatter`, `json`, `yaml`)

Run with Nuxt dev server active:

```bash
pnpm --dir packages/nuxt-google-sheets-import smoke:playground
```

Optional custom base URL:

```bash
SMOKE_BASE_URL=http://localhost:3000 pnpm --dir packages/nuxt-google-sheets-import smoke:playground
```

## Additional API endpoint

- `GET {apiBase}/schema-columns`
  - Query: `schema?`
  - Returns:
    - `schemas`: available schema keys
    - `columns`: expected import header names for selected schema
    - `collectionType`: `page | data | unknown`
    - `pageOverrideColumns`: Nuxt Content page override fields (when `collectionType === 'page'`)

## Publish checklist

- Add playground integration tests for `/values` and `/write`
- Add CI (`lint`, `typecheck`, `build`) and release workflow
- Verify Nuxt 4 peer compatibility matrix

## Publish (next step)

```bash
pnpm --dir packages/nuxt-google-sheets-import release:check
```

Then authenticate and publish:

```bash
npm login
pnpm --dir packages/nuxt-google-sheets-import publish --access public
```

Or use one-command release scripts (bumps version + checks + publishes):

```bash
npm login
pnpm --dir packages/nuxt-google-sheets-import release:patch
# or: release:minor / release:major
```

These scripts use `npm version --no-git-tag-version`, so they update `package.json` version without creating a git tag/commit.
