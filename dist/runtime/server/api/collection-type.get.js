import { z } from "zod";
import { resolveCollectionTypeBySchema } from "../utils/collectionType.js";
const querySchema = z.object({
  schema: z.string().optional()
});
export default defineEventHandler(async (event) => {
  const { schema } = await getValidatedQuery(event, (query) => querySchema.parse(query));
  const config = useRuntimeConfig(event);
  const moduleConfig = config.googleSheetsImport;
  const fromConfig = moduleConfig.collectionTypeBySchema ?? {};
  const collectionType = await resolveCollectionTypeBySchema(schema, fromConfig);
  const baseContentDir = collectionType === "page" ? "content" : collectionType === "data" ? "content/data" : moduleConfig.defaultContentDir;
  return {
    schema: schema ?? null,
    collectionType,
    baseContentDir
  };
});
