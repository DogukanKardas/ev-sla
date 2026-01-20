import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrDataUrl
  } catch (error) {
    console.error('QR kod oluşturma hatası:', error)
    throw new Error('QR kod oluşturulamadı')
  }
}

export function generateQRCodeString(userId: string): string {
  const timestamp = Date.now()
  return `EV-SLA-${userId}-${timestamp}`
}

