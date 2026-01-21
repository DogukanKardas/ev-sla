'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminPanel from '@/components/admin/AdminPanel'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
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

        if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
          router.push('/dashboard')
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Erişim kontrolü hatası:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <AdminPanel />
}

