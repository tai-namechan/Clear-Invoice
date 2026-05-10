'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export function SavedToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('saved') !== '1') return
    setVisible(true)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('saved')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? '?' + qs : ''}`)

    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium bg-green-600 text-white">
      ✓ 保存しました
    </div>
  )
}
