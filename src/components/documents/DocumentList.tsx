'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { formatWarekiLong, formatWarekiYearMonth } from '@/lib/utils/wareki'
import { formatCurrency } from '@/lib/utils/currency'
import type { Estimate, Invoice } from '@/types/db'

type DocType = 'all' | 'estimate' | 'invoice'

type DocumentRow = {
  id: string
  docType: 'estimate' | 'invoice'
  document_number: string
  client_name: string
  client_honorific: string | null
  issue_date: string
  target_month: string | null
  total: number
  status: 'draft' | 'issued'
  subject: string | null
}

type Props = {
  estimates: Estimate[]
  invoices: Invoice[]
}

function toBadgeLabel(docType: 'estimate' | 'invoice') {
  return docType === 'estimate' ? '見積書' : '請求書'
}

function toBadgeStyle(docType: 'estimate' | 'invoice') {
  return docType === 'estimate'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-green-100 text-green-700'
}

export function DocumentList({ estimates, invoices }: Props) {
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
    ...estimates.map((e) => ({
      id: e.id,
      docType: 'estimate' as const,
      document_number: e.document_number,
      client_name: e.client_name,
      client_honorific: e.client_honorific,
      issue_date: e.issue_date,
      target_month: e.target_month,
      total: e.total,
      status: e.status,
      subject: e.subject,
    })),
    ...invoices.map((i) => ({
      id: i.id,
      docType: 'invoice' as const,
      document_number: i.document_number,
      client_name: i.client_name,
      client_honorific: i.client_honorific,
      issue_date: i.issue_date,
      target_month: i.target_month,
      total: i.total,
      status: i.status,
      subject: i.subject,
    })),
  ].sort((a, b) => {
    if (b.issue_date !== a.issue_date) return b.issue_date.localeCompare(a.issue_date)
    return b.document_number.localeCompare(a.document_number)
  })

  const filtered = allDocs
    .filter((d) => type === 'all' || d.docType === type)
    .filter((d) => !targetMonth || d.target_month === targetMonth)

  const tabItems: { label: string; value: DocType }[] = [
    { label: 'すべて', value: 'all' },
    { label: '見積書', value: 'estimate' },
    { label: '請求書', value: 'invoice' },
  ]

  return (
    <div className="space-y-4">
      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabItems.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ type: tab.value === 'all' ? null : tab.value })}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              type === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 請求対象月フィルター */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <label htmlFor="month-filter" className="block text-xs text-gray-500 mb-1">
            請求対象月
          </label>
          <input
            ref={monthInputRef}
            id="month-filter"
            type="month"
            defaultValue={targetMonth}
            onChange={(e) => updateParams({ targetMonth: e.target.value || null })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            style={{ colorScheme: 'light' }}
          />
        </div>
        {targetMonth && (
          <button
            type="button"
            onClick={() => updateParams({ targetMonth: null })}
            className="mt-5 px-3 py-2.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
          >
            クリア
          </button>
        )}
      </div>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
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
            const editHref =
              doc.docType === 'estimate' ? `/estimates/${doc.id}` : `/invoices/${doc.id}`
            const previewHref =
              doc.docType === 'estimate'
                ? `/estimates/${doc.id}/preview`
                : `/invoices/${doc.id}/preview`

            return (
              <div
                key={`${doc.docType}-${doc.id}`}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${toBadgeStyle(doc.docType)}`}
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
                    <span
                      className={`text-xs ${
                        doc.status === 'issued' ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {doc.status === 'issued' ? '発行済' : '下書き'}
                    </span>
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
