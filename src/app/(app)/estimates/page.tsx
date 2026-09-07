import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'
import { estimateService } from '@/lib/services/estimateService'
import { formatWarekiLong } from '@/lib/utils/wareki'
import { formatCurrency } from '@/lib/utils/currency'

export default async function EstimatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const estimates = user ? await estimateService.list(supabase, user.id) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">見積書</h1>
        <Link href="/estimates/new">
          <Button>+ 新規作成</Button>
        </Link>
      </div>

      {estimates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">見積書がまだありません</p>
          <p className="mt-1 text-sm text-gray-400">「新規作成」から最初の見積書を作りましょう</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {estimates.map((est) => (
            <Link key={est.id} href={`/estimates/${est.id}`}>
              <Card className="p-4 hover:shadow-[0_12px_36px_rgba(15,23,42,0.1)] transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{est.document_number}</span>
                      <span>•</span>
                      <span>{formatWarekiLong(est.issue_date)}</span>
                    </div>
                    <p className="mt-1 text-base font-medium text-gray-900 truncate">
                      {est.client_name} {est.client_honorific}
                    </p>
                    {est.subject && (
                      <p className="mt-0.5 text-sm text-gray-600 truncate">{est.subject}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-gray-900">
                      ￥{formatCurrency(est.total)}
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
