'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface WorkLog {
  id: string
  date: string
  description: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  project_tag: string | null
}

export default function WorkLogsPage() {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    start_time: '09:00',
    end_time: '',
    project_tag: '',
  })

  useEffect(() => {
    loadWorkLogs()
  }, [])

  const loadWorkLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/work-logs')
      if (response.ok) {
        const data = await response.json()
        setWorkLogs(data)
      }
    } catch (error) {
      console.error('İş kayıtları yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingLog ? '/api/work-logs' : '/api/work-logs'
      const method = editingLog ? 'PUT' : 'POST'
      const body = editingLog
        ? { ...formData, id: editingLog.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await loadWorkLogs()
        resetForm()
        alert(editingLog ? 'İş kaydı güncellendi' : 'İş kaydı eklendi')
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('İş kaydı kaydedilirken hata:', error)
      alert('İş kaydı kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      start_time: '09:00',
      end_time: '',
      project_tag: '',
    })
    setEditingLog(null)
    setShowForm(false)
  }

  const handleEdit = (log: WorkLog) => {
    setEditingLog(log)
    setFormData({
      date: log.date,
      description: log.description,
      start_time: log.start_time,
      end_time: log.end_time || '',
      project_tag: log.project_tag || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu iş kaydını silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/work-logs?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadWorkLogs()
        alert('İş kaydı silindi')
      } else {
        alert('İş kaydı silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('İş kaydı silinirken hata:', error)
      alert('İş kaydı silinirken bir hata oluştu')
    }
  }

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">İş Kayıtları</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Yeni Kayıt
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingLog ? 'İş Kaydını Düzenle' : 'Yeni İş Kaydı'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proje Etiketi</label>
                  <input
                    type="text"
                    value={formData.project_tag}
                    onChange={(e) => setFormData({ ...formData, project_tag: e.target.value })}
                    placeholder="Opsiyonel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlangıç Saati</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bitiş Saati</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Yaptığınız işleri detaylı olarak açıklayın..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : editingLog ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kayıtlar</h2>
          {loading && workLogs.length === 0 ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : workLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Henüz iş kaydı yok</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saatler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Süre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proje</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(log.date), 'dd MMMM yyyy', { locale: tr })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.start_time} - {log.end_time || 'Devam ediyor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(log.duration_minutes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.project_tag || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
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

