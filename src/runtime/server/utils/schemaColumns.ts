import { z } from 'zod'

export const PAGE_SCHEMA_OVERRIDE_COLUMNS = [
  'path',
  'title',
  'description',
  'seo.title',
  'seo.description',
  'seo.meta',
  'seo.link',
  'body.type',
  'body.children',
  'body.toc',
  'navigation',
  'navigation.title',
  'navigation.description',
  'navigation.icon'
]

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

function getObjectShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null {
  const unwrapped = unwrapSchema(schema)
  if (!unwrapped || !(unwrapped instanceof z.ZodObject)) {
    return null
  }

  const maybeShape = (unwrapped as unknown as { shape?: UnknownRecord | (() => UnknownRecord) }).shape
  if (typeof maybeShape === 'function') {
    return maybeShape() as Record<string, z.ZodTypeAny>
  }

  if (maybeShape && typeof maybeShape === 'object') {
    return maybeShape as Record<string, z.ZodTypeAny>
  }

  return null
}

function collectSchemaColumns(schema: z.ZodTypeAny, prefix = ''): string[] {
  const unwrapped = unwrapSchema(schema)
  if (!unwrapped) {
    return prefix ? [prefix] : []
  }

  if (unwrapped instanceof z.ZodArray) {
    const arrayPrefix = `${prefix}[0]`
    const elementCandidate = getDefValue(unwrapped as unknown, 'element')
    const arrayElement = isZodType(elementCandidate) ? elementCandidate : null
    const nested = arrayElement ? collectSchemaColumns(arrayElement, arrayPrefix) : []
    return nested.length ? nested : [arrayPrefix]
  }

  const objectShape = getObjectShape(unwrapped)
  if (objectShape) {
    return Object.entries(objectShape).flatMap(([key, childSchema]) => {
      const childPrefix = prefix ? `${prefix}.${key}` : key
      return collectSchemaColumns(childSchema, childPrefix)
    })
  }

  return prefix ? [prefix] : []
}

export function getSchemaColumns(schema: z.ZodTypeAny): string[] {
  const columns = collectSchemaColumns(schema)
  return Array.from(new Set(columns)).sort((left, right) => left.localeCompare(right))
}
