import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { estimateService } from '@/lib/services/estimateService'
import { DocumentPreview } from '@/components/preview/DocumentPreview'
import { PreviewActions } from '@/components/preview/PreviewActions'

export default async function EstimatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return notFound()

  const detail = await estimateService.getDetail(supabase, user.id, id)
  if (!detail) return notFound()

  return (
    <div className="space-y-4">
      {/* 操作バー */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="text-sm text-gray-500 hover:text-gray-900 transition flex items-center gap-1"
          >
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
            書類一覧
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={`/estimates/${id}`}
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            編集
          </Link>
        </div>
        <PreviewActions
          documentNumber={detail.estimate.document_number}
          docType="estimate"
          clientName={detail.estimate.client_name}
          issueDate={detail.estimate.issue_date}
        />
      </div>

      {/* A4プレビュー */}
      <div className="a4-container overflow-x-auto">
        <div className="min-w-[680px]">
          <DocumentPreview
            docType="estimate"
            estimate={detail.estimate}
            items={detail.items}
          />
        </div>
      </div>
    </div>
  )
}
