'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateDisplayNameAction(formData: FormData) {
  try {
    const displayName = (formData.get('display_name') as string)?.trim() ?? ''

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName || null },
    })

    if (error) {
      return { success: false as const, message: error.message }
    }

    revalidatePath('/account')
    revalidatePath('/')
    return { success: true as const }
  } catch (e) {
    console.error('updateDisplayNameAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '更新に失敗しました',
    }
  }
}

export async function updatePasswordAction(formData: FormData) {
  try {
    const newPassword = (formData.get('new_password') as string) ?? ''

    if (newPassword.length < 6) {
      return { success: false as const, message: 'パスワードは6文字以上で入力してください' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      return { success: false as const, message: error.message }
    }

    return { success: true as const }
  } catch (e) {
    console.error('updatePasswordAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '更新に失敗しました',
    }
  }
}
