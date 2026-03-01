import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
function sanitizePathSegment(segment) {
  return segment.replace(/(^\/+|\/+?$)/g, "").replace(/\.\./g, "");
}
function getByPath(object, keyPath) {
  return keyPath.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object") {
      return acc[key];
    }
    return void 0;
  }, object);
}
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
function extractMarkdownBody(existingFileContent) {
  const frontmatterMatch = existingFileContent.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!frontmatterMatch) {
    return existingFileContent;
  }
  return existingFileContent.slice(frontmatterMatch[0].length);
}
function getFileExtension(format) {
  if (format === "json") {
    return "json";
  }
  if (format === "yaml") {
    return "yml";
  }
  return "md";
}
function stringifyRecord(record, format) {
  if (format === "json") {
    return `${JSON.stringify(record, null, 2)}
`;
  }
  const yamlBody = yaml.dump(record, { lineWidth: 360 });
  if (format === "yaml") {
    return yamlBody;
  }
  return `---
${yamlBody}---
`;
}
export async function writeRecordAsFrontmatter(input) {
  const projectRoot = process.cwd();
  const contentRoot = path.resolve(projectRoot, sanitizePathSegment(input.baseContentDir));
  const targetFolder = path.resolve(contentRoot, sanitizePathSegment(input.folder));
  const outputFormat = input.outputFormat ?? "frontmatter";
  const overwriteMode = input.overwriteMode ?? "overwrite";
  if (!targetFolder.startsWith(contentRoot)) {
    throw new Error("Invalid destination folder");
  }
  await mkdir(targetFolder, { recursive: true });
  const slug = String(getByPath(input.record, input.slugKey) ?? "").trim();
  if (!slug) {
    throw new Error(`Missing slug value for key "${input.slugKey}"`);
  }
  const order = input.orderKey ? String(getByPath(input.record, input.orderKey) ?? "").trim() : "";
  const extension = getFileExtension(outputFormat);
  const fileName = `${order ? `${order}.` : ""}${slug}.${extension}`;
  const filePath = path.resolve(targetFolder, fileName);
  const exists = await fileExists(filePath);
  if (exists && overwriteMode === "skip") {
    return {
      filePath,
      action: "skipped"
    };
  }
  if (exists && overwriteMode === "overwrite-frontmatter" && outputFormat === "frontmatter") {
    const existingFileContent = await readFile(filePath, "utf-8");
    const markdownBody = extractMarkdownBody(existingFileContent);
    const nextFrontmatter = stringifyRecord(input.record, "frontmatter");
    await writeFile(filePath, `${nextFrontmatter}${markdownBody}`, "utf-8");
    return {
      filePath,
      action: "overwritten"
    };
  }
  await writeFile(filePath, stringifyRecord(input.record, outputFormat), "utf-8");
  return {
    filePath,
    action: exists ? "overwritten" : "written"
  };
}
