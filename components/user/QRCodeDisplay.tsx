'use client'

import { useEffect, useState } from 'react'
import { generateQRCode } from '@/lib/qr/generator'

interface QRCodeDisplayProps {
  qrCodeString: string
  userName: string
}

export default function QRCodeDisplay({ qrCodeString, userName }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function createQR() {
      try {
        const dataUrl = await generateQRCode(qrCodeString)
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error('QR kod oluşturma hatası:', error)
      } finally {
        setLoading(false)
      }
    }
    createQR()
  }, [qrCodeString])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!qrDataUrl) {
    return <div className="text-red-600">QR kod oluşturulamadı</div>
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
      </div>
      <p className="text-sm text-gray-600">Giriş/çıkış için bu QR kodu kullanın</p>
      <button
        onClick={() => {
          const link = document.createElement('a')
          link.download = `qr-code-${userName}.png`
          link.href = qrDataUrl
          link.click()
        }}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        QR Kodu İndir
      </button>
    </div>
  )
}

