import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aghatis Resource Monitor',
  description: 'Real-time system resource monitoring dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
