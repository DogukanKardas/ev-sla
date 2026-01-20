'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard'
import ManagerDashboard from '@/components/dashboard/ManagerDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
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

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (profile) {
          setRole(profile.role)
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

  if (role === 'admin') {
    return <AdminDashboard />
  }

  if (role === 'manager') {
    return <ManagerDashboard />
  }

  return <EmployeeDashboard />
}

