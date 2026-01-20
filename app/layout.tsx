import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EV-SLA - Employee Tracking & KPI Management',
  description: 'IT firması çalışan takip ve performans yönetim sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}

