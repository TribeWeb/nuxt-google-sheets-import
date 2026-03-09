export function toCsvRow(values: string[]): string {
  return values
    .map((value) => {
      const escaped = value.replaceAll('"', '""')
      return `"${escaped}"`
    })
    .join(',')
}

export function toTsvRow(values: string[]): string {
  return values
    .map(value => value.replace(/[\t\r\n]+/g, ' '))
    .join('\t')
}