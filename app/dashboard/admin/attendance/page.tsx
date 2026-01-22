'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AttendanceRecord {
  id: string
  user_id: string
  check_in: string
  check_out: string | null
  qr_code_used: string
  location_id: string | null
  latitude: number | null
  longitude: number | null
  distance_meters: number | null
  created_at: string
  user_profile: {
    user_id: string
    full_name: string
    role: string
  } | null
  location: {
    id: string
    name: string
    address: string | null
  } | null
  duration_minutes: number | null
}

interface UserProfile {
  user_id: string
  full_name: string
  role: string
}

export default function AdminAttendancePage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  
  // Initialize default date range (last 30 days)
  const getDefaultDates = () => {
    try {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      }
    } catch (err) {
      console.error('Date initialization error:', err)
      return { start: '', end: '' }
    }
  }
  
  const defaultDates = getDefaultDates()
  const [startDate, setStartDate] = useState<string>(defaultDates.start)
  const [endDate, setEndDate] = useState<string>(defaultDates.end)
  const [loadingData, setLoadingData] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/user-profiles/all')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setUsers(data.filter((u: UserProfile) => u.role === 'employee'))
        } else {
          setUsers([])
        }
      } else {
        const errorText = await response.text()
        console.error('Kullanıcılar yüklenirken hata:', errorText)
        setError('Kullanıcılar yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
      setError('Kullanıcılar yüklenirken bir hata oluştu')
    }
  }, [])

  const loadAttendance = useCallback(async () => {
    setLoadingData(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedUserId !== 'all') {
        params.append('user_id', selectedUserId)
      }
      if (startDate) {
        params.append('start_date', startDate)
      }
      if (endDate) {
        params.append('end_date', endDate)
      }

      const response = await fetch(`/api/admin/attendance?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setAttendance(data)
        } else {
          setAttendance([])
          setError('Geçersiz veri formatı')
        }
      } else {
        const errorText = await response.text()
        console.error('Giriş-çıkış kayıtları yüklenirken hata:', errorText)
        setError('Giriş-çıkış kayıtları yüklenirken bir hata oluştu')
        setAttendance([])
      }
    } catch (error) {
      console.error('Giriş-çıkış kayıtları yüklenirken hata:', error)
      setError('Giriş-çıkış kayıtları yüklenirken bir hata oluştu')
      setAttendance([])
    } finally {
      setLoadingData(false)
    }
  }, [selectedUserId, startDate, endDate])

  useEffect(() => {
    async function checkAccess() {
      try {
        const supabase = createClient()
        if (!supabase) {
          throw new Error('Supabase client oluşturulamadı')
        }
        
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
          router.push('/dashboard')
          return
        }

        setAuthorized(true)
        await loadUsers()
      } catch (error) {
        console.error('Erişim kontrolü hatası:', error)
        setError('Erişim kontrolü sırasında bir hata oluştu')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router, loadUsers])

  useEffect(() => {
    if (authorized) {
      loadAttendance()
    }
  }, [authorized, loadAttendance])

  function formatDateTime(dateString: string | null): string {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDuration(minutes: number | null): string {
    if (minutes === null) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}s ${mins}dk`
  }

  function handleResetFilters() {
    setSelectedUserId('all')
    setStartDate('')
    setEndDate('')
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Giriş-Çıkış Takibi</h1>
          <div className="flex gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Filtreleri Temizle
            </button>
            <button
              onClick={loadAttendance}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Yenile
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtreler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışan
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tüm Çalışanlar</option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Hata:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loadingData ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                {error}
              </div>
            ) : attendance.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Giriş-çıkış kaydı bulunamadı.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çalışan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giriş Saati
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çıkış Saati
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Süre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasyon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mesafe
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.check_in).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.user_profile?.full_name || 'Bilinmiyor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(record.check_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(record.check_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.check_out ? (
                          <span className="text-green-600 font-medium">
                            {formatDuration(record.duration_minutes)}
                          </span>
                        ) : (
                          <span className="text-orange-600 font-medium">Devam Ediyor</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.location ? (
                          <div>
                            <div className="font-medium">{record.location.name}</div>
                            {record.location.address && (
                              <div className="text-xs text-gray-400">{record.location.address}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.distance_meters !== null ? (
                          <span>{record.distance_meters}m</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {attendance.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Toplam <span className="font-medium">{attendance.length}</span> kayıt gösteriliyor
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

