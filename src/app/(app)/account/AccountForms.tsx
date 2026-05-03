'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { updateDisplayNameAction, updatePasswordAction } from './actions'

type Props = {
  email: string
  initialDisplayName: string
}

export function AccountForms({ email, initialDisplayName }: Props) {
  const [isPending, startTransition] = useTransition()
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setNameMessage(null)

    startTransition(async () => {
      const result = await updateDisplayNameAction(formData)
      if (result.success) {
        setNameMessage({ type: 'success', text: '保存しました' })
      } else {
        setNameMessage({ type: 'error', text: result.message ?? '失敗しました' })
      }
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setPwMessage(null)

    startTransition(async () => {
      const result = await updatePasswordAction(formData)
      if (result.success) {
        setPwMessage({ type: 'success', text: 'パスワードを変更しました' })
        ;(e.target as HTMLFormElement).reset()
      } else {
        setPwMessage({ type: 'error', text: result.message ?? '失敗しました' })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 表示名 */}
      <form onSubmit={handleNameSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          お名前
        </h2>
        <Input
          id="display_name"
          name="display_name"
          label="表示名"
          placeholder="山田 太郎"
          hint="ダッシュボードに表示されます"
          defaultValue={initialDisplayName}
        />
        {nameMessage && (
          <div
            className={`p-3 rounded-lg text-sm ${
              nameMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {nameMessage.text}
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? '保存中...' : '保存する'}
          </Button>
        </div>
      </form>

      {/* メールアドレス（読み取り専用） */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          メールアドレス
        </h2>
        <p className="text-sm text-gray-700">{email}</p>
        <p className="text-xs text-gray-500">メールアドレスは変更できません。</p>
      </div>

      {/* パスワード変更 */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
          パスワード変更
        </h2>
        <Input
          id="new_password"
          name="new_password"
          type="password"
          label="新しいパスワード（6文字以上）"
          autoComplete="new-password"
          required
          minLength={6}
        />
        {pwMessage && (
          <div
            className={`p-3 rounded-lg text-sm ${
              pwMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {pwMessage.text}
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? '変更中...' : 'パスワードを変更'}
          </Button>
        </div>
      </form>
    </div>
  )
}
