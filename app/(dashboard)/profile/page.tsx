import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import QRCodeDisplay from '@/components/user/QRCodeDisplay'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function ProfilePage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
            <LogoutButton />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
              <p className="mt-1 text-lg text-gray-900">{profile.full_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <p className="mt-1 text-lg text-gray-900">
                {profile.role === 'admin' && 'Yönetici'}
                {profile.role === 'manager' && 'Müdür'}
                {profile.role === 'employee' && 'Çalışan'}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Kod</h2>
              <QRCodeDisplay qrCodeString={profile.qr_code} userName={profile.full_name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

