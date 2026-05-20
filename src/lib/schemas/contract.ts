import { z } from 'zod'

export const contractSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  notes: z.string().optional().nullable(),
})

export type ContractInput = z.infer<typeof contractSchema>
