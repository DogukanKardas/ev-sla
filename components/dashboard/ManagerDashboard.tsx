'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ManagerDashboard() {
  const [teamStats, setTeamStats] = useState({
    totalEmployees: 0,
    activeToday: 0,
    avgResponseTime: 0,
    avgProductivity: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      // Get all employees
      const profilesRes = await fetch('/api/user-profiles/all')
      const profiles = profilesRes.ok ? await profilesRes.json() : []
      const employees = profiles.filter((p: any) => p.role === 'employee')

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0]
      // This would require aggregating attendance data for all employees
      // For now, we'll use placeholder data

      setTeamStats({
        totalEmployees: employees.length,
        activeToday: 0, // Would need to calculate from attendance
        avgResponseTime: 0, // Would need to calculate from message responses
        avgProductivity: 0, // Would need to calculate from KPI metrics
      })
    } catch (error) {
      console.error('Takım verileri yüklenirken hata:', error)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Yönetici Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Toplam Çalışan</h3>
            <p className="text-2xl font-bold text-gray-900">{teamStats.totalEmployees}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bugün Aktif</h3>
            <p className="text-2xl font-bold text-gray-900">{teamStats.activeToday}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Ort. Yanıt Süresi</h3>
            <p className="text-2xl font-bold text-gray-900">
              {teamStats.avgResponseTime > 0 ? `${Math.floor(teamStats.avgResponseTime / 60)} dk` : '-'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Ort. Verimlilik</h3>
            <p className="text-2xl font-bold text-gray-900">
              {teamStats.avgProductivity > 0 ? `${teamStats.avgProductivity.toFixed(1)}%` : '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/admin"
                className="block w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
              >
                Takım Yönetimi
              </Link>
              <Link
                href="/dashboard/kpi"
                className="block w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center"
              >
                KPI Raporları
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bilgilendirme</h2>
            <p className="text-gray-600">
              Bu dashboard'dan takımınızın performansını görüntüleyebilir ve yönetebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

