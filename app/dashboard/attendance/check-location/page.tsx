'use client'

import { useState, useEffect } from 'react'
import { getCurrentPosition, calculateDistance } from '@/lib/geolocation'

export default function CheckLocationPage() {
  const [locations, setLocations] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [nearestLocation, setNearestLocation] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load locations
      const locResponse = await fetch('/api/locations')
      if (locResponse.ok) {
        const locData = await locResponse.json()
        setLocations(locData)

        // Get user location
        try {
          const position = await getCurrentPosition()
          setUserLocation(position)

          // Find nearest location
          if (locData.length > 0) {
            let nearest = null
            let minDistance = Infinity

            for (const loc of locData) {
              const dist = calculateDistance(
                position.latitude,
                position.longitude,
                parseFloat(loc.latitude),
                parseFloat(loc.longitude)
              )

              if (dist < minDistance) {
                minDistance = dist
                nearest = { ...loc, distance: Math.round(dist) }
              }
            }

            setNearestLocation(nearest)
          }
        } catch (error: any) {
          console.error('Konum alınamadı:', error)
        }
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Konum Doğrulama</h1>

        {!userLocation ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Konum İzni Gerekli</h3>
            <p className="text-yellow-800 mb-4">
              Giriş/çıkış yapabilmek için konum erişimine izin vermeniz gerekiyor.
            </p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Konum İznini Tekrar İste
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mevcut Konumunuz</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Enlem: <span className="font-mono text-gray-900">{userLocation.latitude.toFixed(6)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Boylam: <span className="font-mono text-gray-900">{userLocation.longitude.toFixed(6)}</span>
                </p>
              </div>
              <a
                href={`https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Google Maps&apos;te Görüntüle
              </a>
            </div>

            {nearestLocation && (
              <div className={`rounded-lg shadow-md p-6 ${
                nearestLocation.distance <= nearestLocation.radius_meters
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h2 className="text-xl font-semibold mb-4">
                  {nearestLocation.distance <= nearestLocation.radius_meters ? (
                    <span className="text-green-900">✓ Geçerli Lokasyondasınız</span>
                  ) : (
                    <span className="text-red-900">✗ Geçerli Lokasyon Dışındasınız</span>
                  )}
                </h2>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">En Yakın Lokasyon:</span> {nearestLocation.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Mesafe:</span> {nearestLocation.distance} metre
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">İzin Verilen Yarıçap:</span> {nearestLocation.radius_meters} metre
                  </p>
                  {nearestLocation.distance > nearestLocation.radius_meters && (
                    <p className="text-sm text-red-700 font-medium mt-4">
                      Giriş/çıkış yapmak için {nearestLocation.name} lokasyonuna {nearestLocation.distance - nearestLocation.radius_meters} metre daha yaklaşmanız gerekiyor.
                    </p>
                  )}
                </div>
              </div>
            )}

            {locations.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Lokasyon Tanımlanmamış</h3>
                <p className="text-blue-800">
                  Henüz lokasyon tanımlanmadığı için konum kontrolü yapılmayacak. Giriş/çıkış herhangi bir yerden yapılabilir.
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tüm Lokasyonlar</h2>
              <div className="space-y-3">
                {locations.map((loc) => {
                  const dist = userLocation
                    ? Math.round(
                        calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          parseFloat(loc.latitude),
                          parseFloat(loc.longitude)
                        )
                      )
                    : null

                  return (
                    <div
                      key={loc.id}
                      className={`p-4 rounded-lg border ${
                        dist && dist <= loc.radius_meters
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                          {loc.address && (
                            <p className="text-sm text-gray-600">{loc.address}</p>
                          )}
                        </div>
                        {dist !== null && (
                          <span className={`text-sm font-medium ${
                            dist <= loc.radius_meters ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {dist}m uzakta
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

