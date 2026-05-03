'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DocumentItemRows, type ItemRow } from './DocumentItemRows'
import { createEstimateAction, updateEstimateAction } from '@/app/(app)/estimates/actions'
import { toDateInputValue } from '@/lib/utils/wareki'
import type { Estimate, DocumentItem } from '@/types/db'

type Props = {
  initial?: { estimate: Estimate; items: DocumentItem[] } | null
}

export function EstimateForm({ initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  const initialItems: ItemRow[] | undefined = initial?.items.map((item) => ({
    name: item.name,
    quantity: String(item.quantity),
    unit: item.unit ?? '',
    unit_price: String(item.unit_price),
    notes: item.notes ?? '',
  }))

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setMessage(null)

    startTransition(async () => {
      const result = initial
        ? await updateEstimateAction(initial.estimate.id, formData)
        : await createEstimateAction(formData)

      if (result.success) {
        if ('id' in result && result.id) {
          router.push(`/estimates/${result.id}`)
        } else {
          router.refresh()
          setMessage(null)
        }
      } else {
        setMessage({ type: 'error', text: result.message ?? '失敗しました' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          基本情報
        </h2>

        <Input
          id="issue_date"
          name="issue_date"
          type="date"
          label="発行日 *"
          defaultValue={initial ? toDateInputValue(initial.estimate.issue_date) : toDateInputValue(new Date())}
          required
        />

        <Input
          id="subject"
          name="subject"
          label="件名"
          placeholder="○○邸内装工事 など"
          defaultValue={initial?.estimate.subject ?? ''}
        />
      </section>

      {/* 取引先 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          取引先
        </h2>

        <Input
          id="client_name"
          name="client_name"
          label="取引先名 *"
          defaultValue={initial?.estimate.client_name ?? ''}
          required
        />

        <div>
          <label htmlFor="client_honorific" className="block text-sm font-medium text-gray-700 mb-1">
            敬称
          </label>
          <select
            id="client_honorific"
            name="client_honorific"
            defaultValue={initial?.estimate.client_honorific ?? '様'}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
            style={{ colorScheme: 'light' }}
          >
            <option value="様">様</option>
            <option value="御中">御中</option>
          </select>
        </div>

        <Input
          id="client_postal_code"
          name="client_postal_code"
          label="郵便番号"
          placeholder="123-4567"
          numericMode="phone"
          defaultValue={initial?.estimate.client_postal_code ?? ''}
        />

        <Input
          id="client_address"
          name="client_address"
          label="住所"
          defaultValue={initial?.estimate.client_address ?? ''}
        />
      </section>

      {/* 明細 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          明細
        </h2>
        <DocumentItemRows initial={initialItems} />
      </section>

      {/* 備考 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          備考
        </h2>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initial?.estimate.notes ?? ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="お支払い条件、工期など"
        />
      </section>

      {message && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {message.text}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? '保存中...' : initial ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}
