'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { deleteEstimateAction } from '@/app/(app)/estimates/actions'

export function DeleteEstimateButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('この見積書を削除しますか？この操作は元に戻せません。')) return
    startTransition(async () => {
      await deleteEstimateAction(id)
    })
  }

  return (
    <Button variant="danger" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? '削除中...' : '削除'}
    </Button>
  )
}
