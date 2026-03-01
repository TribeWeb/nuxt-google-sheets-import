import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'
  interface SharedRuntimeConfig {
   app: {
      buildId: string,

      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   nitro: {
      envPrefix: string,
   },

   googleSheetsImport: {
      apiBase: string,

      googleApiKeyRuntimeKey: string,

      defaultContentDir: string,

      collectionTypeBySchema: {
         machinesSmoke: string,

         machinessmoke: string,

         machines: string,

         materials: string,
      },

      schemaRegistryImport: string,

      schemaRegistryExport: string,
   },
  }
  interface SharedPublicRuntimeConfig {
   googleSheetsImport: {
      apiBase: string,

      defaultContentDir: string,

      collectionTypeBySchema: {
         machinesSmoke: string,

         machinessmoke: string,

         machines: string,

         materials: string,
      },
   },
  }
declare module '@nuxt/schema' {
  interface RuntimeConfig extends UserRuntimeConfig {}
  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}
}
declare module 'nuxt/schema' {
  interface RuntimeConfig extends SharedRuntimeConfig {}
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}
}
declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }