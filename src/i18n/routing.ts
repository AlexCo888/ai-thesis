import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export type Locale = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko' | 'ar' | 'ru' | 'hi';

export const locales: Locale[] = ['en', 'es', 'pt', 'fr', 'de', 'it', 'zh', 'ja', 'ko', 'ar', 'ru', 'hi'];

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en' as Locale,

  // Prefix mode controls how locale prefixes are added to URLs
  localePrefix: 'as-needed'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
