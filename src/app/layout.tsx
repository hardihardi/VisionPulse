
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const APP_NAME = "VisionPulse";
const APP_DESCRIPTION = "Dasbor analisis lalu lintas cerdas menggunakan AI untuk deteksi plat nomor, analisis volume kendaraan, dan ringkasan lalu lintas secara real-time.";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Dasbor Analisis Lalu Lintas Cerdas`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ['analisis lalu lintas', 'deteksi plat nomor', 'AI', 'dashboard', 'smart city', 'manajemen lalu lintas'],
  authors: [{ name: 'hardihardi', url: 'https://github.com/hardihardi/VisionPulse' }],
  creator: 'hardihardi',
  publisher: 'hardihardi',
  metadataBase: new URL('https://visionpulse.firebaseapp.com'), // Ganti dengan URL produksi Anda
  openGraph: {
    type: "website",
    url: "https://visionpulse.firebaseapp.com", // Ganti dengan URL produksi Anda
    title: {
      default: `${APP_NAME} - Dasbor Analisis Lalu Lintas Cerdas`,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: "/og-image.png", // Pastikan file ini ada di folder /public
        width: 1200,
        height: 630,
        alt: `Logo ${APP_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: `${APP_NAME} - Dasbor Analisis Lalu Lintas Cerdas`,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    images: ["/og-image.png"], // Pastikan file ini ada di folder /public
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
