'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createContractAction, updateContractAction } from '@/app/(app)/contracts/actions'
import type { Contract } from '@/types/db'

type Toast = { type: 'success' | 'error'; text: string }

type Props = {
  initial?: Contract | null
}

export function ContractForm({ initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setToast(null)

    startTransition(async () => {
      const result = initial
        ? await updateContractAction(initial.id, formData)
        : await createContractAction(formData)

      if (result.success) {
        const id = ('id' in result && result.id) ? result.id : initial?.id
        if (id) {
          router.push(`/contracts/${id}/preview?saved=1`)
        } else {
          router.refresh()
          setToast({ type: 'success', text: '保存しました' })
        }
      } else {
        setToast({ type: 'error', text: result.message ?? '保存に失敗しました' })
      }
    })
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
            基本情報
          </h2>

          <Input
            id="title"
            name="title"
            label="タイトル *"
            placeholder="行川邸クロス工事 など"
            defaultValue={initial?.title ?? ''}
            required
          />
          <p className="text-xs text-gray-500">タイトルは管理・ファイル名に使われます。PDFには表示されません。</p>
        </section>

        {/* 管理用メモ */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
            管理用メモ
          </h2>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={initial?.notes ?? ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="現場の状況など（PDFには出力されません）"
          />
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? '保存中...' : initial ? '更新する' : '作成する'}
          </Button>
        </div>
      </form>
    </>
  )
}
