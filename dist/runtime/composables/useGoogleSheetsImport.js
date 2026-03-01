export function useGoogleSheetsImport() {
  const config = useRuntimeConfig();
  const apiBase = config.public.googleSheetsImport?.apiBase ?? "/api/google-sheets-import";
  const getSheets = async (spreadsheetId) => {
    const response = await $fetch(`${apiBase}/sheets`, {
      query: { spreadsheetId }
    });
    return response.sheets;
  };
  const getValues = async (payload) => {
    return await $fetch(`${apiBase}/values`, {
      method: "POST",
      body: payload
    });
  };
  const getCollectionType = async (schema) => {
    return await $fetch(`${apiBase}/collection-type`, {
      query: { schema }
    });
  };
  const writeFiles = async (payload) => {
    return await $fetch(`${apiBase}/write`, {
      method: "POST",
      body: payload
    });
  };
  return {
    getSheets,
    getValues,
    getCollectionType,
    writeFiles
  };
}
