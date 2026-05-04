'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!displayName.trim()) {
      setError('お名前を入力してください')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-2">
        Clear Invoice
      </h1>
      <p className="text-lg md:text-2xl text-gray-600 text-center mb-8">
        手書きの請求書を、もっとカンタンに。
      </p>

      <div className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* 左: 画像エリア */}
        <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-50 p-8 md:p-12">
          <Image
            src="/images/auth-hero.png"
            alt="Clear Invoice Hero"
            width={700}
            height={500}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* 右: フォームエリア */}
        <div className="w-full md:w-1/3 flex flex-col justify-center p-8 md:p-12">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">新規登録</h2>
            <p className="text-gray-500 mb-6 text-center">Clear Invoice のアカウントを作成</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-gray-700 font-medium">お名前</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="山田 太郎"
                  autoComplete="name"
                  className="rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-gray-700 font-medium">メールアドレス</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>

              <div className="flex flex-col gap-1">
                <span className="text-gray-700 font-medium">パスワード（6文字以上）</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                <span className="text-gray-700 font-medium">パスワード（確認）</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-blue-900 text-white font-bold py-3 rounded-xl shadow hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登録中...' : 'アカウント作成'}
              </button>
            </form>

            <div className="mt-6 text-center text-gray-600">
              すでにアカウントをお持ちの方は{' '}
              <Link
                href="/login"
                className="text-blue-900 font-semibold underline hover:text-blue-700"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
