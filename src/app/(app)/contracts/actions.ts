'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { contractService } from '@/lib/services/contractService'

function parseFormDataToInput(formData: FormData) {
  return {
    title: formData.get('title') as string,
    notes: (formData.get('notes') as string) || null,
  }
}

export async function createContractAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    const input = parseFormDataToInput(formData)
    const created = await contractService.create(supabase, user.id, input)
    revalidatePath('/contracts')
    return { success: true as const, id: created.id }
  } catch (e) {
    console.error('createContractAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '作成に失敗しました',
    }
  }
}

export async function updateContractAction(id: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    const input = parseFormDataToInput(formData)
    await contractService.update(supabase, user.id, id, input)
    revalidatePath('/contracts')
    revalidatePath(`/contracts/${id}`)
    return { success: true as const }
  } catch (e) {
    console.error('updateContractAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '更新に失敗しました',
    }
  }
}

export async function deleteContractAction(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    await contractService.delete(supabase, user.id, id)
    revalidatePath('/contracts')
    return { success: true as const }
  } catch (e) {
    console.error('deleteContractAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '削除に失敗しました',
    }
  }
}
