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

export default function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (nextLocale: 'en' | 'es') => {
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
          {locale === 'en' ? 'EN' : 'ES'}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onSelectChange('en')}
          className={locale === 'en' ? 'bg-gray-100' : ''}
        >
          <span className="flex items-center gap-2">
            {t('locale.en')}
            {locale === 'en' && <span className="text-xs">✓</span>}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectChange('es')}
          className={locale === 'es' ? 'bg-gray-100' : ''}
        >
          <span className="flex items-center gap-2">
            {t('locale.es')}
            {locale === 'es' && <span className="text-xs">✓</span>}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
