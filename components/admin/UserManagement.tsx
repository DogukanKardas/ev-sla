'use client'

import { useState, useEffect } from 'react'

interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: 'admin' | 'manager' | 'employee'
  qr_code: string
  created_at: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user-profiles/all')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingUser) {
        // Update user
        const response = await fetch(`/api/admin/users/${editingUser.user_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            role: formData.role,
          }),
        })

        if (response.ok) {
          await loadUsers()
          resetForm()
          alert('Kullanıcı güncellendi')
        } else {
          const data = await response.json()
          alert('Hata: ' + data.error)
        }
      } else {
        // Create new user
        const response = await fetch('/api/admin/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            role: formData.role,
          }),
        })

        if (response.ok) {
          await loadUsers()
          resetForm()
          alert('Kullanıcı oluşturuldu')
        } else {
          const data = await response.json()
          alert('Hata: ' + data.error)
        }
      }
    } catch (error) {
      console.error('Kullanıcı kaydedilirken hata:', error)
      alert('Kullanıcı kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'employee',
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
      email: '',
      password: '',
      full_name: user.full_name,
      role: user.role,
    })
    setShowForm(true)
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadUsers()
        alert('Kullanıcı silindi')
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error)
      alert('Kullanıcı silinirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici'
      case 'manager': return 'Müdür'
      case 'employee': return 'Çalışan'
      default: return role
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Kullanıcılar</h2>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Yeni Kullanıcı
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-posta</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şifre</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 karakter"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="employee">Çalışan</option>
                <option value="manager">Müdür</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : editingUser ? 'Güncelle' : 'Oluştur'}
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

      {loading && users.length === 0 ? (
        <div className="text-center py-8">Yükleniyor...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleName(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(user.user_id, user.full_name)}
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
  )
}

