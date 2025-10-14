# 🌍 Language Quick Reference

## Available Languages (12 Total)

| Language | Code | URL | Native Name | Display |
|----------|------|-----|-------------|---------|
| 🇺🇸 English | `en` | `/` or `/en` | English | EN |
| 🇪🇸 Spanish | `es` | `/es` | Español | ES |
| 🇵🇹 Portuguese | `pt` | `/pt` | Português | PT |
| 🇫🇷 French | `fr` | `/fr` | Français | FR |
| 🇩🇪 German | `de` | `/de` | Deutsch | DE |
| 🇮🇹 Italian | `it` | `/it` | Italiano | IT |
| 🇨🇳 Chinese | `zh` | `/zh` | 中文 | 中文 |
| 🇯🇵 Japanese | `ja` | `/ja` | 日本語 | 日本 |
| 🇰🇷 Korean | `ko` | `/ko` | 한국어 | 한국 |
| 🇸🇦 Arabic | `ar` | `/ar` | العربية | AR |
| 🇷🇺 Russian | `ru` | `/ru` | Русский | RU |
| 🇮🇳 Hindi | `hi` | `/hi` | हिन्दी | हिन्दी |

## Geographic Coverage

- **Americas**: English, Spanish, Portuguese
- **Europe**: English, French, German, Italian, Russian
- **East Asia**: Chinese, Japanese, Korean
- **South Asia**: Hindi
- **Middle East**: Arabic

## Test URLs

```bash
# Development
http://localhost:3000/     # English
http://localhost:3000/es   # Spanish
http://localhost:3000/pt   # Portuguese
http://localhost:3000/fr   # French
http://localhost:3000/de   # German
http://localhost:3000/it   # Italian
http://localhost:3000/zh   # Chinese
http://localhost:3000/ja   # Japanese
http://localhost:3000/ko   # Korean
http://localhost:3000/ar   # Arabic
http://localhost:3000/ru   # Russian
http://localhost:3000/hi   # Hindi

# Production
https://yourdomain.com/     # English
https://yourdomain.com/es   # Spanish
# ... etc
```

## Switching Languages

Users can switch languages in two ways:

1. **LocaleSwitcher Component** - Globe icon in top-right corner
2. **Direct URL** - Navigate to the desired locale URL

The current route is preserved when switching languages.

## Translation Coverage

All UI elements are translated:
- ✅ Navigation tabs
- ✅ Chat interface
- ✅ Search functionality
- ✅ Buttons and actions
- ✅ Empty states
- ✅ Loading messages
- ✅ Error messages
- ✅ Tooltips

## Files

- **Routing**: `src/i18n/routing.ts`
- **Translations**: `messages/*.json` (12 files)
- **Switcher**: `src/components/LocaleSwitcher.tsx`
- **Middleware**: `src/middleware.ts`

For detailed implementation guide, see [INTERNATIONALIZATION.md](./INTERNATIONALIZATION.md)
