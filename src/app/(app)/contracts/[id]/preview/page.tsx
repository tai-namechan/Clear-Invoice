import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { contractService } from '@/lib/services/contractService'
import { ContractPreview } from '@/components/preview/ContractPreview'
import { PreviewActions } from '@/components/preview/PreviewActions'
import { ScaledPreviewContainer } from '@/components/preview/ScaledPreviewContainer'
import { SavedToast } from '@/components/ui/SavedToast'

export default async function ContractPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const contract = await contractService.getDetail(supabase, user.id, id)
  if (!contract) return notFound()

  return (
    <div className="space-y-4">
      <Suspense><SavedToast /></Suspense>

      {/* 操作バー */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/contracts"
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
            契約書一覧
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={`/contracts/${id}`}
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            編集
          </Link>
        </div>
        <PreviewActions
          documentNumber={contract.document_number}
          docType="contract"
          clientName={contract.title}
          issueDate={contract.contract_date}
        />
      </div>

      {/* A4プレビュー */}
      <ScaledPreviewContainer>
        <ContractPreview contract={contract} />
      </ScaledPreviewContainer>
    </div>
  )
}
