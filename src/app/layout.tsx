import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { StoreProvider } from "@/contexts/store-context"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WINQER ダッシュボード',
  description: 'WINQER用マーケティングダッシュボード',
  metadataBase: new URL('https://app.sumatoko.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <body className={inter.className}>
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  )
}
