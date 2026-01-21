'use client'

import { useState, useEffect } from 'react'
import { generateKPIReportPDF } from '@/lib/reports/pdf-generator'
import type { KPIReportData } from '@/lib/reports/pdf-generator'

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/reports/kpi?month=${selectedMonth}&year=${selectedYear}`
      )

      if (!response.ok) {
        const data = await response.json()
        alert('Hata: ' + data.error)
        return
      }

      const data: KPIReportData = await response.json()

      if (!data.kpi_metric) {
        alert('Bu ay için KPI metrikleri henüz hesaplanmadı. Lütfen önce KPI sayfasından hesaplayın.')
        return
      }

      const pdf = generateKPIReportPDF(data)
      pdf.save(`KPI-Raporu-${data.user.full_name}-${selectedMonth}-${selectedYear}.pdf`)
    } catch (error) {
      console.error('Rapor oluşturulurken hata:', error)
      alert('Rapor oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">KPI Raporları</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rapor Oluştur</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ay</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2024, month - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yıl</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Rapor Oluşturuluyor...' : 'PDF Raporu İndir'}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Rapor, seçilen ay için KPI metriklerinizi, değerlendirmeleri ve özet bilgileri içerir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

