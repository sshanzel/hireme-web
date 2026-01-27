import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// Bots to block (search engines, SEO crawlers, AI scrapers)
const BLOCKED_BOTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'qwantify',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
  'gptbot',
  'chatgpt',
  'claudebot',
  'anthropic',
  'ccbot',
  'applebot',
];

// Social crawlers to allow (for link previews / OG images)
const ALLOWED_SOCIAL_BOTS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'telegrambot',
];

export function middleware(request: NextRequest) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Allow social bots for link previews
  const isSocialBot = ALLOWED_SOCIAL_BOTS.some(bot => userAgent.includes(bot));
  if (isSocialBot) {
    return NextResponse.next();
  }

  // Block search engines and aggressive crawlers
  const isBlockedBot = BLOCKED_BOTS.some(bot => userAgent.includes(bot));
  if (isBlockedBot) {
    return new NextResponse('Forbidden', {status: 403});
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files and api health checks
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)'],
};
