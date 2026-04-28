import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Space_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import { cookieToInitialState } from '@account-kit/core'
import { config } from '@/config'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'Creative IP — Marketplace for Digital Creators',
  description: 'Register, license, and trade your creative work. The modern platform for artists, musicians, and creators to tokenize and monetize their intellectual property.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1A202C',
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const initialState = cookieToInitialState(config, headersObj.get('cookie') ?? undefined)

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} font-sans antialiased`}>
        <Providers initialState={initialState}>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
