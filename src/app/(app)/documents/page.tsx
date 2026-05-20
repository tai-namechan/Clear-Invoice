import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { estimateService } from '@/lib/services/estimateService'
import { invoiceService } from '@/lib/services/invoiceService'
import { contractService } from '@/lib/services/contractService'
import { Button } from '@/components/ui/Button'
import { DocumentList } from '@/components/documents/DocumentList'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [estimates, invoices, contracts] = user
    ? await Promise.all([
        estimateService.list(supabase, user.id),
        invoiceService.list(supabase, user.id),
        contractService.list(supabase, user.id),
      ])
    : [[], [], []]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">書類一覧</h1>
        <div className="flex gap-2">
          <Link href="/estimates/new">
            <Button variant="secondary" size="sm">
              + 見積書
            </Button>
          </Link>
          <Link href="/invoices/new">
            <Button size="sm">+ 請求書</Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-gray-400">読み込み中...</div>}>
        <DocumentList estimates={estimates} invoices={invoices} contracts={contracts} />
      </Suspense>
    </div>
  )
}
