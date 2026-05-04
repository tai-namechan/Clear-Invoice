import type { Estimate, Invoice } from '@/types/db'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { estimateService } from '@/lib/services/estimateService'
import { invoiceService } from '@/lib/services/invoiceService'
import { formatCurrency } from '@/lib/utils/currency'

function currentYearMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function isCurrentTargetMonth(targetMonth: string | null): boolean {
  if (!targetMonth) return false
  return targetMonth === currentYearMonth()
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [estimates, invoices] = await Promise.all([
    estimateService.list(supabase, user.id),
    invoiceService.list(supabase, user.id),
  ])

  const displayName =
    (user.user_metadata?.display_name as string) ||
    (user.email?.split('@')[0] ?? 'ゲスト')

  const thisMonth = currentYearMonth()

  const monthlyEstimateTotal = estimates
    .filter((e: Estimate) => isCurrentTargetMonth(e.target_month))
    .reduce((sum: number, e: Estimate) => sum + e.total, 0)

  const monthlyInvoiceTotal = invoices
    .filter((i: Invoice) => isCurrentTargetMonth(i.target_month))
    .reduce((sum: number, i: Invoice) => sum + i.total, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* ログイン中のユーザー */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-gray-500"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">ログイン中のユーザー</p>
          <p className="text-base font-semibold text-gray-900 truncate">{displayName}</p>
        </div>
        <Link
          href="/settings"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition text-xs font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          会社設定
        </Link>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/estimates/new"
          className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">見積書を作成</span>
        </Link>
        <Link
          href="/invoices/new"
          className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-200 p-5 hover:border-green-300 hover:bg-green-50 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">請求書を作成</span>
        </Link>
      </div>
      <Link
        href="/documents"
        className="flex items-center justify-center gap-2 w-full bg-white rounded-2xl border border-gray-200 py-4 px-5 hover:border-gray-300 hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-500">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
        書類一覧を見る
      </Link>

      {/* 集計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 見積書カード */}
        <Link
          href={`/documents?type=estimate&targetMonth=${thisMonth}`}
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 transition group block"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-blue-600"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-600">今月の見積書</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ¥{formatCurrency(monthlyEstimateTotal)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">請求対象月の合計金額</p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <div className="mt-4 bg-blue-50 rounded-xl py-3 flex items-center justify-center gap-2 text-blue-700 text-sm font-medium">
            今月分の一覧を見る
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </Link>

        {/* 請求書カード */}
        <Link
          href={`/documents?type=invoice&targetMonth=${thisMonth}`}
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-green-300 transition group block"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-green-600"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <polyline points="9 15 11 17 15 13" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700">今月の請求書</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ¥{formatCurrency(monthlyInvoiceTotal)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">請求対象月の合計金額</p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <div className="mt-4 bg-green-50 rounded-xl py-3 flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
            今月分の一覧を見る
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </Link>
      </div>

      <p className="text-center text-xs text-gray-400">※ 金額は請求対象月が今月の書類の合計です。</p>
    </div>
  )
}
