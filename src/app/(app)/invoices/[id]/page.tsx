import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { DeleteInvoiceButton } from './DeleteInvoiceButton'
import { createClient } from '@/lib/supabase/server'
import { invoiceService } from '@/lib/services/invoiceService'

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const detail = await invoiceService.getDetail(supabase, user.id, id)
  if (!detail) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">請求書を編集</h1>
          <p className="mt-1 text-sm text-gray-500">{detail.invoice.document_number}</p>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/invoices">
                <Button variant="secondary" size="sm">一覧へ</Button>
            </Link>
            <Button variant="secondary" size="sm" disabled title="PDF機能は近日公開予定">
                PDF（準備中）
            </Button>
            <DeleteInvoiceButton id={detail.invoice.id} />
        </div>
      </div>

      <Card className="p-6">
        <InvoiceForm initial={detail} />
      </Card>
    </div>
  )
}
