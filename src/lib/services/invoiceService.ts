import type { SupabaseClient } from '@supabase/supabase-js'
import { invoiceRepository } from '@/lib/repositories/invoiceRepository'
import { documentItemRepository } from '@/lib/repositories/documentItemRepository'
import { myCompanyRepository } from '@/lib/repositories/myCompanyRepository'
import { documentNumberService } from './documentNumberService'
import { invoiceSchema, type InvoiceInput } from '@/lib/schemas/invoice'
import type { Invoice, DocumentItem, IssuerSnapshot, ClientSnapshot } from '@/types/db'

export const invoiceService = {
  async list(supabase: SupabaseClient, userId: string): Promise<Invoice[]> {
    return invoiceRepository.findAllByUserId(supabase, userId)
  },

  async getDetail(
    supabase: SupabaseClient,
    userId: string,
    id: string
  ): Promise<{ invoice: Invoice; items: DocumentItem[] } | null> {
    const invoice = await invoiceRepository.findById(supabase, userId, id)
    if (!invoice) return null

    const items = await documentItemRepository.findByDocument(supabase, 'invoice', id)
    return { invoice, items }
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    input: InvoiceInput
  ): Promise<Invoice> {
    const validated = invoiceSchema.parse(input)

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

    const itemsWithAmount = validated.items.map((item) => ({
      ...item,
      amount: Math.round(item.quantity * item.unit_price),
    }))
    const subtotal = itemsWithAmount.reduce((sum: number, item) => sum + item.amount, 0)
    const total = subtotal

    const documentNumber = await documentNumberService.generate(
      supabase,
      userId,
      'invoice',
      validated.issue_date
    )

    const invoice = await invoiceRepository.create(supabase, userId, {
      document_number: documentNumber,
      issue_date: validated.issue_date,
      target_month: validated.target_month || null,
      client_name: validated.client_name,
      client_honorific: validated.client_honorific,
      client_postal_code: validated.client_postal_code ?? null,
      client_address: validated.client_address ?? null,
      subject: validated.subject ?? null,
      subtotal,
      total,
      notes: validated.notes ?? null,
      total_label: validated.total_label,
      issuer_snapshot: issuerSnapshot,
      client_snapshot: clientSnapshot,
    })

    await documentItemRepository.bulkCreate(
      supabase,
      'invoice',
      invoice.id,
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

    return invoice
  },

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    input: InvoiceInput
  ): Promise<Invoice> {
    const validated = invoiceSchema.parse(input)

    const existing = await invoiceRepository.findById(supabase, userId, id)
    if (!existing) throw new Error('請求書が見つかりません')

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
    const subtotal = itemsWithAmount.reduce((sum: number, item) => sum + item.amount, 0)
    const total = subtotal

    const updated = await invoiceRepository.update(supabase, userId, id, {
      issue_date: validated.issue_date,
      target_month: validated.target_month || null,
      client_name: validated.client_name,
      client_honorific: validated.client_honorific,
      client_postal_code: validated.client_postal_code ?? null,
      client_address: validated.client_address ?? null,
      subject: validated.subject ?? null,
      subtotal,
      total,
      notes: validated.notes ?? null,
      total_label: validated.total_label,
      client_snapshot: clientSnapshot,
    })

    await documentItemRepository.replaceForDocument(
      supabase,
      'invoice',
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
    await invoiceRepository.delete(supabase, userId, id)
  },
}
