'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalManagers: 0,
    totalEmployees: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemData()
  }, [])

  const loadSystemData = async () => {
    try {
      const profilesRes = await fetch('/api/user-profiles/all')
      const profiles = profilesRes.ok ? await profilesRes.json() : []

      setSystemStats({
        totalUsers: profiles.length,
        totalAdmins: profiles.filter((p: any) => p.role === 'admin').length,
        totalManagers: profiles.filter((p: any) => p.role === 'manager').length,
        totalEmployees: profiles.filter((p: any) => p.role === 'employee').length,
      })
    } catch (error) {
      console.error('Sistem verileri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Toplam Kullanıcı</h3>
            <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Admin</h3>
            <p className="text-2xl font-bold text-gray-900">{systemStats.totalAdmins}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Yönetici</h3>
            <p className="text-2xl font-bold text-gray-900">{systemStats.totalManagers}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Çalışan</h3>
            <p className="text-2xl font-bold text-gray-900">{systemStats.totalEmployees}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sistem Yönetimi</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/admin"
                className="block w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
              >
                Kullanıcı Yönetimi
              </Link>
              <Link
                href="/dashboard/kpi"
                className="block w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center"
              >
                KPI Yönetimi
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bilgilendirme</h2>
            <p className="text-gray-600">
              Bu dashboard&apos;dan tüm sistemi yönetebilir, kullanıcıları ekleyip çıkarabilir ve KPI değerlendirmeleri yapabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

