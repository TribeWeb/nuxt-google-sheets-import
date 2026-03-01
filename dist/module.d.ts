import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    apiBase: string;
    googleApiKeyRuntimeKey: string;
    defaultContentDir: string;
    collectionTypeBySchema: Record<string, 'page' | 'data'>;
    schemaRegistryImport: string;
    schemaRegistryExport: string;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
