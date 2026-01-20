import { getUserProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import DeviceTracking from '@/components/device/DeviceTracking'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Giriş/Çıkış', href: '/dashboard/attendance' },
    { name: 'İş Kayıtları', href: '/dashboard/work-logs' },
    { name: 'Mesajlar', href: '/dashboard/messages' },
    { name: 'KPI', href: '/dashboard/kpi' },
    { name: 'Raporlar', href: '/dashboard/reports' },
    { name: 'Profil', href: '/dashboard/profile' },
  ]

  // Add admin routes if user is admin or manager
  if (profile.role === 'admin' || profile.role === 'manager') {
    navigation.push({ name: 'Admin', href: '/dashboard/admin' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DeviceTracking />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">EV-SLA</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{profile.full_name}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
