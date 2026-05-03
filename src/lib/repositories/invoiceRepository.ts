import type { SupabaseClient } from '@supabase/supabase-js'
import type { Invoice, IssuerSnapshot, ClientSnapshot } from '@/types/db'

type CreateInvoicePayload = {
    document_number: string
    issue_date: string
    target_month: string | null
    client_name: string
    client_honorific: string
    client_postal_code: string | null
    client_address: string | null
    subject: string | null
    subtotal: number
    total: number
    notes: string | null
    total_label: string
    issuer_snapshot: IssuerSnapshot
    client_snapshot: ClientSnapshot
  }

export const invoiceRepository = {
  async findAllByUserId(supabase: SupabaseClient, userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(`請求書の取得に失敗しました: ${error.message}`)
    return (data ?? []) as Invoice[]
  },

  async findById(supabase: SupabaseClient, userId: string, id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`請求書の取得に失敗しました: ${error.message}`)
    return data as Invoice | null
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    payload: CreateInvoicePayload
  ): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()

    if (error) throw new Error(`請求書の作成に失敗しました: ${error.message}`)
    return data as Invoice
  },

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    payload: Partial<CreateInvoicePayload>
  ): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`請求書の更新に失敗しました: ${error.message}`)
    return data as Invoice
  },

  async delete(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)

    if (error) throw new Error(`請求書の削除に失敗しました: ${error.message}`)
  },

  async countByYear(supabase: SupabaseClient, userId: string, year: number): Promise<number> {
    const start = `${year}-01-01`
    const end = `${year + 1}-01-01`
    const { count, error } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('issue_date', start)
      .lt('issue_date', end)

    if (error) throw new Error(`請求書数の取得に失敗しました: ${error.message}`)
    return count ?? 0
  },
}
