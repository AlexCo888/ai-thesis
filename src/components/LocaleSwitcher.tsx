'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LocaleCode = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko' | 'ar' | 'ru' | 'hi';

const locales: LocaleCode[] = ['en', 'es', 'pt', 'fr', 'de', 'it', 'zh', 'ja', 'ko', 'ar', 'ru', 'hi'];

// Display codes for the dropdown trigger
const localeDisplayCodes: Record<LocaleCode, string> = {
  en: 'EN',
  es: 'ES',
  pt: 'PT',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  zh: '中文',
  ja: '日本',
  ko: '한국',
  ar: 'AR',
  ru: 'RU',
  hi: 'हिन्दी'
};

export default function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (nextLocale: LocaleCode) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {localeDisplayCodes[locale]}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[400px] overflow-y-auto">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => onSelectChange(loc)}
            className={locale === loc ? 'bg-gray-100 font-semibold' : ''}
          >
            <span className="flex items-center gap-2 w-full">
              <span className="flex-1">{t(`locale.${loc}`)}</span>
              {locale === loc && <span className="text-xs">✓</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
