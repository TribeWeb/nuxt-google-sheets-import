import { createJiti } from "file:///Users/richardstephenson/LocalProjects/nuxt-google-sheets-import/node_modules/.pnpm/jiti@2.6.1/node_modules/jiti/lib/jiti.mjs";

const jiti = createJiti(import.meta.url, {
  "interopDefault": true,
  "alias": {
    "nuxt-google-sheets-import": "/Users/richardstephenson/LocalProjects/nuxt-google-sheets-import"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("/Users/richardstephenson/LocalProjects/nuxt-google-sheets-import/src/module.js")} */
const _module = await jiti.import("/Users/richardstephenson/LocalProjects/nuxt-google-sheets-import/src/module.ts");

export default _module?.default ?? _module;