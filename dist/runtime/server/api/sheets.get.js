import { z } from "zod";
import { columnCountToRange, getByPath } from "../utils/googleSheets.js";
const querySchema = z.object({
  spreadsheetId: z.string().length(44)
});
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const moduleConfig = config.googleSheetsImport;
  const { spreadsheetId } = await getValidatedQuery(event, (query) => querySchema.parse(query));
  const apiKey = getByPath(config, moduleConfig.googleApiKeyRuntimeKey);
  if (!apiKey || typeof apiKey !== "string") {
    throw createError({ statusCode: 500, statusMessage: `Missing Google API key at runtimeConfig.${moduleConfig.googleApiKeyRuntimeKey}` });
  }
  const response = await $fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`);
  return {
    spreadsheetId,
    sheets: (response.sheets ?? []).map((sheet) => {
      const columnCount = sheet.properties?.gridProperties?.columnCount ?? 1;
      return {
        label: sheet.properties?.title ?? "",
        range: columnCountToRange(columnCount)
      };
    }).filter((sheet) => sheet.label)
  };
});
