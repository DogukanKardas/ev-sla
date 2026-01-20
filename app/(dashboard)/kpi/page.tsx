'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface KPIMetric {
  id: string
  month: number
  year: number
  work_hours_total: number
  work_hours_target: number
  avg_response_time_seconds: number
  response_time_target_seconds: number
  task_completion_rate: number
  task_completion_target: number
  productivity_score: number
  productivity_target: number
}

export default function KPIPage() {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadKPIMetrics()
  }, [selectedMonth, selectedYear])

  const loadKPIMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/kpi/metrics?month=${selectedMonth}&year=${selectedYear}`
      )
      if (response.ok) {
        const data = await response.json()
        setKpiMetrics(data)
      }
    } catch (error) {
      console.error('KPI metrikleri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateKPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/kpi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      })

      if (response.ok) {
        await loadKPIMetrics()
        alert('KPI hesaplandı')
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('KPI hesaplanırken hata:', error)
      alert('KPI hesaplanırken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatResponseTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} saniye`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika`
    return `${Math.floor(seconds / 3600)} saat ${Math.floor((seconds % 3600) / 60)} dakika`
  }

  const getPerformanceColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const currentMetric = kpiMetrics[0]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">KPI Metrikleri</h1>
          <div className="flex gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {format(new Date(2024, month - 1, 1), 'MMMM', { locale: tr })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={calculateKPI}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Hesaplanıyor...' : 'KPI Hesapla'}
            </button>
          </div>
        </div>

        {loading && !currentMetric ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : !currentMetric ? (
          <div className="text-center py-8 text-gray-500">
            Bu ay için KPI metrikleri henüz hesaplanmadı
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Work Hours */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Çalışma Saatleri</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam:</span>
                  <span className={`font-semibold ${getPerformanceColor(currentMetric.work_hours_total, currentMetric.work_hours_target)}`}>
                    {currentMetric.work_hours_total.toFixed(2)} saat
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hedef:</span>
                  <span className="text-gray-900">{currentMetric.work_hours_target} saat</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((currentMetric.work_hours_total / currentMetric.work_hours_target) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ortalama Yanıt Süresi</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama:</span>
                  <span className={`font-semibold ${getPerformanceColor(currentMetric.response_time_target_seconds, currentMetric.avg_response_time_seconds)}`}>
                    {formatResponseTime(currentMetric.avg_response_time_seconds)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hedef:</span>
                  <span className="text-gray-900">{formatResponseTime(currentMetric.response_time_target_seconds)}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((currentMetric.response_time_target_seconds / Math.max(currentMetric.avg_response_time_seconds, 1)) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Completion */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Görev Tamamlama Oranı</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Oran:</span>
                  <span className={`font-semibold ${getPerformanceColor(currentMetric.task_completion_rate, currentMetric.task_completion_target)}`}>
                    {currentMetric.task_completion_rate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hedef:</span>
                  <span className="text-gray-900">{currentMetric.task_completion_target}%</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((currentMetric.task_completion_rate / currentMetric.task_completion_target) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Productivity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verimlilik Skoru</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Skor:</span>
                  <span className={`font-semibold ${getPerformanceColor(currentMetric.productivity_score, currentMetric.productivity_target)}`}>
                    {currentMetric.productivity_score.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hedef:</span>
                  <span className="text-gray-900">{currentMetric.productivity_target}%</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((currentMetric.productivity_score / currentMetric.productivity_target) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

