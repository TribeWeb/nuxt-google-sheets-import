import { z } from "zod";
import { writeRecordAsFrontmatter } from "../utils/writeFrontmatter.js";
import { resolveCollectionTypeBySchema } from "../utils/collectionType.js";
const bodySchema = z.object({
  records: z.array(z.record(z.string(), z.unknown())),
  schema: z.string().optional(),
  folder: z.string().min(1),
  slugKey: z.string().min(1),
  orderKey: z.string().optional(),
  contentDir: z.string().optional(),
  outputFormat: z.enum(["frontmatter", "json", "yaml"]).optional().default("frontmatter"),
  overwriteMode: z.enum(["skip", "overwrite", "overwrite-frontmatter"]).optional().default("overwrite")
});
function resolveContentDirByCollectionType(collectionType, schemaKey, fallback) {
  if (collectionType === "page") {
    return "content";
  }
  if (collectionType === "data") {
    return "content/data";
  }
  if (!schemaKey) {
    return fallback;
  }
  const normalizedSchemaKey = schemaKey.trim();
  console.warn(
    `[google-sheets-import] No collection type mapping found for schema "${normalizedSchemaKey}". Using fallback content directory "${fallback}". Add googleSheetsImport.collectionTypeBySchema["` + normalizedSchemaKey + '"] in nuxt.config.ts to route writes automatically.'
  );
  return fallback;
}
export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event));
  const config = useRuntimeConfig(event);
  const moduleConfig = config.googleSheetsImport;
  const mappedInConfig = moduleConfig.collectionTypeBySchema ?? {};
  const resolvedCollectionType = await resolveCollectionTypeBySchema(body.schema, mappedInConfig);
  const resolvedContentDir = body.contentDir ?? resolveContentDirByCollectionType(resolvedCollectionType, body.schema, moduleConfig.defaultContentDir);
  const logs = [];
  const summary = {
    written: 0,
    overwritten: 0,
    skipped: 0
  };
  for (const record of body.records) {
    const result = await writeRecordAsFrontmatter({
      record,
      baseContentDir: resolvedContentDir,
      folder: body.folder,
      slugKey: body.slugKey,
      orderKey: body.orderKey,
      outputFormat: body.outputFormat,
      overwriteMode: body.overwriteMode
    });
    logs.push(result.filePath);
    summary[result.action]++;
  }
  return {
    count: logs.length,
    logs,
    contentDir: resolvedContentDir,
    summary
  };
});
