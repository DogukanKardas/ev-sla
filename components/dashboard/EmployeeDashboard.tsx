'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import Link from 'next/link'

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    todayWorkHours: 0,
    todayAttendance: null as any,
    recentWorkLogs: [] as any[],
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      // Get today's attendance
      const attendanceRes = await fetch(`/api/attendance?start_date=${today}`)
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : []
      const todayAttendance = attendanceData.find((a: any) => a.check_in.startsWith(today))

      // Get today's work logs
      const workLogsRes = await fetch(`/api/work-logs?date=${today}`)
      const workLogsData = workLogsRes.ok ? await workLogsRes.json() : []

      // Calculate work hours from attendance
      let todayWorkHours = 0
      if (todayAttendance && todayAttendance.check_out) {
        const checkIn = new Date(todayAttendance.check_in)
        const checkOut = new Date(todayAttendance.check_out)
        todayWorkHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
      }

      // Get unread messages (messages without responses)
      const messagesRes = await fetch('/api/messages')
      const messagesData = messagesRes.ok ? await messagesRes.json() : []
      const unreadMessages = messagesData.filter((m: any) => !m.message_responses || m.message_responses.length === 0).length

      setStats({
        todayWorkHours: Math.round(todayWorkHours * 100) / 100,
        todayAttendance,
        recentWorkLogs: workLogsData.slice(0, 5),
        unreadMessages,
      })
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bugünkü Çalışma Saati</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.todayWorkHours.toFixed(2)} saat</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Giriş Durumu</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.todayAttendance ? (
                stats.todayAttendance.check_out ? (
                  <span className="text-green-600">Çıkış Yapıldı</span>
                ) : (
                  <span className="text-yellow-600">Çalışıyor</span>
                )
              ) : (
                <span className="text-red-600">Giriş Yapılmadı</span>
              )}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Okunmamış Mesaj</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bugünkü İş Kayıtları</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.recentWorkLogs.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Son İş Kayıtları</h2>
              <Link
                href="/dashboard/work-logs"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Tümünü Gör
              </Link>
            </div>
            {stats.recentWorkLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz iş kaydı yok</p>
            ) : (
              <div className="space-y-3">
                {stats.recentWorkLogs.map((log) => (
                  <div key={log.id} className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-900">{log.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.start_time} - {log.end_time || 'Devam ediyor'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Hızlı İşlemler</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/dashboard/attendance"
                className="block w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
              >
                Giriş/Çıkış Yap
              </Link>
              <Link
                href="/dashboard/work-logs"
                className="block w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center"
              >
                İş Kaydı Ekle
              </Link>
              <Link
                href="/dashboard/messages"
                className="block w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center"
              >
                Mesajları Görüntüle
              </Link>
              <Link
                href="/dashboard/kpi"
                className="block w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center"
              >
                KPI Metrikleri
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

