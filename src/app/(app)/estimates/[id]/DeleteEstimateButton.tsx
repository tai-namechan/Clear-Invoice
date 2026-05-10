'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { deleteEstimateAction } from '@/app/(app)/estimates/actions'

export function DeleteEstimateButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleClick = async () => {
    if (!confirm('この見積書を削除しますか？この操作は元に戻せません。')) return
    setIsPending(true)
    const result = await deleteEstimateAction(id)
    if (result?.success) {
      router.push('/documents')
    } else {
      setIsPending(false)
    }
  }

  return (
    <Button variant="danger" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? '削除中...' : '削除'}
    </Button>
  )
}
