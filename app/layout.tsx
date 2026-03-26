// app/layout.tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Unsaid — What colleges don\'t tell you.',
  description:
    'Anonymous platform for students to share real placement experiences, interview questions, and campus insights.',
  keywords: ['placements', 'interviews', 'anonymous', 'college', 'campus'],
  openGraph: {
    title: 'Unsaid',
    description: 'What colleges don\'t tell you.',
    type: 'website',
  },
}

import Footer from '@/components/layout/Footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: '#0d0d0f',
          colorInputBackground: '#1a1a1f',
          colorText: '#e8e8ed',
          colorPrimary: '#7c6aff',
          borderRadius: '12px',
        },
      }}
    >
      <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
        <body className="font-dm antialiased">
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
