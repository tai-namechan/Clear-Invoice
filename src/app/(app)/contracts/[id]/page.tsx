import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ContractForm } from '@/components/forms/ContractForm'
import { DeleteContractButton } from './DeleteContractButton'
import { createClient } from '@/lib/supabase/server'
import { contractService } from '@/lib/services/contractService'

export default async function EditContractPage({
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">契約書を編集</h1>
          <p className="mt-1 text-sm text-gray-500">{contract.document_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/contracts">
            <Button variant="secondary" size="sm">一覧へ</Button>
          </Link>
          <Link href={`/contracts/${contract.id}/preview`}>
            <Button variant="secondary" size="sm">プレビュー</Button>
          </Link>
          <DeleteContractButton id={contract.id} />
        </div>
      </div>

      <Card className="p-6">
        <ContractForm initial={contract} />
      </Card>
    </div>
  )
}
