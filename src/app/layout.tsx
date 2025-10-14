import './globals.css';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: RootLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (locale && !routing.locales.includes(locale as any)) {
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
