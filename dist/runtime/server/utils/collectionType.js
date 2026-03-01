import { readFile } from "node:fs/promises";
import path from "node:path";
let cachedCollectionTypeBySchema = null;
function normalizeSchemaKey(key) {
  const trimmed = key.trim();
  const lower = trimmed.toLowerCase();
  const snake = trimmed.replace(/[-\s]+/g, "_").toLowerCase();
  return Array.from(/* @__PURE__ */ new Set([trimmed, lower, snake]));
}
function setCollectionType(map, key, type) {
  for (const normalized of normalizeSchemaKey(key)) {
    map[normalized] = type;
  }
}
async function readCollectionTypeBySchemaFromContentConfig() {
  if (cachedCollectionTypeBySchema) {
    return cachedCollectionTypeBySchema;
  }
  const result = {};
  try {
    const contentConfigPath = path.resolve(process.cwd(), "content.config.ts");
    const source = await readFile(contentConfigPath, "utf-8");
    const collectionTypeMatches = source.matchAll(/(\w+)\s*:\s*defineCollection\([\s\S]{0,900}?type:\s*['"](page|data)['"]/g);
    for (const match of collectionTypeMatches) {
      const collectionName = match[1];
      const collectionType = match[2];
      if (collectionName) {
        setCollectionType(result, collectionName, collectionType);
      }
    }
    const schemaTypeMatches = source.matchAll(/type:\s*['"](page|data)['"][\s\S]{0,900}?schema:\s*schemas\.(\w+)/g);
    for (const match of schemaTypeMatches) {
      const collectionType = match[1];
      const schemaKey = match[2];
      if (schemaKey) {
        setCollectionType(result, schemaKey, collectionType);
      }
    }
  } catch {
    cachedCollectionTypeBySchema = {};
    return cachedCollectionTypeBySchema;
  }
  cachedCollectionTypeBySchema = result;
  return cachedCollectionTypeBySchema;
}
export async function resolveCollectionTypeBySchema(schemaKey, collectionTypeBySchemaFromConfig) {
  if (!schemaKey) {
    return "unknown";
  }
  const mappedInContentConfig = await readCollectionTypeBySchemaFromContentConfig();
  const map = {
    ...mappedInContentConfig,
    ...collectionTypeBySchemaFromConfig
  };
  const normalizedSchemaKey = schemaKey.trim();
  const collectionType = normalizeSchemaKey(normalizedSchemaKey).map((key) => map[key]).find((value) => value === "page" || value === "data");
  return collectionType ?? "unknown";
}
