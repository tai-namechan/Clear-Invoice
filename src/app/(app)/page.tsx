import type { Estimate, Invoice } from '@/types/db'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { estimateService } from '@/lib/services/estimateService'
import { invoiceService } from '@/lib/services/invoiceService'
import { formatCurrency } from '@/lib/utils/currency'

function currentYear(): string {
  return String(new Date().getFullYear())
}

/** 請求対象月（YYYY-MM）が今年度（1月〜12月）かどうか */
function isInCurrentYear(targetMonth: string | null): boolean {
  if (!targetMonth) return false
  return targetMonth.startsWith(currentYear())
}

function IconDocumentPlus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  )
}

function IconDocument({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  )
}

function IconInvoice({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  )
}

function IconArrow({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
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

  const yearlyEstimateTotal = estimates
    .filter((e: Estimate) => isInCurrentYear(e.target_month))
    .reduce((sum: number, e: Estimate) => sum + e.total, 0)

  const yearlyInvoiceTotal = invoices
    .filter((i: Invoice) => isInCurrentYear(i.target_month))
    .reduce((sum: number, i: Invoice) => sum + i.total, 0)

  return (
    <div className="space-y-6">
      <div className="relative flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            ダッシュボード
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            書類の作成・管理をスムーズに。ビジネスをもっとシンプルに。
          </p>
        </div>
        <div className="hidden md:block pb-1 pr-2 text-right">
          <p className="text-base font-medium text-slate-600 tracking-wide">
            書類で、ビジネスを前に進める。
          </p>
          <svg viewBox="0 0 220 12" className="ml-auto mt-1 w-48 text-sky-300" aria-hidden="true">
            <path
              d="M2 8 C 40 2, 90 11, 130 6 S 190 2, 218 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] px-5 py-4 flex items-center gap-4">
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
          <p className="text-lg font-semibold text-gray-900 truncate">{displayName}</p>
        </div>
        <Link
          href="/settings"
          className="flex-shrink-0 flex items-center gap-1.5 px-4 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          会社設定
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/estimates/new"
          className="group flex items-center gap-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-5 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(37,99,235,0.12)] transition"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <IconDocumentPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">見積書を作成</p>
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
              取引先に送る見積書を作成できます
            </p>
          </div>
          <IconArrow className="w-5 h-5 text-blue-500 flex-shrink-0 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/invoices/new"
          className="group flex items-center gap-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-5 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)] transition"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <IconDocumentPlus className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">請求書を作成</p>
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
              取引先に送る請求書を作成できます
            </p>
          </div>
          <IconArrow className="w-5 h-5 text-emerald-500 flex-shrink-0 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/contracts/new"
          className="group flex items-center gap-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-5 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(245,158,11,0.12)] transition"
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <IconDocument className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">契約書を作成</p>
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
              業務に必要な契約書を作成できます
            </p>
          </div>
          <IconArrow className="w-5 h-5 text-amber-500 flex-shrink-0 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <Link
        href="/documents"
        className="group flex items-center justify-center gap-2 w-full bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] py-4 px-5 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(15,23,42,0.1)] transition text-sm font-semibold text-gray-800"
      >
        <IconDocument className="w-5 h-5 text-blue-500" />
        書類一覧を見る
        <IconArrow className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition" />
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/documents?type=estimate"
          className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-6 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(37,99,235,0.12)] transition group block"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IconDocument className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-600">今年の見積書</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
                ¥{formatCurrency(yearlyEstimateTotal)}
              </p>
            </div>
          </div>
          <div className="mt-5 bg-blue-50 rounded-xl py-3 flex items-center justify-center gap-2 text-blue-700 text-sm font-medium">
            今年分の一覧を見る
            <IconArrow className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/documents?type=invoice"
          className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-6 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)] transition group block"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <IconInvoice className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-700">今年の請求書</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
                ¥{formatCurrency(yearlyInvoiceTotal)}
              </p>
            </div>
          </div>
          <div className="mt-5 bg-emerald-50 rounded-xl py-3 flex items-center justify-center gap-2 text-emerald-700 text-sm font-medium">
            今年分の一覧を見る
            <IconArrow className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <p className="text-center text-xs text-gray-400">※ 今年（1月〜12月）の合計金額です。</p>
    </div>
  )
}
