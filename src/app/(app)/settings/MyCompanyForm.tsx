'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { saveMyCompanyAction } from './actions'
import type { MyCompany } from '@/types/db'

type Props = {
  initial: MyCompany | null
}

export function MyCompanyForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setErrors({})
    setMessage(null)

    startTransition(async () => {
      const result = await saveMyCompanyAction(formData)
      if (result.success) {
        setMessage({ type: 'success', text: '保存しました' })
      } else {
        if ('errors' in result && result.errors) {
          setErrors(result.errors)
        }
        setMessage({
          type: 'error',
          text: 'message' in result && result.message ? result.message : '入力内容を確認してください',
        })
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
          id="name"
          name="name"
          label="会社名・屋号 *"
          defaultValue={initial?.name ?? ''}
          required
          error={errors.name?.[0]}
        />
        <Input
          id="representative_name"
          name="representative_name"
          label="代表者名"
          defaultValue={initial?.representative_name ?? ''}
        />
        <Input
            id="postal_code"
            name="postal_code"
            label="郵便番号"
            placeholder="123-4567"
        defaultValue={initial?.postal_code ?? ''}
        />
        <Input
          id="address"
          name="address"
          label="住所"
          defaultValue={initial?.address ?? ''}
        />
        <Input
          id="tel"
          name="tel"
          label="電話番号"
          numericMode="phone" 
          defaultValue={initial?.tel ?? ''}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="メールアドレス"
          defaultValue={initial?.email ?? ''}
          error={errors.email?.[0]}
        />
      </section>

      {/* 振込先 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          振込先
        </h2>
        <Input
          id="bank_name"
          name="bank_name"
          label="銀行名"
          defaultValue={initial?.bank_name ?? ''}
        />
        <Input
          id="bank_branch"
          name="bank_branch"
          label="支店名"
          defaultValue={initial?.bank_branch ?? ''}
        />
        <div>
          <label htmlFor="bank_account_type" className="block text-sm font-medium text-gray-700 mb-1">
            口座種別
          </label>
          <select
            id="bank_account_type"
            name="bank_account_type"
            defaultValue={initial?.bank_account_type ?? ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
            style={{ colorScheme: 'light' }}
          >
            <option value="">選択してください</option>
            <option value="普通">普通</option>
            <option value="当座">当座</option>
          </select>
        </div>
        <Input
          id="bank_account_number"
          name="bank_account_number"
          label="口座番号"
          defaultValue={initial?.bank_account_number ?? ''}
        />
        <Input
          id="bank_account_holder"
          name="bank_account_holder"
          label="口座名義"
          hint="カタカナで入力してください"
          defaultValue={initial?.bank_account_holder ?? ''}
        />
      </section>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? '保存中...' : '保存する'}
        </Button>
      </div>
    </form>
  )
}
