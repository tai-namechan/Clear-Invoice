'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { estimateService } from '@/lib/services/estimateService'

function parseFormDataToInput(formData: FormData) {
  const itemCount = parseInt(formData.get('item_count') as string, 10) || 0
  const items = []
  for (let i = 0; i < itemCount; i++) {
    items.push({
      name: (formData.get(`item_name_${i}`) as string) ?? '',
      quantity: parseFloat((formData.get(`item_quantity_${i}`) as string) ?? '0') || 0,
      unit: (formData.get(`item_unit_${i}`) as string) || null,
      unit_price: parseFloat((formData.get(`item_unit_price_${i}`) as string) ?? '0') || 0,
      amount: 0, // serviceで計算
      notes: (formData.get(`item_notes_${i}`) as string) || null,
    })
  }

  return {
    issue_date: formData.get('issue_date') as string,
    target_month: (formData.get('target_month') as string) || null,
    client_name: formData.get('client_name') as string,
    client_honorific: (formData.get('client_honorific') as string) || '様',
    client_postal_code: (formData.get('client_postal_code') as string) || null,
    client_address: (formData.get('client_address') as string) || null,
    subject: (formData.get('subject') as string) || null,
    notes: (formData.get('notes') as string) || null,
    items,
  }
}

export async function createEstimateAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    const input = parseFormDataToInput(formData)
    const created = await estimateService.create(supabase, user.id, input)
    revalidatePath('/estimates')
    revalidatePath('/documents')
    return { success: true as const, id: created.id }
  } catch (e) {
    console.error('createEstimateAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '作成に失敗しました',
    }
  }
}

export async function updateEstimateAction(id: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    const input = parseFormDataToInput(formData)
    await estimateService.update(supabase, user.id, id, input)
    revalidatePath('/estimates')
    revalidatePath(`/estimates/${id}`)
    revalidatePath('/documents')
    return { success: true as const }
  } catch (e) {
    console.error('updateEstimateAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '更新に失敗しました',
    }
  }
}

export async function deleteEstimateAction(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, message: 'ログインし直してください' }

    await estimateService.delete(supabase, user.id, id)
    revalidatePath('/estimates')
  } catch (e) {
    console.error('deleteEstimateAction error:', e)
    return {
      success: false as const,
      message: e instanceof Error ? e.message : '削除に失敗しました',
    }
  }

  redirect('/estimates')
}
