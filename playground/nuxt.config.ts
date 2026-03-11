export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/content',
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    googleApiKey: '',
  },
  compatibilityDate: 'latest',
  googleSheetsImport: {
    apiBase: '/api/google-sheets-import',
    defaultContentDir: 'content',
  },
})
