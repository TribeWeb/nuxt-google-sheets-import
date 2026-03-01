declare module 'nuxt/schema' {
  interface RuntimeConfig {
    googleSheetsImport?: {
      apiBase?: string
      googleApiKeyRuntimeKey?: string
      defaultContentDir?: string
      collectionTypeBySchema?: Record<string, 'page' | 'data'>
      schemaRegistryImport?: string
      schemaRegistryExport?: string
    }
  }

  interface PublicRuntimeConfig {
    googleSheetsImport?: {
      apiBase?: string
      defaultContentDir?: string
      collectionTypeBySchema?: Record<string, 'page' | 'data'>
    }
  }
}

declare global {
  const defineEventHandler: typeof import('h3')['defineEventHandler']
  const getValidatedQuery: typeof import('h3')['getValidatedQuery']
  const readBody: typeof import('h3')['readBody']
  const useRuntimeConfig: (...args: any[]) => {
    public: {
      googleSheetsImport?: {
        apiBase?: string
        defaultContentDir?: string
        collectionTypeBySchema?: Record<string, 'page' | 'data'>
      }
    }
    googleSheetsImport?: {
      apiBase?: string
      googleApiKeyRuntimeKey?: string
      defaultContentDir?: string
      collectionTypeBySchema?: Record<string, 'page' | 'data'>
      schemaRegistryImport?: string
      schemaRegistryExport?: string
    }
  }
  const createError: typeof import('h3')['createError']

  const ref: typeof import('vue')['ref']
  const reactive: typeof import('vue')['reactive']
  const computed: typeof import('vue')['computed']
  const watch: typeof import('vue')['watch']
  const onMounted: typeof import('vue')['onMounted']
  const toValue: typeof import('vue')['toValue']

  const useToast: (...args: any[]) => any
  const useGoogleSheetsImport: typeof import('../composables/useGoogleSheetsImport')['useGoogleSheetsImport']
  const useGoogleSheetsImportWorkflow: typeof import('../composables/useGoogleSheetsImportWorkflow')['useGoogleSheetsImportWorkflow']
}

export {}
