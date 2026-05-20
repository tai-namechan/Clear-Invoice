import type { SupabaseClient } from '@supabase/supabase-js'
import type { Contract, IssuerSnapshot } from '@/types/db'

type CreateContractPayload = {
  document_number: string
  title: string
  contract_date: string
  notes: string | null
  issuer_snapshot: IssuerSnapshot
}

export const contractRepository = {
  async findAllByUserId(supabase: SupabaseClient, userId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('contract_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(`契約書の取得に失敗しました: ${error.message}`)
    return (data ?? []) as Contract[]
  },

  async findById(supabase: SupabaseClient, userId: string, id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`契約書の取得に失敗しました: ${error.message}`)
    return data as Contract | null
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    payload: CreateContractPayload
  ): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()

    if (error) throw new Error(`契約書の作成に失敗しました: ${error.message}`)
    return data as Contract
  },

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    payload: Partial<Omit<CreateContractPayload, 'document_number' | 'issuer_snapshot'>>
  ): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`契約書の更新に失敗しました: ${error.message}`)
    return data as Contract
  },

  async delete(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)

    if (error) throw new Error(`契約書の削除に失敗しました: ${error.message}`)
  },

  async countByYear(supabase: SupabaseClient, userId: string, year: number): Promise<number> {
    const start = `${year}-01-01`
    const end = `${year + 1}-01-01`
    const { count, error } = await supabase
      .from('contracts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('contract_date', start)
      .lt('contract_date', end)

    if (error) throw new Error(`契約書数の取得に失敗しました: ${error.message}`)
    return count ?? 0
  },
}
