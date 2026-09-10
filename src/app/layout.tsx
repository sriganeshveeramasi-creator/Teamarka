import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: 'TEAM ARKA — AI Smart Logistics & Accessibility Intelligence Platform',
  description:
    'AI-powered smart logistics, accessibility, route intelligence, traffic, weather and risk intelligence platform for Northeast India.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'TEAM ARKA — AI Smart Logistics & Accessibility Intelligence Platform',
    description:
      'AI-powered smart logistics, accessibility, route intelligence, traffic, weather and risk intelligence platform for Northeast India.',
    siteName: 'TEAM ARKA',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TEAM ARKA — AI Smart Logistics & Accessibility Intelligence Platform',
    description:
      'AI-powered smart logistics, accessibility, route intelligence, traffic, weather and risk intelligence platform for Northeast India.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white overflow-x-hidden">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
