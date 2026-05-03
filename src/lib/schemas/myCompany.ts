import { z } from 'zod'

export const myCompanySchema = z.object({
  name: z.string().min(1, '会社名を入力してください'),
  representative_name: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tel: z.string().optional().nullable(),
  email: z.string().email('正しいメールアドレスを入力してください').optional().nullable().or(z.literal('')),
  bank_name: z.string().optional().nullable(),
  bank_branch: z.string().optional().nullable(),
  bank_account_type: z.string().optional().nullable(),
  bank_account_number: z.string().optional().nullable(),
  bank_account_holder: z.string().optional().nullable(),
})

export type MyCompanyInput = z.infer<typeof myCompanySchema>
