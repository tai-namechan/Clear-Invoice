'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { formatWarekiLong, formatWarekiYearMonth } from '@/lib/utils/wareki'
import { formatCurrency } from '@/lib/utils/currency'
import type { Estimate, Invoice, Contract } from '@/types/db'

type DocType = 'all' | 'estimate' | 'invoice' | 'contract'

type EstimateRow = {
  id: string
  docType: 'estimate' | 'invoice'
  document_number: string
  client_name: string
  client_honorific: string | null
  issue_date: string
  target_month: string | null
  total: number
  subject: string | null
}

type ContractRow = {
  id: string
  docType: 'contract'
  document_number: string
  title: string
  notes: string | null
  issue_date: string
  target_month: null
}

type DocumentRow = EstimateRow | ContractRow

type Props = {
  estimates: Estimate[]
  invoices: Invoice[]
  contracts: Contract[]
}

function toBadgeLabel(docType: DocType) {
  if (docType === 'estimate') return '見積書'
  if (docType === 'invoice') return '請求書'
  return '契約書'
}

function toBadgeClass(docType: DocType) {
  if (docType === 'estimate') return 'bg-blue-100 text-blue-700'
  if (docType === 'invoice') return 'bg-green-100 text-green-700'
  return 'bg-amber-100 text-amber-700'
}

export function DocumentList({ estimates, invoices, contracts }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const type = (searchParams.get('type') ?? 'all') as DocType
  const targetMonth = searchParams.get('targetMonth') ?? ''

  const monthInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (monthInputRef.current) {
      monthInputRef.current.value = targetMonth
    }
  }, [targetMonth])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const qs = params.toString()
      router.push(`${pathname}${qs ? '?' + qs : ''}`)
    },
    [router, pathname, searchParams]
  )

  const allDocs: DocumentRow[] = [
    ...estimates.map((e): EstimateRow => ({
      id: e.id,
      docType: 'estimate',
      document_number: e.document_number,
      client_name: e.client_name,
      client_honorific: e.client_honorific,
      issue_date: e.issue_date,
      target_month: e.target_month,
      total: e.total,
      subject: e.subject,
    })),
    ...invoices.map((i): EstimateRow => ({
      id: i.id,
      docType: 'invoice',
      document_number: i.document_number,
      client_name: i.client_name,
      client_honorific: i.client_honorific,
      issue_date: i.issue_date,
      target_month: i.target_month,
      total: i.total,
      subject: i.subject,
    })),
    ...contracts.map((c): ContractRow => ({
      id: c.id,
      docType: 'contract',
      document_number: c.document_number,
      title: c.title,
      notes: c.notes,
      issue_date: c.contract_date,
      target_month: null,
    })),
  ].sort((a, b) => {
    if (b.issue_date !== a.issue_date) return b.issue_date.localeCompare(a.issue_date)
    return b.document_number.localeCompare(a.document_number)
  })

  // 請求対象月フィルターは契約書には適用しない（契約書は常に表示）
  const filtered = allDocs
    .filter((d) => type === 'all' || d.docType === type)
    .filter((d) => {
      if (!targetMonth) return true
      if (d.docType === 'contract') return false  // 月フィルター時は契約書を除外
      return d.target_month === targetMonth
    })

  const tabItems: { label: string; value: DocType }[] = [
    { label: 'すべて', value: 'all' },
    { label: '見積書', value: 'estimate' },
    { label: '請求書', value: 'invoice' },
    { label: '契約書', value: 'contract' },
  ]

  const showMonthFilter = type !== 'contract'

  return (
    <div className="space-y-4">
      {/* タブ */}
      <div className="flex gap-1 bg-gray-100/90 rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        {tabItems.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ type: tab.value === 'all' ? null : tab.value, targetMonth: null })}
            className={`flex-1 py-2 px-1 rounded-lg text-xs sm:text-sm font-medium transition ${
              type === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 請求対象月フィルター（契約書タブでは非表示） */}
      {showMonthFilter && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="month-filter" className="block text-xs text-gray-500">
            請求対象月
          </label>
          <div className="flex items-center gap-2 min-w-0">
            <input
              ref={monthInputRef}
              id="month-filter"
              type="month"
              defaultValue={targetMonth}
              onChange={(e) => updateParams({ targetMonth: e.target.value || null })}
              className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              style={{ colorScheme: 'light' }}
            />
            {targetMonth && (
              <button
                type="button"
                onClick={() => updateParams({ targetMonth: null })}
                className="flex-shrink-0 px-3 py-2.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                クリア
              </button>
            )}
          </div>
        </div>
      )}

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-8 text-center">
          <p className="text-gray-500">書類がありません</p>
          {targetMonth && (
            <p className="mt-1 text-sm text-gray-400">
              {formatWarekiYearMonth(targetMonth)}の書類が見つかりませんでした
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => {
            if (doc.docType === 'contract') {
              return (
                <div
                  key={`contract-${doc.id}`}
                  className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          契約書
                        </span>
                        <span className="text-xs text-gray-500">{doc.document_number}</span>
                      </div>
                      <p className="mt-1 text-base font-medium text-gray-900 truncate">
                        {doc.title}
                      </p>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {formatWarekiLong(doc.issue_date)}
                      </div>
                      {doc.notes && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2 whitespace-pre-wrap">
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/contracts/${doc.id}/preview`}
                      className="flex-1 py-2 text-center text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                    >
                      契約書を見る
                    </Link>
                    <Link
                      href={`/contracts/${doc.id}`}
                      className="flex-1 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      編集
                    </Link>
                  </div>
                </div>
              )
            }

            const editHref =
              doc.docType === 'estimate' ? `/estimates/${doc.id}` : `/invoices/${doc.id}`
            const previewHref =
              doc.docType === 'estimate'
                ? `/estimates/${doc.id}/preview`
                : `/invoices/${doc.id}/preview`

            return (
              <div
                key={`${doc.docType}-${doc.id}`}
                className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${toBadgeClass(doc.docType)}`}
                      >
                        {toBadgeLabel(doc.docType)}
                      </span>
                      <span className="text-xs text-gray-500">{doc.document_number}</span>
                    </div>
                    <p className="mt-1 text-base font-medium text-gray-900 truncate">
                      {doc.client_name}
                      {doc.client_honorific ? ` ${doc.client_honorific}` : ''}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      <span>{formatWarekiLong(doc.issue_date)}</span>
                      {doc.target_month && (
                        <>
                          <span>•</span>
                          <span>{formatWarekiYearMonth(doc.target_month)}分</span>
                        </>
                      )}
                      {doc.subject && (
                        <>
                          <span>•</span>
                          <span className="truncate">{doc.subject}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-semibold text-gray-900">
                      ¥{formatCurrency(doc.total)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={previewHref}
                    className="flex-1 py-2 text-center text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                  >
                    {doc.docType === 'estimate' ? '見積書を見る' : '請求書を見る'}
                  </Link>
                  <Link
                    href={editHref}
                    className="flex-1 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    編集
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
