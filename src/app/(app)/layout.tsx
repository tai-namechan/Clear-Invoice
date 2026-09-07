import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { MobileMenu } from '@/components/ui/MobileMenu'
import { Logo } from '@/components/ui/Logo'
import { UserMenu } from '@/components/ui/UserMenu'

const navItems = [
  { href: '/documents', label: '書類一覧' },
  { href: '/estimates', label: '見積書' },
  { href: '/invoices', label: '請求書' },
  { href: '/contracts', label: '契約書' },
  { href: '/account', label: 'アカウント' },
  { href: '/settings', label: '会社設定' },
] as const

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
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-white/60 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
              >
                {item.label}
              </Link>
            ))}
            <LogoutButton />
            <div className="ml-1">
              <UserMenu displayName={displayName} />
            </div>
          </nav>

          <div className="lg:hidden">
            <MobileMenu displayName={displayName} />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
        <div className="lg:hidden mt-8 pb-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-sm font-medium text-gray-600 hover:bg-gray-50"
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
