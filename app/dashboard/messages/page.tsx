'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Message {
  id: string
  platform: 'slack' | 'teams' | 'whatsapp'
  sender_name: string
  content: string
  received_at: string
  message_responses?: {
    response_time_seconds: number
    responded_at: string
  }[]
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterPlatform !== 'all' 
        ? `/api/messages?platform=${filterPlatform}`
        : '/api/messages'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }, [filterPlatform])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleResponse = async (messageId: string) => {
    try {
      const response = await fetch('/api/messages/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message_id: messageId }),
      })

      if (response.ok) {
        await loadMessages()
        alert('Yanıt kaydedildi')
      } else {
        const data = await response.json()
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      console.error('Yanıt kaydedilirken hata:', error)
      alert('Yanıt kaydedilirken bir hata oluştu')
    }
  }

  const formatResponseTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} saniye`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika`
    return `${Math.floor(seconds / 3600)} saat`
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'slack': return 'Slack'
      case 'teams': return 'Teams'
      case 'whatsapp': return 'WhatsApp'
      default: return platform
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mesajlar</h1>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tümü</option>
            <option value="slack">Slack</option>
            <option value="teams">Teams</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && messages.length === 0 ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Henüz mesaj yok</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const response = message.message_responses?.[0]
                const responseTime = response?.response_time_seconds

                return (
                  <div
                    key={message.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                          {getPlatformName(message.platform)}
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {message.sender_name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(message.received_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{message.content}</p>
                    <div className="flex justify-between items-center">
                      {responseTime !== undefined ? (
                        <div className="text-sm text-gray-600">
                          Yanıt süresi: {formatResponseTime(responseTime)}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleResponse(message.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                          Yanıt Verildi Olarak İşaretle
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

