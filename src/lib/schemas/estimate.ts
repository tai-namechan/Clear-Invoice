import { z } from 'zod'

export const estimateItemSchema = z.object({
  name: z.string().min(1, '品名を入力してください'),
  quantity: z.coerce.number().min(0, '数量を正しく入力してください').default(1),
  unit: z.string().optional().nullable(),
  unit_price: z.coerce.number().min(0, '単価を正しく入力してください').default(0),
  amount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
})

export const estimateSchema = z.object({
  issue_date: z.string().min(1, '発行日を入力してください'),
  target_month: z.string().regex(/^\d{4}-\d{2}$/, '請求対象月を入力してください').optional().nullable().or(z.literal('')),
  client_name: z.string().min(1, '取引先名を入力してください'),
  client_honorific: z.string().default('様'),
  client_postal_code: z.string().optional().nullable(),
  client_address: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(estimateItemSchema).min(1, '明細を1件以上入力してください'),
})

export type EstimateInput = z.infer<typeof estimateSchema>
export type EstimateItemInput = z.infer<typeof estimateItemSchema>
