'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function MobileMenu({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"
        aria-label="メニュー"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-600"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <>
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/30 z-20"
            onClick={() => setOpen(false)}
          />
          {/* メニュー本体 */}
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-white z-30 shadow-xl flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">ログイン中</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                aria-label="メニューを閉じる"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ダッシュボード
              </Link>
              <Link
                href="/documents"
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                書類一覧
              </Link>
              <Link
                href="/estimates"
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                見積書
              </Link>
              <Link
                href="/invoices"
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                請求書
              </Link>
              <Link
                href="/contracts"
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                契約書
              </Link>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                アカウント
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                会社設定
              </Link>
            </nav>
            <div className="p-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-3 rounded-lg text-red-600 hover:bg-red-50"
              >
                ログアウト
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
