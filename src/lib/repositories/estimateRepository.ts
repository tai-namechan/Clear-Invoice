import type { SupabaseClient } from '@supabase/supabase-js'
import type { Estimate, IssuerSnapshot, ClientSnapshot } from '@/types/db'

type CreateEstimatePayload = {
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
  issuer_snapshot: IssuerSnapshot
  client_snapshot: ClientSnapshot
}

export const estimateRepository = {
  async findAllByUserId(supabase: SupabaseClient, userId: string): Promise<Estimate[]> {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(`見積書の取得に失敗しました: ${error.message}`)
    return (data ?? []) as Estimate[]
  },

  async findById(supabase: SupabaseClient, userId: string, id: string): Promise<Estimate | null> {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`見積書の取得に失敗しました: ${error.message}`)
    return data as Estimate | null
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    payload: CreateEstimatePayload
  ): Promise<Estimate> {
    const { data, error } = await supabase
      .from('estimates')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()

    if (error) throw new Error(`見積書の作成に失敗しました: ${error.message}`)
    return data as Estimate
  },

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    payload: Partial<CreateEstimatePayload>
  ): Promise<Estimate> {
    const { data, error } = await supabase
      .from('estimates')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`見積書の更新に失敗しました: ${error.message}`)
    return data as Estimate
  },

  async delete(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)

    if (error) throw new Error(`見積書の削除に失敗しました: ${error.message}`)
  },

  /**
   * 同じ年の見積書数を取得（採番用）
   */
  async countByYear(supabase: SupabaseClient, userId: string, year: number): Promise<number> {
    const start = `${year}-01-01`
    const end = `${year + 1}-01-01`
    const { count, error } = await supabase
      .from('estimates')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('issue_date', start)
      .lt('issue_date', end)

    if (error) throw new Error(`見積書数の取得に失敗しました: ${error.message}`)
    return count ?? 0
  },
}
