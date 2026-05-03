'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { deleteInvoiceAction } from '@/app/(app)/invoices/actions'

export function DeleteInvoiceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('この請求書を削除しますか？この操作は元に戻せません。')) return
    startTransition(async () => {
      await deleteInvoiceAction(id)
    })
  }

  return (
    <Button variant="danger" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? '削除中...' : '削除'}
    </Button>
  )
}
