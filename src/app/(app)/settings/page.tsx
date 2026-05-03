import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/server'
import { myCompanyService } from '@/lib/services/myCompanyService'
import { MyCompanyForm } from './MyCompanyForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const myCompany = user ? await myCompanyService.getByUserId(supabase, user.id) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          自社情報を入力すると、見積書・請求書のPDFに反映されます。
        </p>
      </div>

      <Card className="p-6">
        <MyCompanyForm initial={myCompany} />
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
            印鑑について
          </h2>
          <p className="text-sm text-gray-600">
            PDFの自社情報の右側に押印用の枠を表示します。出力後に手で印鑑を押してご利用ください。
          </p>
        </div>
      </Card>
    </div>
  )
}
