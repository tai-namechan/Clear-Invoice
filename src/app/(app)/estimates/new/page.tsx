import { Card } from '@/components/ui/Card'
import { EstimateForm } from '@/components/forms/EstimateForm'

export default function NewEstimatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">見積書を作成</h1>
      </div>
      <Card className="p-6">
        <EstimateForm />
      </Card>
    </div>
  )
}
