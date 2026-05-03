import type { SupabaseClient } from '@supabase/supabase-js'
import type { MyCompany } from '@/types/db'
import type { MyCompanyInput } from '@/lib/schemas/myCompany'

export const myCompanyRepository = {
  async findByUserId(supabase: SupabaseClient, userId: string): Promise<MyCompany | null> {
    const { data, error } = await supabase
      .from('my_company')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      throw new Error(`自社情報の取得に失敗しました: ${error.message}`)
    }
    return data as MyCompany | null
  },

  async upsert(
    supabase: SupabaseClient,
    userId: string,
    input: MyCompanyInput
  ): Promise<MyCompany> {
    const normalized = Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, v === '' ? null : v])
    )

    const { data, error } = await supabase
      .from('my_company')
      .upsert({ user_id: userId, ...normalized }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      throw new Error(`自社情報の保存に失敗しました: ${error.message}`)
    }
    return data as MyCompany
  },
}
