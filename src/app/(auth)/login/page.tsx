'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'

function loginErrorMessage(code: string | null): string | null {
  if (code === 'reset-link') {
    return '再設定リンクが無効か、有効期限が切れています。もう一度お試しください。'
  }
  return null
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const message = loginErrorMessage(params.get('error'))
    if (message) setError(message)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">ログイン</h1>
        <p className="text-gray-500 mb-6 text-center text-sm">Clear Invoice にログイン</p>

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
          <label className="flex flex-col gap-1">
            <span className="text-gray-700 font-medium text-sm">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-xl border border-gray-200 px-4 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>
          <div className="-mt-1 text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              パスワードを忘れた方はこちら
            </Link>
          </div>

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
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{' '}
          <Link
            href="/signup"
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            アカウント作成
          </Link>
        </div>
      </div>
    </div>
  )
}
