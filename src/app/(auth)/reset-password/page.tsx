'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.63-4.208M9.88 9.88A3 3 0 1014.12 14.12M3 3l18 18" />
    </svg>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled || !session) return
      setHasSession(true)
      setReady(true)
    })

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (user) {
        setHasSession(true)
        setReady(true)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 400))
      if (cancelled) return
      const { data: { user: retryUser } } = await supabase.auth.getUser()
      setHasSession(!!retryUser)
      setReady(true)
    }

    void checkSession()
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('パスワードの再設定に失敗しました。リンクの有効期限が切れている場合があります。')
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">新しいパスワード</h1>
        <p className="text-gray-500 mb-6 text-center text-sm">
          新しいパスワードを入力してください
        </p>

        {!ready ? (
          <p className="text-center text-sm text-gray-500">確認しています...</p>
        ) : !hasSession ? (
          <div className="space-y-6">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              再設定リンクが無効か、有効期限が切れています。もう一度メールを送信してください。
            </div>
            <Link
              href="/forgot-password"
              className="block text-center bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-700 transition"
            >
              再設定メールを送り直す
            </Link>
            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                ログインへ戻る
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-700 font-medium text-sm">新しいパスワード（6文字以上）</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-gray-700 font-medium text-sm">パスワード（確認）</span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
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
              {loading ? '再設定中...' : 'パスワードを再設定'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
