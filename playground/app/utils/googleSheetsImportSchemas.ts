import * as z from 'zod/v4'

const example = z.object({
  slug: z.string().min(1).max(100),
  pageOrder: z.coerce.number().int(),
  number: z.coerce.number(),
  string: z.string().min(1).max(100),
  enumString: z.enum(['foo', 'bar', 'baz']),
  literalString: z.literal('foo'),
  unionString: z.union([z.literal('foo'), z.literal('bar')]),
  unionStringArray: z.union([z.literal('foo'), z.literal('bar')]).array(),
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

export const googleSheetsImportSchemas = {
  example,
}
