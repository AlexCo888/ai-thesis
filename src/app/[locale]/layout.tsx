import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="relative">
        {/* LocaleSwitcher - Fixed position with proper mobile spacing */}
        <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50">
          <LocaleSwitcher />
        </div>
        {/* Add top padding to prevent content overlap with LocaleSwitcher */}
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
