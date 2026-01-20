import { requireRole } from '@/lib/auth'
import AdminPanel from '@/components/admin/AdminPanel'

export default async function AdminPage() {
  await requireRole(['admin', 'manager'])
  return <AdminPanel />
}

