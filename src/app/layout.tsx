
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'BGMI India Hub',
  description: 'BGMI Esports India – News, Tournaments, Rosters & Leaderboards Hub',
};

// IMPORTANT: Replace 'ca-pub-YOUR_PUBLISHER_ID' with your actual AdSense Publisher ID
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-YOUR_PUBLISHER_ID';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {ADSENSE_PUBLISHER_ID && ADSENSE_PUBLISHER_ID !== 'ca-pub-YOUR_PUBLISHER_ID' && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
