import { readFile } from 'node:fs/promises'
import path from 'node:path'

type CollectionType = 'page' | 'data'

let cachedCollectionTypeBySchema: Record<string, CollectionType> | null = null

function normalizeSchemaKey(key: string): string[] {
  const trimmed = key.trim()
  const lower = trimmed.toLowerCase()
  const snake = trimmed.replace(/[-\s]+/g, '_').toLowerCase()
  return Array.from(new Set([trimmed, lower, snake]))
}

function setCollectionType(map: Record<string, CollectionType>, key: string, type: CollectionType) {
  for (const normalized of normalizeSchemaKey(key)) {
    map[normalized] = type
  }
}

function mergeCollectionTypeMaps(
  base: Record<string, CollectionType>,
  additional: Record<string, CollectionType>,
): Record<string, CollectionType> {
  return {
    ...base,
    ...additional,
  }
}

function parseManifestSource(source: string): { collectionTypeBySchema: Record<string, CollectionType>, schemas: string[] } {
  const result: Record<string, CollectionType> = {}
  const schemas = new Set<string>()
  const defaultExportIndex = source.indexOf('export default')
  const manifestCollectionsSource = defaultExportIndex === -1
    ? source
    : source.slice(defaultExportIndex)
  const collectionTypeMatches = manifestCollectionsSource.matchAll(/"([^"\n]+)"\s*:\s*\{[\s\S]{0,500}?"type"\s*:\s*"(page|data)"/g)

  for (const match of collectionTypeMatches) {
    const collectionName = match[1]
    const collectionType = match[2] as CollectionType

    if (collectionName) {
      schemas.add(collectionName)
      setCollectionType(result, collectionName, collectionType)
    }
  }

  return {
    collectionTypeBySchema: result,
    schemas: Array.from(schemas).sort((left, right) => left.localeCompare(right)),
  }
}

async function readManifestData(): Promise<{ collectionTypeBySchema: Record<string, CollectionType>, schemas: string[] }> {
  const candidates = [
    path.resolve(process.cwd(), '.nuxt/content/manifest.ts'),
    path.resolve(process.cwd(), '.nuxt/content/manifest.mjs'),
  ]

  for (const manifestPath of candidates) {
    try {
      const source = await readFile(manifestPath, 'utf-8')
      return parseManifestSource(source)
    }
    catch {
      // Try the next candidate path.
    }
  }

  return {
    collectionTypeBySchema: {},
    schemas: [],
  }
}

async function readCollectionTypeBySchema(): Promise<Record<string, CollectionType>> {
  if (cachedCollectionTypeBySchema) {
    return cachedCollectionTypeBySchema
  }

  const fromManifest = await readManifestData()
  cachedCollectionTypeBySchema = fromManifest.collectionTypeBySchema
  return cachedCollectionTypeBySchema
}

export async function resolveCollectionTypeBySchema(
  schemaKey: string | undefined,
  collectionTypeBySchemaFromConfig: Record<string, CollectionType>,
): Promise<CollectionType | 'unknown'> {
  if (!schemaKey) {
    return 'unknown'
  }

  const mappedFromNuxt = await readCollectionTypeBySchema()
  const map = mergeCollectionTypeMaps(mappedFromNuxt, collectionTypeBySchemaFromConfig)

  const normalizedSchemaKey = schemaKey.trim()
  const collectionType = normalizeSchemaKey(normalizedSchemaKey)
    .map(key => map[key])
    .find((value): value is CollectionType => value === 'page' || value === 'data')

  return collectionType ?? 'unknown'
}
