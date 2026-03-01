export function useGoogleSheetsImportWorkflow(options = {}) {
  const { getSheets, getValues, getCollectionType, writeFiles } = useGoogleSheetsImport();
  const config = useRuntimeConfig();
  const defaultContentDir = computed(
    () => config.public.googleSheetsImport?.defaultContentDir ?? "content/data"
  );
  const sourceStatus = ref("idle");
  const sourceError = ref("");
  const sheetTitles = ref([]);
  const source = reactive({
    spreadsheetId: void 0,
    sheetTitle: void 0,
    range: void 0,
    schema: void 0
  });
  const upperCaseRange = computed({
    get: () => source.range,
    set: (value) => {
      source.range = value?.toUpperCase() || "";
    }
  });
  const selectedSheetPreview = computed(
    () => sheetTitles.value.find((sheet) => sheet.label === source.sheetTitle)
  );
  const sourceQuery = computed(() => {
    if (!source.spreadsheetId || !source.sheetTitle || !source.range || !source.schema) {
      return null;
    }
    return {
      spreadsheetId: source.spreadsheetId,
      sheetTitle: source.sheetTitle,
      range: source.range,
      schema: source.schema
    };
  });
  const externalQuery = computed(() => {
    if (!options.query) {
      return null;
    }
    const value = toValue(options.query);
    return value ?? null;
  });
  const activeQuery = computed(() => externalQuery.value ?? sourceQuery.value);
  const canLoadValues = computed(() => Boolean(activeQuery.value));
  const selectedCollectionType = ref("unknown");
  const selectedCollectionTypeStatus = ref("idle");
  async function refreshCollectionType() {
    const schema = activeQuery.value?.schema?.trim();
    if (!schema) {
      selectedCollectionType.value = "unknown";
      selectedCollectionTypeStatus.value = "idle";
      return;
    }
    selectedCollectionTypeStatus.value = "pending";
    try {
      const resolved = await getCollectionType(schema);
      selectedCollectionType.value = resolved.collectionType;
      selectedCollectionTypeStatus.value = "success";
    } catch {
      selectedCollectionType.value = "unknown";
      selectedCollectionTypeStatus.value = "error";
    }
  }
  watch(() => activeQuery.value?.schema, async () => {
    await refreshCollectionType();
  }, { immediate: true });
  async function loadSheetTitles(spreadsheetId) {
    if (!spreadsheetId) {
      return;
    }
    sourceStatus.value = "pending";
    sourceError.value = "";
    try {
      sheetTitles.value = await getSheets(spreadsheetId);
      sourceStatus.value = "success";
    } catch (error) {
      sourceStatus.value = "error";
      sheetTitles.value = [];
      sourceError.value = error instanceof Error ? error.message : "Failed to retrieve Google Sheet titles.";
    }
  }
  watch(() => source.spreadsheetId, async (spreadsheetId, previousSpreadsheetId) => {
    if (spreadsheetId !== previousSpreadsheetId) {
      source.sheetTitle = void 0;
      source.range = void 0;
      source.schema = void 0;
      await loadSheetTitles(spreadsheetId);
    }
  });
  watch(() => source.sheetTitle, () => {
    if (!source.range) {
      source.range = sheetTitles.value.find((sheet) => sheet.label === source.sheetTitle)?.range;
    }
    if (source.sheetTitle && !source.schema) {
      source.schema = source.sheetTitle.replace(/ /g, "_");
    }
  });
  const status = ref("idle");
  const writeStatus = ref("idle");
  const importError = ref("");
  const writeError = ref("");
  const writeSummary = ref({
    written: 0,
    overwritten: 0,
    skipped: 0
  });
  const values = ref([]);
  const validationErrors = ref([]);
  const logs = ref([]);
  const writeFile = reactive({
    folder: kebabize(activeQuery.value?.sheetTitle ?? source.sheetTitle ?? ""),
    slug: void 0,
    order: void 0,
    outputFormat: "frontmatter",
    overwriteMode: "overwrite"
  });
  const resolvedBaseContentDir = computed(() => {
    if (selectedCollectionType.value === "page") {
      return "content";
    }
    if (selectedCollectionType.value === "data") {
      return "content/data";
    }
    return defaultContentDir.value;
  });
  const resolvedDestinationPath = computed(() => {
    const folder = writeFile.folder?.trim();
    return folder ? `${resolvedBaseContentDir.value}/${folder}` : resolvedBaseContentDir.value;
  });
  watch(activeQuery, (query) => {
    if (query?.sheetTitle && !writeFile.folder) {
      writeFile.folder = kebabize(query.sheetTitle);
    }
  }, { immediate: true });
  const columnList = computed(() => {
    const unique = /* @__PURE__ */ new Set();
    for (const record of values.value) {
      collectKeys(record).forEach((key) => unique.add(key));
    }
    return [...unique];
  });
  const productsLength = computed(() => values.value.length);
  const logsLength = computed(() => logs.value.length);
  const canWrite = computed(() => Boolean(values.value.length && writeFile.slug && writeFile.folder && writeStatus.value !== "pending"));
  const previewRows = computed(() => values.value.slice(0, 5));
  const shownValidationErrors = computed(() => validationErrors.value.slice(0, 20));
  watch(columnList, (keys) => {
    if (!keys.length) {
      return;
    }
    if (!writeFile.slug) {
      const slugCandidate = keys.find((key) => /(^|\.)slug$|(^|\.)id$|(^|\.)modelId$/i.test(key));
      writeFile.slug = slugCandidate ?? keys[0];
    }
    if (!writeFile.order) {
      const orderCandidate = keys.find((key) => /(^|\.)order$|(^|\.)pageOrder$/i.test(key));
      writeFile.order = orderCandidate;
    }
  }, { immediate: true });
  async function loadValues(queryArg) {
    const query = queryArg ?? activeQuery.value;
    if (!query) {
      return;
    }
    status.value = "pending";
    validationErrors.value = [];
    importError.value = "";
    writeStatus.value = "idle";
    writeError.value = "";
    writeSummary.value = { written: 0, overwritten: 0, skipped: 0 };
    logs.value = [];
    try {
      const response = await getValues(query);
      values.value = response.records;
      validationErrors.value = response.errors;
      status.value = "success";
    } catch (error) {
      status.value = "error";
      values.value = [];
      importError.value = error instanceof Error ? error.message : "Could not load values from Google Sheets.";
    }
  }
  async function writeValues() {
    if (!canWrite.value || !writeFile.slug || !writeFile.folder) {
      return;
    }
    writeStatus.value = "pending";
    writeError.value = "";
    try {
      const response = await writeFiles({
        records: values.value,
        schema: activeQuery.value?.schema,
        folder: writeFile.folder,
        slugKey: writeFile.slug,
        orderKey: writeFile.order,
        outputFormat: writeFile.outputFormat,
        overwriteMode: writeFile.overwriteMode
      });
      logs.value = response.logs;
      writeSummary.value = response.summary;
      writeStatus.value = "success";
    } catch (error) {
      writeStatus.value = "error";
      writeError.value = error instanceof Error ? error.message : "Could not write files.";
    }
  }
  return {
    source,
    sourceStatus,
    sourceError,
    sheetTitles,
    upperCaseRange,
    selectedSheetPreview,
    sourceQuery,
    activeQuery,
    canLoadValues,
    selectedCollectionType,
    selectedCollectionTypeStatus,
    resolvedBaseContentDir,
    resolvedDestinationPath,
    loadSheetTitles,
    status,
    writeStatus,
    importError,
    writeError,
    writeSummary,
    values,
    validationErrors,
    logs,
    writeFile,
    columnList,
    productsLength,
    logsLength,
    canWrite,
    previewRows,
    shownValidationErrors,
    loadValues,
    writeValues
  };
}
function kebabize(str) {
  return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
}
function collectKeys(obj, prefix = "") {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return [];
  }
  return Object.entries(obj).flatMap(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    const nested = collectKeys(value, next);
    return nested.length ? nested : [next];
  });
}
