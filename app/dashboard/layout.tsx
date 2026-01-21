'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import DeviceTracking from '@/components/device/DeviceTracking'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        } else {
          router.push('/profile-setup')
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Görevlerim', href: '/dashboard/tasks' },
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
              <div className="ml-6 flex space-x-4 sm:space-x-8 overflow-x-auto">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="hidden sm:inline text-sm text-gray-700 mr-2 sm:mr-4">{profile.full_name}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
