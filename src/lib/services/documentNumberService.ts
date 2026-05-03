import type { SupabaseClient } from '@supabase/supabase-js'
import { estimateRepository } from '@/lib/repositories/estimateRepository'
import { invoiceRepository } from '@/lib/repositories/invoiceRepository'

type DocumentType = 'estimate' | 'invoice'

export const documentNumberService = {
  /**
   * 書類番号を採番
   * 例: E-2026-0001 / I-2026-0001
   */
  async generate(
    supabase: SupabaseClient,
    userId: string,
    documentType: DocumentType,
    issueDate: string
  ): Promise<string> {
    const year = new Date(issueDate).getFullYear()
    const prefix = documentType === 'estimate' ? 'E' : 'I'

    const count =
      documentType === 'estimate'
        ? await estimateRepository.countByYear(supabase, userId, year)
        : await invoiceRepository.countByYear(supabase, userId, year)

    const seq = String(count + 1).padStart(4, '0')
    return `${prefix}-${year}-${seq}`
  },
}
