import type { SupabaseClient } from '@supabase/supabase-js'
import { estimateRepository } from '@/lib/repositories/estimateRepository'
import { documentItemRepository } from '@/lib/repositories/documentItemRepository'
import { myCompanyRepository } from '@/lib/repositories/myCompanyRepository'
import { documentNumberService } from './documentNumberService'
import { estimateSchema, type EstimateInput } from '@/lib/schemas/estimate'
import type { Estimate, DocumentItem, IssuerSnapshot, ClientSnapshot } from '@/types/db'

export const estimateService = {
  async list(supabase: SupabaseClient, userId: string): Promise<Estimate[]> {
    return estimateRepository.findAllByUserId(supabase, userId)
  },

  async getDetail(
    supabase: SupabaseClient,
    userId: string,
    id: string
  ): Promise<{ estimate: Estimate; items: DocumentItem[] } | null> {
    const estimate = await estimateRepository.findById(supabase, userId, id)
    if (!estimate) return null

    const items = await documentItemRepository.findByDocument(supabase, 'estimate', id)
    return { estimate, items }
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    input: EstimateInput
  ): Promise<Estimate> {
    const validated = estimateSchema.parse(input)

    // 自社情報を取得（スナップショット用）
    const myCompany = await myCompanyRepository.findByUserId(supabase, userId)
    if (!myCompany) {
      throw new Error('先に設定画面で自社情報を入力してください')
    }

    const issuerSnapshot: IssuerSnapshot = {
      name: myCompany.name,
      representative_name: myCompany.representative_name,
      postal_code: myCompany.postal_code,
      address: myCompany.address,
      tel: myCompany.tel,
      email: myCompany.email,
      bank_name: myCompany.bank_name,
      bank_branch: myCompany.bank_branch,
      bank_account_type: myCompany.bank_account_type,
      bank_account_number: myCompany.bank_account_number,
      bank_account_holder: myCompany.bank_account_holder,
    }

    const clientSnapshot: ClientSnapshot = {
      name: validated.client_name,
      honorific: validated.client_honorific,
      postal_code: validated.client_postal_code ?? null,
      address: validated.client_address ?? null,
    }

    // 金額計算
    const itemsWithAmount = validated.items.map((item) => ({
      ...item,
      amount: Math.round(item.quantity * item.unit_price),
    }))
    const subtotal = itemsWithAmount.reduce((sum, item) => sum + item.amount, 0)
    const total = subtotal

    // 書類番号採番
    const documentNumber = await documentNumberService.generate(
      supabase,
      userId,
      'estimate',
      validated.issue_date
    )

    // 見積書本体を作成
    const estimate = await estimateRepository.create(supabase, userId, {
      document_number: documentNumber,
      issue_date: validated.issue_date,
      client_name: validated.client_name,
      client_honorific: validated.client_honorific,
      client_postal_code: validated.client_postal_code ?? null,
      client_address: validated.client_address ?? null,
      subject: validated.subject ?? null,
      subtotal,
      total,
      notes: validated.notes ?? null,
      issuer_snapshot: issuerSnapshot,
      client_snapshot: clientSnapshot,
    })

    // 明細を作成
    await documentItemRepository.bulkCreate(
      supabase,
      'estimate',
      estimate.id,
      itemsWithAmount.map((item, idx) => ({
        sort_order: idx,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit ?? null,
        unit_price: item.unit_price,
        amount: item.amount,
        notes: item.notes ?? null,
      }))
    )

    return estimate
  },

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    input: EstimateInput
  ): Promise<Estimate> {
    const validated = estimateSchema.parse(input)

    const existing = await estimateRepository.findById(supabase, userId, id)
    if (!existing) throw new Error('見積書が見つかりません')

    const clientSnapshot: ClientSnapshot = {
      name: validated.client_name,
      honorific: validated.client_honorific,
      postal_code: validated.client_postal_code ?? null,
      address: validated.client_address ?? null,
    }

    const itemsWithAmount = validated.items.map((item) => ({
      ...item,
      amount: Math.round(item.quantity * item.unit_price),
    }))
    const subtotal = itemsWithAmount.reduce((sum, item) => sum + item.amount, 0)
    const total = subtotal

    // 注: 編集時は document_number と issuer_snapshot は変更しない（発行時の固定値）
    const updated = await estimateRepository.update(supabase, userId, id, {
      issue_date: validated.issue_date,
      client_name: validated.client_name,
      client_honorific: validated.client_honorific,
      client_postal_code: validated.client_postal_code ?? null,
      client_address: validated.client_address ?? null,
      subject: validated.subject ?? null,
      subtotal,
      total,
      notes: validated.notes ?? null,
      client_snapshot: clientSnapshot,
    })

    // 明細は全置き換え
    await documentItemRepository.replaceForDocument(
      supabase,
      'estimate',
      id,
      itemsWithAmount.map((item, idx) => ({
        sort_order: idx,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit ?? null,
        unit_price: item.unit_price,
        amount: item.amount,
        notes: item.notes ?? null,
      }))
    )

    return updated
  },

  async delete(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
    await estimateRepository.delete(supabase, userId, id)
  },
}
