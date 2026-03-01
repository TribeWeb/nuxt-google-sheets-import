import { z } from 'zod'

export const machinesSmoke = z.object({
  pageOrder: z.number(),
  modelId: z.string().min(1),
  machineName: z.string().min(1),
  cutRate: z.number(),
  featurePrimary: z.string().optional()
})

export const schemas = {
  machinesSmoke
}
