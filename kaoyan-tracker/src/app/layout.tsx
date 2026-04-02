import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '2027考研敏捷复习打卡系统',
  description: 'The Academic Monolith - A stoic minimalist tracking system for Kaoyan 2027.',
};

import AppShell from '@/components/AppShell';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${manrope.variable} antialiased text-on-surface bg-background min-h-screen font-body`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
