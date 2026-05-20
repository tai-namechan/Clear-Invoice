'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { myCompanyService } from '@/lib/services/myCompanyService'
import { myCompanySchema } from '@/lib/schemas/myCompany'

export async function saveMyCompanyAction(formData: FormData) {
  const input = {
    name: formData.get('name') as string,
    representative_name: formData.get('representative_name') as string,
    postal_code: formData.get('postal_code') as string,
    address: formData.get('address') as string,
    tel: formData.get('tel') as string,
    email: formData.get('email') as string,
    bank_name: formData.get('bank_name') as string,
    bank_branch: formData.get('bank_branch') as string,
    bank_account_type: formData.get('bank_account_type') as string,
    bank_account_number: formData.get('bank_account_number') as string,
    bank_account_holder: formData.get('bank_account_holder') as string,
  }

  const result = myCompanySchema.safeParse(input)
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.flatten().fieldErrors,
    }
  }

  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false as const, message: 'ログインし直してください' }
    }

    await myCompanyService.save(supabase, user.id, result.data)
    revalidatePath('/settings')
    return { success: true as const }
  } catch (e) {
    console.error('save action error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '保存に失敗しました',
    }
  }
}
