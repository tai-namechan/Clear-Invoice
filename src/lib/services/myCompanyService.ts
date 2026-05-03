import type { SupabaseClient } from '@supabase/supabase-js'
import { myCompanyRepository } from '@/lib/repositories/myCompanyRepository'
import { myCompanySchema, type MyCompanyInput } from '@/lib/schemas/myCompany'
import type { MyCompany } from '@/types/db'

export const myCompanyService = {
  async getByUserId(supabase: SupabaseClient, userId: string): Promise<MyCompany | null> {
    return myCompanyRepository.findByUserId(supabase, userId)
  },

  async save(
    supabase: SupabaseClient,
    userId: string,
    input: MyCompanyInput
  ): Promise<MyCompany> {
    const validated = myCompanySchema.parse(input)
    return myCompanyRepository.upsert(supabase, userId, validated)
  },
}
