import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BottomNav } from '@/components/ui/BottomNav'

export const metadata: Metadata = {
  title: 'Academic Link - 학술 영어 & 네트워킹 연습',
  description: '학술 영어 표현과 학회 스몰토크를 연습하는 모바일 웹 앱',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <main className="max-w-lg mx-auto bg-white min-h-screen pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
