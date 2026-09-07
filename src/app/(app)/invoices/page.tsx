import { formatWarekiLong, formatWarekiYearMonth } from '@/lib/utils/wareki'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'
import { invoiceService } from '@/lib/services/invoiceService'
import { formatCurrency } from '@/lib/utils/currency'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const invoices = user ? await invoiceService.list(supabase, user.id) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">請求書</h1>
        <Link href="/invoices/new">
          <Button>+ 新規作成</Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">請求書がまだありません</p>
          <p className="mt-1 text-sm text-gray-400">「新規作成」から最初の請求書を作りましょう</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`}>
              <Card className="p-4 hover:shadow-[0_12px_36px_rgba(15,23,42,0.1)] transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{inv.document_number}</span>
                      <span>•</span>
                      <span>{formatWarekiLong(inv.issue_date)}</span>
                    </div>
                    <p className="mt-1 text-base font-medium text-gray-900 truncate">
                      {inv.client_name} {inv.client_honorific}
                    </p>
                        {inv.target_month && (
                            <p className="mt-0.5 text-sm text-gray-600 truncate">
                                {formatWarekiYearMonth(inv.target_month)}分
                                {inv.subject ? ` ・ ${inv.subject}` : ''}
                            </p>
                        )}
                        {!inv.target_month && inv.subject && (
                            <p className="mt-0.5 text-sm text-gray-600 truncate">{inv.subject}</p>
                        )}
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-gray-900">
                      ￥{formatCurrency(inv.total)}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
