import type { SupabaseClient } from '@supabase/supabase-js'
import { estimateRepository } from '@/lib/repositories/estimateRepository'
import { invoiceRepository } from '@/lib/repositories/invoiceRepository'
import { contractRepository } from '@/lib/repositories/contractRepository'

type DocumentType = 'estimate' | 'invoice' | 'contract'

export const documentNumberService = {
  /**
   * 書類番号を採番
   * 例: E-2026-0001 / I-2026-0001 / C-2026-0001
   */
  async generate(
    supabase: SupabaseClient,
    userId: string,
    documentType: DocumentType,
    issueDate: string
  ): Promise<string> {
    const year = new Date(issueDate).getFullYear()
    const prefix = documentType === 'estimate' ? 'E' : documentType === 'invoice' ? 'I' : 'C'

    let count: number
    if (documentType === 'estimate') {
      count = await estimateRepository.countByYear(supabase, userId, year)
    } else if (documentType === 'invoice') {
      count = await invoiceRepository.countByYear(supabase, userId, year)
    } else {
      count = await contractRepository.countByYear(supabase, userId, year)
    }

    const seq = String(count + 1).padStart(4, '0')
    return `${prefix}-${year}-${seq}`
  },
}
