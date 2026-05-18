import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'
import { Footer } from './footer'
import './globals.css'
import { Header } from './header'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://mgb.is-a.dev/'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Mirko Bonomi',
    template: '%s | Mirko Bonomi',
  },
  description: 'Personal website and blog of Mirko Bonomi.',
  icons: {
    icon: [
      {
        url: '/favicon-civet/civet.min.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon-civet-white/civet-white.min.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-civet/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon-civet-white/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
    ],
    apple: [
      {
        url: '/favicon-civet/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
}

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} bg-white tracking-tight antialiased dark:bg-zinc-950`}
      >
        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="system"
        >
          <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-inter-tight)]">
            <main className="relative mx-auto w-full max-w-screen-sm flex-1 px-4 pt-20">
              <Header />
              {children}
            </main>
            <div className="mx-auto w-full max-w-screen-sm px-4">
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
