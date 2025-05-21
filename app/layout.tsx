import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Header from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI-Muse | NFT Minting with AI-Generated Metadata',
  description: 'Create and update NFTs with AI-generated metadata stored on IPFS and minted on the Base blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="pt-20 min-h-screen bg-background">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}