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
            <Link href="/estimates" className="text-gray-600 hover:text-gray-900">
              見積書
            </Link>
            <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
              請求書
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
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
