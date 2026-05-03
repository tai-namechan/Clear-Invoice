import { Card } from '@/components/ui/Card'
import { InvoiceForm } from '@/components/forms/InvoiceForm'

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">請求書を作成</h1>
      </div>
      <Card className="p-6">
        <InvoiceForm />
      </Card>
    </div>
  )
}
