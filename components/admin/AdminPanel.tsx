'use client'

import { useState, useEffect } from 'react'
import UserManagement from './UserManagement'
import KPIEvaluation from './KPIEvaluation'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'kpi'>('users')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Paneli</h1>

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

