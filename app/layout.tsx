import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DemoStateProvider } from '@/components/demo-state'

export const metadata: Metadata = {
  title: 'AlmaWay — открывай места рядом',
  description: 'Природа ближе, чем кажется.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7faf8',
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
