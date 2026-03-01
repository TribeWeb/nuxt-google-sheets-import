import { z } from "zod";
function isZodType(value) {
  return typeof value === "object" && value !== null && "_def" in value;
}
function getDefValue(schema, key) {
  if (!schema || typeof schema !== "object") {
    return void 0;
  }
  const def = schema._def;
  if (!def || typeof def !== "object") {
    return void 0;
  }
  return def[key];
}
function nextInnerSchema(schema) {
  const candidate = getDefValue(schema, "innerType") ?? getDefValue(schema, "schema") ?? getDefValue(schema, "type") ?? getDefValue(schema, "in");
  return isZodType(candidate) ? candidate : null;
}
function unwrapSchema(schema) {
  let current = schema;
  for (let index = 0; index < 20; index++) {
    const next = nextInnerSchema(current);
    if (!next || next === current) {
      break;
    }
    current = next;
  }
  return isZodType(current) ? current : null;
}
function hasWrapper(schema, wrapper) {
  let current = schema;
  for (let index = 0; index < 20; index++) {
    if (!current) {
      return false;
    }
    if (wrapper === "optional" && current instanceof z.ZodOptional) {
      return true;
    }
    if (wrapper === "nullable" && current instanceof z.ZodNullable) {
      return true;
    }
    const next = nextInnerSchema(current);
    if (!next || next === current) {
      return false;
    }
    current = next;
  }
  return false;
}
function parseHeaderPath(header) {
  const tokens = [];
  const parts = header.split(".");
  for (const part of parts) {
    const matches = part.matchAll(/([^[]+)|(\[(\d+)\])/g);
    for (const match of matches) {
      if (match[1]) {
        tokens.push(match[1]);
      }
      if (match[3]) {
        tokens.push(Number.parseInt(match[3], 10));
      }
    }
  }
  return tokens;
}
function setDeep(target, path, value) {
  if (!path.length) {
    return;
  }
  let cursor = target;
  for (let index = 0; index < path.length; index++) {
    const key = path[index];
    if (key === void 0) {
      return;
    }
    const isLast = index === path.length - 1;
    const nextKey = path[index + 1];
    if (isLast) {
      cursor[key] = value;
      return;
    }
    if (cursor[key] === void 0) {
      cursor[key] = typeof nextKey === "number" ? [] : {};
    }
    const nextCursor = cursor[key];
    if (!nextCursor || typeof nextCursor !== "object") {
      return;
    }
    cursor = nextCursor;
  }
}
function getObjectShape(schema) {
  const unwrapped = unwrapSchema(schema);
  if (!unwrapped) {
    return null;
  }
  if (!(unwrapped instanceof z.ZodObject)) {
    return null;
  }
  const maybeShape = unwrapped.shape;
  if (typeof maybeShape === "function") {
    const shape = maybeShape();
    return shape;
  }
  if (maybeShape && typeof maybeShape === "object") {
    return maybeShape;
  }
  return null;
}
function getSchemaAtPath(rootSchema, path) {
  let current = rootSchema;
  for (const segment of path) {
    if (!current) {
      return null;
    }
    const unwrapped = unwrapSchema(current);
    if (!unwrapped) {
      return null;
    }
    if (typeof segment === "number") {
      const fallbackElement = getDefValue(unwrapped, "element");
      const arrayElement = unwrapped instanceof z.ZodArray ? unwrapped.element : isZodType(fallbackElement) ? fallbackElement : null;
      if (arrayElement) {
        current = arrayElement;
        continue;
      }
      return null;
    }
    const shape = getObjectShape(unwrapped);
    if (!shape || !(segment in shape)) {
      return null;
    }
    current = shape[segment] ?? null;
  }
  return current;
}
function toTypedCellValue(rawValue, schema) {
  if (rawValue === void 0) {
    return void 0;
  }
  const value = rawValue.trim();
  const isOptional = hasWrapper(schema, "optional");
  const isNullable = hasWrapper(schema, "nullable");
  if (value === "") {
    if (isOptional) {
      return void 0;
    }
    if (isNullable) {
      return null;
    }
  }
  const unwrapped = schema ? unwrapSchema(schema) : null;
  if (unwrapped instanceof z.ZodArray) {
    if (value === "") {
      return isOptional ? void 0 : isNullable ? null : [];
    }
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (unwrapped instanceof z.ZodBoolean) {
    if (/^(true|1|yes)$/i.test(value)) {
      return true;
    }
    if (/^(false|0|no)$/i.test(value)) {
      return false;
    }
  }
  if (unwrapped instanceof z.ZodNumber) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return value;
}
function formatZodError(error) {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  }).join("; ");
}
export function transformAndValidateRows(values, schema) {
  if (!values?.length) {
    return { records: [], errors: [] };
  }
  const headers = values[0] ?? [];
  const rows = values.slice(1);
  if (!headers.length) {
    return { records: [], errors: [] };
  }
  const records = [];
  const errors = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex] ?? [];
    const candidate = {};
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex++) {
      const header = headers[columnIndex];
      if (!header) {
        continue;
      }
      const path = parseHeaderPath(header);
      if (!path.length) {
        continue;
      }
      const cellSchema = getSchemaAtPath(schema, path);
      const cellValue = toTypedCellValue(row[columnIndex], cellSchema);
      if (cellValue !== void 0) {
        setDeep(candidate, path, cellValue);
      }
    }
    const parsed = schema.safeParse(candidate);
    if (!parsed.success) {
      errors.push(`Row ${rowIndex + 2}: ${formatZodError(parsed.error)}`);
      continue;
    }
    records.push(parsed.data);
  }
  return { records, errors };
}
