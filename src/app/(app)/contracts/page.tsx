import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'
import { contractService } from '@/lib/services/contractService'
import { formatWarekiLong } from '@/lib/utils/wareki'

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const contracts = user ? await contractService.list(supabase, user.id) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">契約書</h1>
        <Link href="/contracts/new">
          <Button>+ 新規作成</Button>
        </Link>
      </div>

      {contracts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">契約書がまだありません</p>
          <p className="mt-1 text-sm text-gray-400">「新規作成」から最初の契約書を作りましょう</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <Link key={contract.id} href={`/contracts/${contract.id}`}>
              <Card className="p-4 hover:shadow-[0_12px_36px_rgba(15,23,42,0.1)] transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{contract.document_number}</span>
                      <span>•</span>
                      <span>{formatWarekiLong(contract.contract_date)}</span>
                    </div>
                    <p className="mt-1 text-base font-medium text-gray-900 truncate">
                      {contract.title}
                    </p>
                    {contract.notes && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2 whitespace-pre-wrap">
                        {contract.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                      契約書
                    </span>
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
