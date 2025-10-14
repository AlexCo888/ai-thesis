import './globals.css';
import { routing, locales, type Locale } from '@/i18n/routing';
import { notFound } from 'next/navigation';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: RootLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (locale && !locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <html lang={locale || routing.defaultLocale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
