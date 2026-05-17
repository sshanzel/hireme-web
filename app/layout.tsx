import type {Metadata} from 'next';
import {Fraunces, IBM_Plex_Mono, IBM_Plex_Sans} from 'next/font/google';
import './globals.css';
import {QueryProvider} from '@/providers/QueryProvider';
import {AuthProvider} from '@/contexts/AuthContext';

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'HireMe.dev - Your Career Story, Powered by AI',
    template: '%s | HireMe.dev',
  },
  description:
    'Document your career experiences, let AI help you articulate your journey, and create a portfolio that speaks for itself. RAG-powered career coaching and interview preparation.',
  keywords: [
    'career portfolio',
    'AI career coach',
    'interview preparation',
    'job seeker',
    'RAG',
    'professional profile',
    'career stories',
  ],
  authors: [{name: 'HireMe.dev'}],
  creator: 'HireMe.dev',
  metadataBase: new URL('https://hireme-io.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hireme-io.vercel.app',
    siteName: 'HireMe.dev',
    title: 'HireMe.dev - Your Career Story, Powered by AI',
    description:
      'Document your career experiences, let AI help you articulate your journey, and create a portfolio that speaks for itself.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HireMe.dev - Your Career Story, Powered by AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireMe.dev - Your Career Story, Powered by AI',
    description:
      'Document your career experiences, let AI help you articulate your journey, and create a portfolio that speaks for itself.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${plexSans.variable} ${fraunces.variable} ${plexMono.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
