export type PathSegment = string | number

const EXCLUDED_EXPORT_PATHS = new Set(['__hash__', 'body'])

export function parseHeaderPath(header: string): PathSegment[] {
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

export function setDeep(target: Record<string, unknown>, path: PathSegment[], value: unknown): void {
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

export function flattenRecordToStringMap(record: Record<string, unknown>, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()

  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (EXCLUDED_EXPORT_PATHS.has(path)) {
      continue
    }

    if (value === null || value === undefined) {
      out.set(path, '')
      continue
    }

    if (Array.isArray(value)) {
      if (value.every(item => item === null || ['string', 'number', 'boolean'].includes(typeof item))) {
        out.set(path, value.map(item => item == null ? '' : String(item)).join(', '))
        continue
      }

      for (let index = 0; index < value.length; index++) {
        const item = value[index]
        const arrayPath = `${path}[${index}]`

        if (item && typeof item === 'object' && !Array.isArray(item)) {
          flattenRecordToStringMap(item as Record<string, unknown>, arrayPath).forEach((nestedValue, nestedKey) => {
            out.set(nestedKey, nestedValue)
          })
        }
        else {
          out.set(arrayPath, item == null ? '' : String(item))
        }
      }
      continue
    }

    if (value instanceof Date) {
      out.set(path, value.toISOString())
      continue
    }

    if (typeof value === 'object') {
      flattenRecordToStringMap(value as Record<string, unknown>, path).forEach((nestedValue, nestedKey) => {
        out.set(nestedKey, nestedValue)
      })
      continue
    }

    out.set(path, String(value))
  }

  return out
}
