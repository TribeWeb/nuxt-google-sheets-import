// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-studio', '@nuxt/content'],
  // modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Nuxt Google Sheets Import',
  },
  studio: {
    repository: {
      provider: 'github',
      owner: 'tribeweb',
      repo: 'nuxt-google-sheets-import',
    },
    ai: {
      context: {
        title: 'Nuxt Google Sheets Import',
        description: 'A Nuxt module to import content from Google Sheets into Nuxt Content collections, with support for Zod schema validation and transformation.',
        style: 'In British English, technical and detailed, with practical examples',
        tone: 'Friendly and factual tone, with a focus on clarity and helpfulness.',
      },
    },
  },
})
