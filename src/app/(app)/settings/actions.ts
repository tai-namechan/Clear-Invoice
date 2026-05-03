'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
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
    // ★ デバッグ: Cookie が飛んでいるか確認
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('=== DEBUG: Cookies in Action ===')
    console.log('Total cookies:', allCookies.length)
    console.log('Cookie names:', allCookies.map(c => c.name))
    console.log('Supabase auth cookies:', allCookies.filter(c => c.name.includes('sb-')).map(c => ({ name: c.name, hasValue: !!c.value })))
    console.log('================================')

    const supabase = await createClient()

    // ★ デバッグ: getSession でも試す
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('=== DEBUG: Session ===')
    console.log('Session exists:', !!session)
    console.log('Session error:', sessionError)
    console.log('User ID from session:', session?.user?.id)
    console.log('======================')

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('auth error in action:', authError)
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
