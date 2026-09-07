'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
    >
      ログアウト
    </button>
  )
}
