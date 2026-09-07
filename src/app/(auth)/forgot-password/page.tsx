'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(
        error.message.includes('rate') || error.status === 429
          ? '送信回数が上限に達しました。しばらく待ってから再試行してください。'
          : 'メールの送信に失敗しました。時間をおいて再度お試しください。'
      )
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo />
        <p className="text-sm md:text-base text-gray-500 text-center">
          手書きを卒業し、自動化へ。
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_16px_50px_rgba(15,23,42,0.08)] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">パスワード再設定</h1>
        <p className="text-gray-500 mb-6 text-center text-sm">
          登録したメールアドレスを入力してください
        </p>

        {sent ? (
          <div className="space-y-6">
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
              再設定用のリンクを送信しました。メール内のリンクからパスワードを再設定してください。届かない場合は迷惑メールフォルダもご確認ください。
            </div>
            <Link
              href="/login"
              className="block text-center bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-700 transition"
            >
              ログインへ戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-gray-700 font-medium text-sm">メールアドレス</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="rounded-xl border border-gray-200 px-4 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '送信中...' : '再設定メールを送る'}
            </button>
          </form>
        )}

        {!sent && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              ログインへ戻る
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
