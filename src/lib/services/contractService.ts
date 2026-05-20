import type { SupabaseClient } from '@supabase/supabase-js'
import { contractRepository } from '@/lib/repositories/contractRepository'
import { myCompanyRepository } from '@/lib/repositories/myCompanyRepository'
import { documentNumberService } from './documentNumberService'
import { contractSchema, type ContractInput } from '@/lib/schemas/contract'
import type { Contract, IssuerSnapshot } from '@/types/db'

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const contractService = {
  async list(supabase: SupabaseClient, userId: string): Promise<Contract[]> {
    return contractRepository.findAllByUserId(supabase, userId)
  },

  async getDetail(
    supabase: SupabaseClient,
    userId: string,
    id: string
  ): Promise<Contract | null> {
    return contractRepository.findById(supabase, userId, id)
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    input: ContractInput
  ): Promise<Contract> {
    const validated = contractSchema.parse(input)

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

    const today = todayIso()

    const documentNumber = await documentNumberService.generate(
      supabase,
      userId,
      'contract',
      today
    )

    return contractRepository.create(supabase, userId, {
      document_number: documentNumber,
      title: validated.title,
      contract_date: today,
      notes: validated.notes ?? null,
      issuer_snapshot: issuerSnapshot,
    })
  },

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    input: ContractInput
  ): Promise<Contract> {
    const validated = contractSchema.parse(input)

    const existing = await contractRepository.findById(supabase, userId, id)
    if (!existing) throw new Error('契約書が見つかりません')

    // document_number・issuer_snapshot・contract_date は更新しない（発行時点を保持）
    return contractRepository.update(supabase, userId, id, {
      title: validated.title,
      notes: validated.notes ?? null,
    })
  },

  async delete(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
    await contractRepository.delete(supabase, userId, id)
  },
}
