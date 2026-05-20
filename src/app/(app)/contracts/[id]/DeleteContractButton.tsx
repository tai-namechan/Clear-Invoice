'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { deleteContractAction } from '@/app/(app)/contracts/actions'

export function DeleteContractButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleClick = async () => {
    if (!confirm('この契約書を削除しますか？この操作は元に戻せません。')) return
    setIsPending(true)
    const result = await deleteContractAction(id)
    if (result?.success) {
      router.push('/contracts')
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
