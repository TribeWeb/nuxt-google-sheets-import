import { z } from 'zod'

type PathSegment = string | number
type UnknownRecord = Record<string, unknown>

function isZodType(value: unknown): value is z.ZodTypeAny {
  return typeof value === 'object' && value !== null && '_def' in value
}

function getDefValue(schema: unknown, key: string): unknown {
  if (!schema || typeof schema !== 'object') {
    return undefined
  }

  const def = (schema as UnknownRecord)._def
  if (!def || typeof def !== 'object') {
    return undefined
  }

  return (def as UnknownRecord)[key]
}

function nextInnerSchema(schema: unknown): z.ZodTypeAny | null {
  const candidate = getDefValue(schema, 'innerType')
    ?? getDefValue(schema, 'schema')
    ?? getDefValue(schema, 'type')
    ?? getDefValue(schema, 'in')

  return isZodType(candidate) ? candidate : null
}

function unwrapSchema(schema: z.ZodTypeAny | null): z.ZodTypeAny | null {
  let current: unknown = schema

  for (let index = 0; index < 20; index++) {
    const next = nextInnerSchema(current)
    if (!next || next === current) {
      break
    }

    current = next
  }

  return isZodType(current) ? current : null
}

function hasWrapper(schema: z.ZodTypeAny | null, wrapper: 'optional' | 'nullable'): boolean {
  let current: unknown = schema

  for (let index = 0; index < 20; index++) {
    if (!current) {
      return false
    }

    if (wrapper === 'optional' && current instanceof z.ZodOptional) {
      return true
    }

    if (wrapper === 'nullable' && current instanceof z.ZodNullable) {
      return true
    }

    const next = nextInnerSchema(current)
    if (!next || next === current) {
      return false
    }

    current = next
  }

  return false
}

function parseHeaderPath(header: string): PathSegment[] {
  const tokens: PathSegment[] = []
  const parts = header.split('.')

  for (const part of parts) {
    const matches = part.matchAll(/([^[]+)|(\[(\d+)\])/g)
    for (const match of matches) {
      if (match[1]) {
        tokens.push(match[1])
      }
      if (match[3]) {
        tokens.push(Number.parseInt(match[3], 10))
      }
    }
  }

  return tokens
}

function setDeep(target: Record<string, unknown>, path: PathSegment[], value: unknown): void {
  if (!path.length) {
    return
  }

  let cursor: Record<string | number, unknown> = target

  for (let index = 0; index < path.length; index++) {
    const key = path[index]
    if (key === undefined) {
      return
    }

    const isLast = index === path.length - 1
    const nextKey = path[index + 1]

    if (isLast) {
      cursor[key] = value
      return
    }

    if (cursor[key] === undefined) {
      cursor[key] = typeof nextKey === 'number' ? [] : {}
    }

    const nextCursor = cursor[key]
    if (!nextCursor || typeof nextCursor !== 'object') {
      return
    }

    cursor = nextCursor as Record<string | number, unknown>
  }
}

function getObjectShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null {
  const unwrapped = unwrapSchema(schema)
  if (!unwrapped) {
    return null
  }

  if (!(unwrapped instanceof z.ZodObject)) {
    return null
  }

  const maybeShape = (unwrapped as unknown as { shape?: UnknownRecord | (() => UnknownRecord) }).shape
  if (typeof maybeShape === 'function') {
    const shape = maybeShape()
    return shape as Record<string, z.ZodTypeAny>
  }

  if (maybeShape && typeof maybeShape === 'object') {
    return maybeShape as Record<string, z.ZodTypeAny>
  }

  return null
}

function getSchemaAtPath(rootSchema: z.ZodTypeAny, path: PathSegment[]): z.ZodTypeAny | null {
  let current: z.ZodTypeAny | null = rootSchema

  for (const segment of path) {
    if (!current) {
      return null
    }

    const unwrapped = unwrapSchema(current)
    if (!unwrapped) {
      return null
    }

    if (typeof segment === 'number') {
      const fallbackElement = getDefValue(unwrapped, 'element')
      const arrayElement = unwrapped instanceof z.ZodArray
        ? unwrapped.element
        : (isZodType(fallbackElement) ? fallbackElement : null)

      if (arrayElement) {
        current = arrayElement as z.ZodTypeAny
        continue
      }
      return null
    }

    const shape = getObjectShape(unwrapped)
    if (!shape || !(segment in shape)) {
      return null
    }

    current = shape[segment] ?? null
  }

  return current
}

function toTypedCellValue(rawValue: string | undefined, schema: z.ZodTypeAny | null): unknown {
  if (rawValue === undefined) {
    return undefined
  }

  const value = rawValue.trim()
  const isOptional = hasWrapper(schema, 'optional')
  const isNullable = hasWrapper(schema, 'nullable')

  if (value === '') {
    if (isOptional) {
      return undefined
    }
    if (isNullable) {
      return null
    }
  }

  const unwrapped = schema ? unwrapSchema(schema) : null

  if (unwrapped instanceof z.ZodArray) {
    if (value === '') {
      return isOptional ? undefined : isNullable ? null : []
    }

    return value.split(',').map(item => item.trim()).filter(Boolean)
  }

  if (unwrapped instanceof z.ZodBoolean) {
    if (/^(true|1|yes)$/i.test(value)) {
      return true
    }
    if (/^(false|0|no)$/i.test(value)) {
      return false
    }
  }

  if (unwrapped instanceof z.ZodNumber) {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return value
}

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join('; ')
}

export function transformAndValidateRows(
  values: string[][],
  schema: z.ZodTypeAny
): { records: Record<string, unknown>[], errors: string[] } {
  if (!values?.length) {
    return { records: [], errors: [] }
  }

  const headers = values[0] ?? []
  const rows = values.slice(1)

  if (!headers.length) {
    return { records: [], errors: [] }
  }

  const records: Record<string, unknown>[] = []
  const errors: string[] = []

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex] ?? []
    const candidate: Record<string, unknown> = {}

    for (let columnIndex = 0; columnIndex < headers.length; columnIndex++) {
      const header = headers[columnIndex]
      if (!header) {
        continue
      }

      const path = parseHeaderPath(header)
      if (!path.length) {
        continue
      }

      const cellSchema = getSchemaAtPath(schema, path)
      const cellValue = toTypedCellValue(row[columnIndex], cellSchema)

      if (cellValue !== undefined) {
        setDeep(candidate, path, cellValue)
      }
    }

    const parsed = schema.safeParse(candidate)
    if (!parsed.success) {
      errors.push(`Row ${rowIndex + 2}: ${formatZodError(parsed.error)}`)
      continue
    }

    records.push(parsed.data as Record<string, unknown>)
  }

  return { records, errors }
}
