import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|pt|fr|de|it|zh|ja|ko|ar|ru|hi)/:path*']
};
