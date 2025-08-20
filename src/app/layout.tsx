import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My TCG - Trading Card Game',
  description: 'A modern web-based trading card game with deck building, pack opening, and strategic gameplay.',
  keywords: ['tcg', 'trading card game', 'deck building', 'strategy', 'cards'],
  authors: [{ name: 'TCG Team' }],
  openGraph: {
    title: 'My TCG - Trading Card Game',
    description: 'Build decks, open packs, and battle with friends in this modern TCG.',
    type: 'website',
  },
  manifest: '/manifest.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen bg-background font-sans antialiased')}>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
