# nuxt-google-sheets-import

Schema-driven Google Sheets importer for Nuxt Content.

## Status

Nuxt module for schema-driven Google Sheets import/export workflows with Nuxt Content.

## Features

- Fetches sheet list and values from Google Sheets
- Validates/transforms rows with Zod schemas
- Writes frontmatter markdown, JSON, or YAML output
- Supports overwrite strategies (`overwrite`, `skip`, `overwrite-frontmatter`)
- Exposes UI components and composables for import workflow
- Includes a built-in `/google-sheets-import` page with tabbed setup/import/export flow
- Supports TSV clipboard copy for Google Sheets-friendly paste

## Install

```bash
pnpm add nuxt-google-sheets-import
```

## Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-google-sheets-import'],
  googleSheetsImport: {
    apiBase: '/api/google-sheets-import',
    googleApiKeyRuntimeKey: 'googleApiKey',
    defaultContentDir: 'content/data'
  }
})
```

Collection type (`page` vs `data`) is derived from your Nuxt Content `content.config.ts` collections.

## Environment

```bash
NUXT_GOOGLE_API_KEY=your_google_sheets_api_key
```

## Quick Start

1. Add the module and runtime env var.
2. Define your Zod `schemas` export in `~/utils/googleSheetImportSchemas.ts`.
3. Ensure matching Nuxt Content collections exist in `content.config.ts`.
4. Start dev server and open `/google-sheets-import`.
5. Use tabs in order:
   - `Setup Google Sheet`: confirm schema headers and copy as needed.
   - `Import data`: load sheet rows and write content files.
   - `Export data`: query existing records, copy TSV for Sheets, or download CSV.

Quick endpoint check:

`GET /api/google-sheets-import/sheets?spreadsheetId=<SPREADSHEET_ID>`

## Exported runtime

- Components: `GoogleSheetsImportSource`, `GoogleSheetsImportExecute`, `GoogleSheetsImportSchemaGuide`, `GoogleSheetsImportExport`
- Composables: `useGoogleSheetsImport`, `useGoogleSheetsImportWorkflow`

The module adds a route at `/google-sheets-import` with `UTabs` for:

- `Setup Google Sheet` (schema guide)
- `Import data` (sheet source/import flow)
- `Export data` (export existing content records)

### Schema helper component

Use `GoogleSheetsImportSchemaGuide` to let editors choose a schema and see the expected Google Sheet column headers.

```vue
<GoogleSheetsImportSchemaGuide />
```

Benefits:

- Reduces import failures by giving editors exact header names before filling a sheet
- Supports nested/array header patterns used by schema mapping (for example `items[0].name`)
- Uses a single column for arrays of scalar values (for example `tags` with `foo, bar, baz`)
- For `page` collections, shows Nuxt Content built-in page override fields and allows copying them separately
- Supports two copy modes:
  - line-by-line copy
  - tab-separated row copy (pastes horizontally into Google Sheets)

Optional prop:

- `initialSchema?: string`

### Suggested Cell Examples

Use these value patterns when filling sheets:

- `string`: `example text`
- `number`: `123`
- `boolean`: `true` or `false`
- `enum` / `literal`: use one of the schema's allowed values
- `date-like string`: `2026-01-01`
- `string[]` (scalar array): `foo, bar, baz` in a single cell
- `object[]` (array of objects): use indexed headers like `items[0].name`, `items[0].price`

## Schema Source

Define a `schemas` export in `~/utils/googleSheetImportSchemas.ts`.
The module auto-imports this as `googleSheetsImportSchemas` for app and server runtime use.

Example:

```ts
export const schemas = {
  machines,
  materials
}
```

## Export Behavior

- `Copy for Google Sheets` in `GoogleSheetsImportExport` copies **TSV** to the clipboard for reliable Sheets paste.
- `Download .csv` provides quoted CSV output for file-based workflows.

## Additional API Endpoint

- `GET {apiBase}/schema-columns`
  - Query: `schema?`
  - Returns:
    - `schemas`: available schema keys
    - `columns`: expected import header names for selected schema
    - `collectionType`: `page | data | unknown`
    - `pageOverrideColumns`: Nuxt Content page override fields (when `collectionType === 'page'`)

## Google Setup (Permissions + API Key)

This module reads Google Sheets using an API key, so the sheet must be publicly readable.

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
  - Click `Create credentials` -> `API key`
5. Restrict the key (recommended):
  - **API restrictions**: `Restrict key` -> select `Google Sheets API`
  - **Application restrictions**:
    - Server usage: `IP addresses` (recommended for backend)
    - Browser-only usage: `HTTP referrers` (if applicable)
6. Put the key into `NUXT_GOOGLE_API_KEY`.

### 3) Troubleshooting (common errors)

- `403 PERMISSION_DENIED` / `The caller does not have permission`
  - The sheet is not publicly readable with link.
  - Fix: set `Share` -> `General access` -> `Anyone with the link` + `Viewer`.

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

## Publish checklist

- Add playground integration tests for `/values` and `/write`
- Add CI (`lint`, `typecheck`, `build`) and release workflow
- Verify Nuxt 4 peer compatibility matrix

## Release

```bash
npm run release
```

If needed, authenticate and publish manually:

```bash
npm login
npm publish --access public
```
