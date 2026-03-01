type CollectionType = 'page' | 'data';
export declare function resolveCollectionTypeBySchema(schemaKey: string | undefined, collectionTypeBySchemaFromConfig: Record<string, CollectionType>): Promise<CollectionType | 'unknown'>;
export {};
