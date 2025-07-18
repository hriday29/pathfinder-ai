// app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Pathfinder AI',
  description: 'Turn Ambition into Mastery',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        {/* The {children} prop below is the crucial part that was likely missing.
            It tells Next.js where to place the content from your page.js file. */}
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}