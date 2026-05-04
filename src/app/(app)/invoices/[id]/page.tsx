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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">請求書を編集</h1>
          <p className="mt-1 text-sm text-gray-500">{detail.invoice.document_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/documents">
            <Button variant="secondary" size="sm">一覧へ</Button>
          </Link>
          <Link href={`/invoices/${detail.invoice.id}/preview`}>
            <Button variant="secondary" size="sm">プレビュー</Button>
          </Link>
          <DeleteInvoiceButton id={detail.invoice.id} />
        </div>
      </div>

      <Card className="p-6">
        <InvoiceForm initial={detail} />
      </Card>
    </div>
  )
}
