import { Analytics } from '@vercel/analytics/next'
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-noto-sans-jp',
})

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-noto-serif-jp',
})

export const metadata: Metadata = {
  title: 'ことばの森 — 五十音の練習',
  description: 'ひらがなとカタカナを、毎日少しずつ練習しよう。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${notoSerifJP.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
