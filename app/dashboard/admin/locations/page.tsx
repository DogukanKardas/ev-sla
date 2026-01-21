'use client'

import { useState, useEffect } from 'react'

interface Location {
  id: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  radius_meters: number
  is_active: boolean
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius_meters: 100,
  })

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Lokasyonlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servislerini desteklemiyor')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        alert('Mevcut konumunuz alındı')
      },
      (error) => {
        alert('Konum alınamadı: ' + error.message)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadLocations()
        setShowForm(false)
        setFormData({ name: '', address: '', latitude: 0, longitude: 0, radius_meters: 100 })
        alert('Lokasyon eklendi')
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('Lokasyon eklenirken hata:', error)
      alert('Lokasyon eklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lokasyon Yönetimi</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? 'İptal' : 'Yeni Lokasyon'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Lokasyon Ekle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lokasyon Adı</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Ana Ofis, Şube 1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adres</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Opsiyonel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enlem (Latitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Boylam (Longitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Yarıçap (metre)</label>
                <input
                  type="number"
                  required
                  value={formData.radius_meters}
                  onChange={(e) => setFormData({ ...formData, radius_meters: parseInt(e.target.value) })}
                  placeholder="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Mevcut Konumu Al
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lokasyonlar</h2>
          {loading && locations.length === 0 ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : locations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz lokasyon tanımlanmamış. Lokasyon eklemek opsiyoneldir.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yarıçap</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((location) => (
                    <tr key={location.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{location.address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.radius_meters}m</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.is_active ? (
                          <span className="text-green-600">Aktif</span>
                        ) : (
                          <span className="text-red-600">Pasif</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

