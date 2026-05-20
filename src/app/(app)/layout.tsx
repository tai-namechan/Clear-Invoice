import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { MobileMenu } from '@/components/ui/MobileMenu'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const displayName =
    (user?.user_metadata?.display_name as string) ||
    user?.email ||
    'ゲスト'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Clear Invoice
          </Link>

          {/* PC: ナビメニュー */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/documents" className="text-gray-600 hover:text-gray-900">
              書類一覧
            </Link>
            <Link href="/estimates" className="text-gray-600 hover:text-gray-900">
              見積書
            </Link>
            <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
              請求書
            </Link>
            <Link href="/contracts" className="text-gray-600 hover:text-gray-900">
              契約書
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-gray-900">
              アカウント
            </Link>
            <Link href="/settings" className="text-gray-600 hover:text-gray-900">
              会社設定
            </Link>
            <LogoutButton />
            <div
              className="ml-2 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600"
              title={displayName}
            >
              {displayName.slice(0, 2)}
            </div>
          </nav>

          {/* スマホ: メニューボタン */}
          <div className="md:hidden">
            <MobileMenu displayName={displayName} />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
        <div className="md:hidden mt-8 pb-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            ダッシュボードへ戻る
          </Link>
        </div>
      </main>
    </div>
  )
}
