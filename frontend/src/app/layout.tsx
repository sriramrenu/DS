
import type { Metadata } from 'next';
import './globals.css';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { TargetCursor } from '@/components/ui/target-cursor';

export const metadata: Metadata = {
  title: 'DataSprint 3.0 | Data Science Competition Platform',
  description: 'A modern data science competition management system with tracks for ML, Analytics, NLP, and Computer Vision.',
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased text-foreground min-h-screen overflow-x-hidden">
        {/* Dot grid background */}
        <DotGridBackground />
        <TargetCursor />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
