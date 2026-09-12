import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/index.css';
import Maintenance from '@/screens/Maintenance';

export const metadata: Metadata = {
  title: 'ShareRoom - Anonymous Code Sharing',
  description: 'Create temporary anonymous chat rooms to share code, text, and files in real-time. No signup required.',
  keywords: 'code sharing, anonymous chat, temporary rooms, realtime collaboration, developer tools',
  authors: [{ name: 'ShareRoom' }],
  openGraph: {
    title: 'ShareRoom - Anonymous Code Sharing',
    description: 'Create temporary anonymous chat rooms to share code, text, and files in real-time.',
    type: 'website',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShareRoom - Anonymous Code Sharing',
    description: 'Create temporary anonymous chat rooms to share code, text, and files in real-time.',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {isMaintenanceMode ? <Maintenance /> : children}
        </Providers>
      </body>
    </html>
  );
}
