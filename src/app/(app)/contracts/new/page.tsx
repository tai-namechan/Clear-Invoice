import { Card } from '@/components/ui/Card'
import { ContractForm } from '@/components/forms/ContractForm'

export default function NewContractPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">契約書を作成</h1>
      </div>
      <Card className="p-6">
        <ContractForm />
      </Card>
    </div>
  )
}
