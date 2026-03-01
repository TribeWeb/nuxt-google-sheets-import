export function columnCountToRange(columnCount) {
  let dividend = columnCount;
  let columnName = "";
  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return `A:${columnName}`;
}
export function getByPath(object, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object") {
      return acc[key];
    }
    return void 0;
  }, object);
}
