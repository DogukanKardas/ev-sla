'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserManagement from './UserManagement'
import KPIEvaluation from './KPIEvaluation'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'kpi'>('users')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
          <div className="flex gap-2">
            <Link
              href="/dashboard/admin/tasks"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Görev Yönetimi
            </Link>
            <Link
              href="/dashboard/admin/locations"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Lokasyon Yönetimi
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kullanıcı Yönetimi
              </button>
              <button
                onClick={() => setActiveTab('kpi')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'kpi'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                KPI Değerlendirme
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'kpi' && <KPIEvaluation />}
          </div>
        </div>
      </div>
    </div>
  )
}

