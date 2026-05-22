import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Search Battle - Master Searching Techniques',
  description: 'Learn, practice, and compete in structured searching challenges from beginner to advanced competitive programming level.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-15">{children}</main>
    </div>
  )
}
