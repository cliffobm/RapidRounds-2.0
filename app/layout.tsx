import type { Metadata } from 'next'
import './globals.css'
import './experience.css'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Providers from './providers'
import BrowserPage from '@/components/layout/BrowserPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'RapidRounds - Nursing Education Platform',
  description:
    'Gamified comprehensive assessment and clinical judgment through scenario-based practice for nursing education.',
  keywords: [
    'nursing',
    'education',
    'clinical',
    'assessment',
    'scenarios',
    'healthcare',
  ],
  authors: [{ name: 'RapidRounds Team' }],
  creator: 'RapidRounds',
  publisher: 'RapidRounds',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'RapidRounds - Nursing Education Platform',
    description:
      'Gamified comprehensive assessment and clinical judgment through scenario-based practice for nursing education.',
    url: '/',
    siteName: 'RapidRounds',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RapidRounds - Nursing Education Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RapidRounds - Nursing Education Platform',
    description:
      'Gamified comprehensive assessment and clinical judgment through scenario-based practice for nursing education.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title as string}</title>
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            <AppShell>
              <main id="main-content">
                <BrowserPage>{children}</BrowserPage>
              </main>
            </AppShell>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
