'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">ログイン</h2>
            <p className="text-gray-500 mb-6 text-center">Clear Invoice にログイン</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <label className="flex flex-col gap-1">
                <span className="text-gray-700 font-medium">パスワード</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>

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
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>

            <div className="mt-6 text-center text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link
                href="/signup"
                className="text-blue-900 font-semibold underline hover:text-blue-700"
              >
                アカウント作成
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
