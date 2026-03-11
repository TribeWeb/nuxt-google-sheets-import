---
seo:
  title: Nuxt Google Sheets Import
  description: Schema-driven Google Sheets import and export workflows for Nuxt Content.
---

::u-page-hero
#title
Nuxt Google Sheets Import

#description
Schema-driven Google Sheets import/export workflows for Nuxt Content projects.

Bulk-edit frontmatter in spreadsheets, validate with Zod, then write back to markdown, JSON, or YAML.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /getting-started/introduction
  trailing-icon: i-lucide-arrow-right
  ---
  Read introduction
  :::

  :::u-button
  ---
  color: neutral
  icon: i-lucide-github
  size: xl
  to: /getting-started/installation
  variant: outline
  ---
  Installation
  :::
::

::u-page-section
#title
Core capabilities

#features
  :::u-page-feature
  ---
  icon: i-lucide-list-checks
  ---
  #title
  Schema-driven transforms

  #description
  Validate and coerce row data using your Nuxt Content Zod schemas.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-file-text
  ---
  #title
  Content write targets

  #description
  Write output as markdown frontmatter, JSON, or YAML.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-columns-3
  ---
  #title
  Import + export workflow

  #description
  Use the built-in `/google-sheets-import` page with setup, import, and export tabs.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-clipboard-paste
  ---
  #title
  Google Sheets-friendly export

  #description
  Copy tab-separated rows for direct Sheets paste, or download quoted CSV.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-refresh-cw
  ---
  #title
  Overwrite strategies

  #description
  Control write behavior with `overwrite`, `skip`, or `overwrite-frontmatter`.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-database-zap
  ---
  #title
  Collection-aware behavior

  #description
  Resolve `page` vs `data` collection types from Nuxt Content and surface matching schema columns.
  :::
::
