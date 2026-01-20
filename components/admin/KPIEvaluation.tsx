'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: string
}

interface KPIMetric {
  id: string
  user_id: string
  month: number
  year: number
  work_hours_total: number
  avg_response_time_seconds: number
  task_completion_rate: number
  productivity_score: number
}

export default function KPIEvaluation() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [kpiMetric, setKpiMetric] = useState<KPIMetric | null>(null)
  const [loading, setLoading] = useState(false)
  const [evaluation, setEvaluation] = useState({
    overall_score: 0,
    comments: '',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/user-profiles/all')
      if (response.ok) {
        const data = await response.json()
        const employees = data.filter((u: UserProfile) => u.role === 'employee')
        setUsers(employees)
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
    }
  }

  const loadKPIMetric = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/kpi/metrics?user_id=${selectedUser}&month=${selectedMonth}&year=${selectedYear}`
      )
      if (response.ok) {
        const data = await response.json()
        setKpiMetric(data[0] || null)
      }
    } catch (error) {
      console.error('KPI metrik yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedUser, selectedMonth, selectedYear])

  useEffect(() => {
    if (selectedUser) {
      loadKPIMetric()
    }
  }, [selectedUser, loadKPIMetric])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/user-profiles/all')
      if (response.ok) {
        const data = await response.json()
        const employees = data.filter((u: UserProfile) => u.role === 'employee')
        setUsers(employees)
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
    }
  }

  const calculateKPI = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const response = await fetch('/api/kpi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser,
          month: selectedMonth,
          year: selectedYear,
        }),
      })

      if (response.ok) {
        await loadKPIMetric()
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

  const submitEvaluation = async () => {
    if (!selectedUser || !kpiMetric) return

    setLoading(true)
    try {
      const response = await fetch('/api/kpi/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser,
          kpi_metric_id: kpiMetric.id,
          month: selectedMonth,
          year: selectedYear,
          overall_score: evaluation.overall_score,
          comments: evaluation.comments,
        }),
      })

      if (response.ok) {
        alert('KPI değerlendirmesi kaydedildi')
        setEvaluation({ overall_score: 0, comments: '' })
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('Değerlendirme kaydedilirken hata:', error)
      alert('Değerlendirme kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">KPI Değerlendirme</h2>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Çalışan</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Ay</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {format(new Date(2024, month - 1, 1), 'MMMM', { locale: tr })}
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
          onClick={calculateKPI}
          disabled={!selectedUser || loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          KPI Hesapla
        </button>
      </div>

      {kpiMetric && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI Metrikleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Çalışma Saatleri</p>
              <p className="text-lg font-semibold">{kpiMetric.work_hours_total.toFixed(2)} saat</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ort. Yanıt Süresi</p>
              <p className="text-lg font-semibold">
                {Math.floor(kpiMetric.avg_response_time_seconds / 60)} dk
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Görev Tamamlama</p>
              <p className="text-lg font-semibold">{kpiMetric.task_completion_rate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Verimlilik</p>
              <p className="text-lg font-semibold">{kpiMetric.productivity_score.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {kpiMetric && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Değerlendirme</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genel Skor (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={evaluation.overall_score}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, overall_score: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yorumlar</label>
              <textarea
                rows={4}
                value={evaluation.comments}
                onChange={(e) => setEvaluation({ ...evaluation, comments: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Değerlendirme yorumlarınızı buraya yazın..."
              />
            </div>
            <button
              onClick={submitEvaluation}
              disabled={loading || evaluation.overall_score === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Değerlendirmeyi Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

