import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MovieAI - AI-Powered Movie Discovery',
  description: 'Discover movies with AI search. Browse, search, and explore the latest movies with intelligent recommendations.',
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-black`}>
      <body className="font-sans antialiased bg-black flex flex-col min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Premium Footer */}
        <footer className="border-t border-gray-900 bg-black/95 py-8 mt-auto backdrop-blur supports-[backdrop-filter]:bg-black/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 text-sm text-center sm:text-left">
              <p className="font-semibold text-white uppercase tracking-wider text-xs mb-1">Developer Contact</p>
              <p className="text-gray-300">Name: <span className="text-white font-medium">prajapati shailesh</span></p>
              <p className="text-gray-300">Email: <a href="mailto:prajapatishailesh4941@gmail.com" className="text-red-500 hover:text-red-400 transition">prajapatishailesh4941@gmail.com</a></p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://digitalheroesco.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition shadow-lg shadow-red-600/10 hover:shadow-red-600/30"
              >
                Built for Digital Heroes
              </a>
            </div>
          </div>
        </footer>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
