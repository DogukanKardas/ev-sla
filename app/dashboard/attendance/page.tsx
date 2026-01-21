'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { getCurrentPosition, isWithinRadius } from '@/lib/geolocation'

export default function AttendancePage() {
  const [scanning, setScanning] = useState(false)
  const [lastAttendance, setLastAttendance] = useState<any>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<any[]>([])
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    loadAttendanceHistory()
    loadLocations()
  }, [])

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

  const loadAttendanceHistory = async () => {
    try {
      const response = await fetch('/api/attendance')
      if (response.ok) {
        const data = await response.json()
        setAttendanceHistory(data)
        if (data.length > 0) {
          setLastAttendance(data[0])
        }
      }
    } catch (error) {
      console.error('Giriş/çıkış geçmişi yüklenirken hata:', error)
    }
  }

  const startScanning = () => {
    if (scannerRef.current) {
      return
    }

    setScanning(true)
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        qrbox: { width: 250, height: 250 },
        fps: 5,
        aspectRatio: 1.0,
        // Mobile optimization
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      false
    )

    scanner.render(
      async (decodedText) => {
        setScanning(false)
        scanner.clear()
        scannerRef.current = null

        setLoading(true)
        try {
          // Get user location
          let userLocation = null
          let validLocation = false
          let locationId = null
          let distance = null

          try {
            userLocation = await getCurrentPosition()
            
            // Check if user is within any valid location
            const { calculateDistance } = await import('@/lib/geolocation')
            
            for (const loc of locations) {
              const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                parseFloat(loc.latitude),
                parseFloat(loc.longitude)
              )

              if (dist <= loc.radius_meters) {
                validLocation = true
                locationId = loc.id
                distance = Math.round(dist)
                break
              }
            }

            if (locations.length > 0 && !validLocation) {
              alert('Tanımlı bir lokasyonun yakınında değilsiniz. Lütfen ofise yakın olduğunuzdan emin olun.')
              setLoading(false)
              return
            }
          } catch (locationError: any) {
            console.warn('Konum alınamadı:', locationError)
            if (locations.length > 0) {
              alert('Konum izni gerekli. Lütfen konum erişimine izin verin.')
              setLoading(false)
              return
            }
          }

          const response = await fetch('/api/attendance/qr-scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              qr_code: decodedText,
              location_id: locationId,
              latitude: userLocation?.latitude,
              longitude: userLocation?.longitude,
              distance_meters: distance,
            }),
          })

          const data = await response.json()

          if (response.ok) {
            setLastAttendance(data.attendance)
            await loadAttendanceHistory()
            alert(
              data.type === 'check-in'
                ? 'Giriş yapıldı!'
                : `Çıkış yapıldı! Süre: ${data.duration_minutes} dakika`
            )
          } else {
            alert('Hata: ' + data.error)
          }
        } catch (error) {
          console.error('QR kod işleme hatası:', error)
          alert('QR kod işlenirken bir hata oluştu')
        } finally {
          setLoading(false)
        }
      },
      (errorMessage) => {
        // Ignore scanning errors
      }
    )

    scannerRef.current = scanner
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setScanning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Giriş/Çıkış</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Kod Okut</h2>
          
          {!scanning ? (
            <button
              onClick={startScanning}
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'İşleniyor...' : 'QR Kod Okut'}
            </button>
          ) : (
            <div>
              <div id="qr-reader" className="mb-4"></div>
              <button
                onClick={stopScanning}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                İptal
              </button>
            </div>
          )}

          {lastAttendance && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-900 mb-2">Son İşlem</h3>
              <p className="text-sm text-gray-600">
                Giriş: {format(new Date(lastAttendance.check_in), 'dd MMMM yyyy HH:mm', { locale: tr })}
              </p>
              {lastAttendance.check_out && (
                <p className="text-sm text-gray-600">
                  Çıkış: {format(new Date(lastAttendance.check_out), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Giriş/Çıkış Geçmişi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Çıkış
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Süre
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.map((attendance) => {
                  const checkIn = new Date(attendance.check_in)
                  const checkOut = attendance.check_out ? new Date(attendance.check_out) : null
                  const duration = checkOut
                    ? Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000)
                    : null

                  return (
                    <tr key={attendance.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(checkIn, 'dd MMMM yyyy', { locale: tr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(checkIn, 'HH:mm', { locale: tr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {checkOut ? format(checkOut, 'HH:mm', { locale: tr }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {duration !== null ? `${duration} dk` : 'Devam ediyor'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

