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
    googleSheets: [
      { id: '1NKS0cTX6u5urtgQ3Q4Z2motiR2-9JmyPxcd05yVc1bc', label: 'Metzner' },
      { id: '1tGZCEoiikXfg3mOpfVWWTS1SSSsj18xv6Z3owrnnt4s', label: 'Example Sheet' },
    ],
  },
})
