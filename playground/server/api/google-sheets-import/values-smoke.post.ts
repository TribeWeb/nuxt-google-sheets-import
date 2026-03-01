import { z } from 'zod'
import { schemas } from '../../google-sheets/schemas'
import { transformAndValidateRows } from '../../../../src/runtime/server/utils/transform'

const bodySchema = z.object({
  schema: z.string().default('machinesSmoke')
})

const smokeValues = [
  ['pageOrder', 'modelId', 'machineName', 'cutRate', 'featurePrimary'],
  ['10', 'variocut', 'Variocut', '140', 'Highly versatile'],
  ['20', 'kl-bv', 'KL-BV', '330', 'Accurate silicone cuts']
]

export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event).catch(() => ({})))
  const schema = (schemas as Record<string, z.ZodTypeAny>)[body.schema]

  if (!schema) {
    throw createError({ statusCode: 400, statusMessage: `Unknown schema: ${body.schema}` })
  }

  const transformed = transformAndValidateRows(smokeValues, schema)

  return {
    headers: smokeValues[0],
    records: transformed.records,
    errors: transformed.errors
  }
})
