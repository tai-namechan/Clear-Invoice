import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/server'
import { AccountForms } from './AccountForms'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''
  const displayName = (user?.user_metadata?.display_name as string) ?? ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">アカウント</h1>
        <p className="mt-1 text-sm text-gray-500">
          ログイン情報や表示名を管理します。
        </p>
      </div>

      <Card className="p-6">
        <AccountForms email={email} initialDisplayName={displayName} />
      </Card>
    </div>
  )
}
