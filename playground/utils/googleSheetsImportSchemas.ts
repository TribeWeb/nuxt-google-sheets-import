import { z } from 'zod'

export const machinesSmoke = z.object({
  pageOrder: z.number(),
  modelId: z.string().min(1),
  machineName: z.string().min(1),
  cutRate: z.number(),
  featurePrimary: z.string().optional(),
})

const example = z.object({
  slug: z.string().min(1).max(100),
  pageOrder: z.coerce.number().int(),
  number: z.coerce.number(),
  string: z.string().min(1).max(100),
  enumString: z.enum(['foo', 'bar', 'baz']),
  literalString: z.literal('foo'),
  unionString: z.union([z.literal('foo'), z.literal('bar')]),
  unionStringArray: z.union([z.literal('foo'), z.literal('bar')]).array(),
  exclusiveUnionString: z.xor([z.literal('foo'), z.literal('bar')]),
  stringArray: z.string().array(),
  numberArray: z.coerce.number().array(),
  boolean: z.coerce.boolean(),
  object: z.object({
    key1: z.string().min(1),
    key2: z.string().min(1),
  }),
  objectArray: z.array(
    z.object({
      keyA: z.string().min(1),
      keyB: z.string().min(1),
    }),
  ),
})

const example2 = z.object({
  title: z.string(),
  content: z.string(),
  file: z.instanceof(Blob).or(z.string()),
})

export const googleSheetsImportSchemas = {
  example,
  example2,
}
