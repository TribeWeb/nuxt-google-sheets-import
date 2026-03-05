import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the injected import page', async () => {
    // Validate the route added by the module via extendPages.
    const html = await $fetch('/google-sheets-import')
    expect(html).toContain('<div>basic</div>')
  })
})
