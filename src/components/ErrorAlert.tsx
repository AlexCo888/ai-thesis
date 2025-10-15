'use client';

import { AlertCircle, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ErrorAlertProps {
  error: Error | null;
  onRetry?: () => void;
  className?: string;
}

interface ErrorDetails {
  title: string;
  message: string;
  actionLabel?: string;
  showRetry: boolean;
  externalLink?: { url: string; label: string };
  retryDelay?: number;
}

export default function ErrorAlert({ error, onRetry, className = '' }: ErrorAlertProps) {
  const t = useTranslations('errors');

  if (!error) return null;

  const getErrorDetails = (err: Error): ErrorDetails => {
    const errorMessage = err.message.toLowerCase();

    // Quota exceeded errors
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      const retryMatch = err.message.match(/retry in ([\d.]+)s/i);
      const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;

      return {
        title: t('quotaExceeded.title'),
        message: t('quotaExceeded.message'),
        actionLabel: retrySeconds 
          ? t('quotaExceeded.retryIn', { seconds: retrySeconds })
          : t('quotaExceeded.retryLater'),
        showRetry: !retrySeconds || retrySeconds < 60,
        externalLink: {
          url: 'https://ai.google.dev/gemini-api/docs/rate-limits',
          label: t('quotaExceeded.learnMore')
        },
        retryDelay: retrySeconds || undefined
      };
    }

    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return {
        title: t('authentication.title'),
        message: t('authentication.message'),
        actionLabel: t('authentication.action'),
        showRetry: false
      };
    }

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
      return {
        title: t('network.title'),
        message: t('network.message'),
        actionLabel: t('network.action'),
        showRetry: true
      };
    }

    // Server errors (5xx)
    if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('server error')) {
      return {
        title: t('server.title'),
        message: t('server.message'),
        actionLabel: t('server.action'),
        showRetry: true
      };
    }

    // Generic error
    return {
      title: t('generic.title'),
      message: t('generic.message'),
      actionLabel: t('generic.action'),
      showRetry: true
    };
  };

  const details = getErrorDetails(error);

  return (
    <div className={`rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 ${className}`}>
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 text-sm">
              {details.title}
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {details.message}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {details.showRetry && onRetry && (
              <button
                onClick={onRetry}
                disabled={!!details.retryDelay}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {details.retryDelay ? (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    {details.actionLabel}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    {details.actionLabel || t('retry')}
                  </>
                )}
              </button>
            )}

            {details.externalLink && (
              <a
                href={details.externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                {details.externalLink.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Technical details (collapsed by default) */}
          <details className="mt-3">
            <summary className="text-xs text-red-700 dark:text-red-300 cursor-pointer hover:underline">
              {t('technicalDetails')}
            </summary>
            <pre className="mt-2 text-xs bg-red-100 dark:bg-red-950/50 p-2 rounded border border-red-200 dark:border-red-800 overflow-x-auto">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
