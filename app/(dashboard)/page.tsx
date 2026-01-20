import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard'
import ManagerDashboard from '@/components/dashboard/ManagerDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default async function DashboardPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  if (profile.role === 'admin') {
    return <AdminDashboard />
  }

  if (profile.role === 'manager') {
    return <ManagerDashboard />
  }

  return <EmployeeDashboard />
}

