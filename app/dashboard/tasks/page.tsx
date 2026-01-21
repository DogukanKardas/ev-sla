'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date: string | null
  location_id: string | null
  location_address: string | null
  location_notes: string | null
  locations?: {
    id: string
    name: string
    address: string | null
    latitude: number
    longitude: number
  }
  user_profiles?: {
    full_name: string
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterStatus !== 'all' 
        ? `/api/tasks?status=${filterStatus}`
        : '/api/tasks'
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
  }, [filterStatus])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Real-time subscription for task updates
  useRealtimeSubscription('tasks', loadTasks)

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId, status }),
      })

      if (response.ok) {
        await loadTasks()
        alert('Görev durumu güncellendi')
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('Görev güncellenirken hata:', error)
      alert('Görev güncellenirken bir hata oluştu')
    }
  }

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Görevlerim</h1>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tümü</option>
            <option value="pending">Bekliyor</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && tasks.length === 0 ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Henüz görev yok</div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    {getStatusBadge(task.status)}
                  </div>

                  {task.locations && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            📍 {task.locations.name}
                          </p>
                          {task.locations.address && (
                            <p className="text-xs text-gray-600">{task.locations.address}</p>
                          )}
                          {task.location_notes && (
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Not:</strong> {task.location_notes}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => openInMaps(
                            parseFloat(task.locations!.latitude as any),
                            parseFloat(task.locations!.longitude as any)
                          )}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Yol Tarifi Al
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-gray-600">
                      {task.due_date && (
                        <span>Termin: {format(new Date(task.due_date), 'dd MMMM yyyy', { locale: tr })}</span>
                      )}
                      {task.user_profiles && (
                        <span className="ml-4">Atayan: {task.user_profiles.full_name}</span>
                      )}
                    </div>
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Başla
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Tamamla
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

