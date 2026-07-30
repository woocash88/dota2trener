import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dota 2 Virtual Coach',
  description: 'Analytical dashboard for Dota 2 players',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200">{children}</body>
    </html>
  );
}
