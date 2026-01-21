'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: string
}

interface Location {
  id: string
  name: string
  address: string | null
  latitude: number
  longitude: number
}

interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  duration_minutes: number | null
  user_profiles: {
    id: string
    user_id: string
    full_name: string
  }
  locations: Location | null
  assigned_by_profile: {
    full_name: string
  } | null
}

export default function AdminTasksPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterUser, setFilterUser] = useState('')
  const [formData, setFormData] = useState({
    user_id: '',
    title: '',
    description: '',
    location_id: '',
    location_address: '',
    location_notes: '',
    due_date: '',
  })

  useEffect(() => {
    loadUsers()
    loadLocations()
    loadTasks()
  }, [])

  useEffect(() => {
    loadTasks()
  }, [filterStatus, filterUser])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/user-profiles/all')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter((u: UserProfile) => u.role === 'employee'))
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
    }
  }

  const loadLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Lokasyonlar yüklenirken hata:', error)
    }
  }

  const loadTasks = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/tasks?'
      if (filterStatus !== 'all') url += `status=${filterStatus}&`
      if (filterUser) url += `user_id=${filterUser}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setActiveTab('list')
        setFormData({
          user_id: '',
          title: '',
          description: '',
          location_id: '',
          location_address: '',
          location_notes: '',
          due_date: '',
        })
        await loadTasks()
        alert('Görev oluşturuldu')
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('Görev oluşturulurken hata:', error)
      alert('Görev oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    const labels = {
      pending: 'Bekliyor',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    }
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Görev/Talep Yönetimi</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Toplam Görev</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-800">Bekliyor</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-800">Devam Ediyor</p>
            <p className="text-2xl font-bold text-blue-900">{stats.in_progress}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-800">Tamamlandı</p>
            <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'list'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Görev Listesi
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'create'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Yeni Görev Ata
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'create' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Görev/Talep Oluştur</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Çalışan Seç</label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Seçiniz</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.user_id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Görev Başlığı</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Müşteri Ziyareti, Teknik Destek"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Görev detayları..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lokasyon (Opsiyonel)</label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Lokasyon seçilmedi</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.address ? `- ${loc.address}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {formData.location_id && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adres/Detay</label>
                    <input
                      type="text"
                      value={formData.location_address}
                      onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                      placeholder="Ek adres bilgisi (Apt no, kat, daire)"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lokasyon Notları</label>
                    <textarea
                      rows={2}
                      value={formData.location_notes}
                      onChange={(e) => setFormData({ ...formData, location_notes: e.target.value })}
                      placeholder="Örn: Kapıcıya haber verin, 3. kattaki ofis"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Termin Tarihi</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
              </button>
            </form>
          </div>
            )}

            {activeTab === 'list' && (
              <div>
                <div className="flex gap-4 mb-6">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="pending">Bekliyor</option>
                    <option value="in_progress">Devam Ediyor</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Tüm Çalışanlar</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.user_id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {loading && tasks.length === 0 ? (
                  <div className="text-center py-8">Yükleniyor...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Görev bulunamadı</div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                              {getStatusBadge(task.status)}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600">{task.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div>
                            <strong>Çalışan:</strong> {task.user_profiles?.full_name || '-'}
                          </div>
                          {task.due_date && (
                            <div>
                              <strong>Termin:</strong> {format(new Date(task.due_date), 'dd MMM yyyy', { locale: tr })}
                            </div>
                          )}
                          {task.started_at && (
                            <div className="text-blue-600">
                              <strong>⏱️ Başlama:</strong> {format(new Date(task.started_at), 'dd MMM HH:mm', { locale: tr })}
                            </div>
                          )}
                          {task.assigned_by_profile && (
                            <div>
                              <strong>Atayan:</strong> {task.assigned_by_profile.full_name}
                            </div>
                          )}
                        </div>

                        {task.duration_minutes && (
                          <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-800 mb-2">
                            ⏱️ <strong>Tamamlama Süresi:</strong> {Math.floor(task.duration_minutes / 60)} saat {task.duration_minutes % 60} dakika
                          </div>
                        )}

                        {task.locations && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                            <strong>📍 Lokasyon:</strong> {task.locations.name}
                            {task.locations.address && ` - ${task.locations.address}`}
                          </div>
                        )}

                        {task.status === 'completed' && task.completed_at && (
                          <div className="mt-2 text-xs text-green-700">
                            ✓ Tamamlanma: {format(new Date(task.completed_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700">
          <p><strong>💡 İpucu:</strong> Görevler çalışanların &quot;Görevlerim&quot; sayfasında görünür. Lokasyon eklerseniz, çalışanlar Google Maps&apos;te yol tarifi alabilir.</p>
        </div>
      </div>
    </div>
  )
}

