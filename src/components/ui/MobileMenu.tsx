'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const menuLinks = [
  { href: '/', label: 'ダッシュボード' },
  { href: '/documents', label: '書類一覧' },
  { href: '/estimates', label: '見積書' },
  { href: '/invoices', label: '請求書' },
  { href: '/contracts', label: '契約書' },
  { href: '/account', label: 'アカウント' },
  { href: '/settings', label: '会社設定' },
] as const

export function MobileMenu({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  const menu = open
    ? createPortal(
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="メニューを閉じる"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-0 right-0 bottom-0 w-[min(20rem,88vw)] flex flex-col bg-white shadow-2xl"
            style={{ backgroundColor: '#ffffff' }}
            role="dialog"
            aria-modal="true"
            aria-label="メニュー"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2 bg-white">
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
            <nav className="flex-1 p-2 overflow-y-auto bg-white">
              {menuLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-2 border-t border-gray-200 bg-white">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-3 rounded-lg text-red-600 hover:bg-red-50"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-xl bg-white shadow-[0_4px_16px_rgba(15,23,42,0.08)] flex items-center justify-center"
        aria-label="メニュー"
        aria-expanded={open}
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
      {menu}
    </>
  )
}
