import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: ['src/module'],
  externals: ['nuxt', '@nuxt/kit']
})
