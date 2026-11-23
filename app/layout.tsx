import type { Metadata, Viewport } from 'next'
import 'maplibre-gl/dist/maplibre-gl.css'
import './globals.css'
import './guard.css'
import { DemoStateProvider } from '@/components/demo-state'

export const metadata: Metadata = {
  title: 'Almaway Guard AI — подготовка к походу',
  description: 'Горные маршруты Алматы, план дня, погода и снаряжение.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FCF8F1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body><DemoStateProvider>{children}</DemoStateProvider></body>
    </html>
  )
}
