'use client'

import { useState, useEffect } from 'react'

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

export default function AdminTasksPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
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
  }, [])

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
        setFormData({
          user_id: '',
          title: '',
          description: '',
          location_id: '',
          location_address: '',
          location_notes: '',
          due_date: '',
        })
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Görev/Talep Yönetimi</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? 'İptal' : 'Yeni Görev Ata'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Görev/Talep</h2>
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

        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700">
          <p><strong>💡 İpucu:</strong> Görevler çalışanların &quot;Görevlerim&quot; sayfasında görünür. Lokasyon eklerseniz, çalışanlar Google Maps&apos;te yol tarifi alabilir.</p>
        </div>
      </div>
    </div>
  )
}

