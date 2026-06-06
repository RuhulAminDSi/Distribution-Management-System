const BOT_USER_AGENTS = [
  'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot',
  'WhatsApp', 'TelegramBot', 'Slackbot', 'Discordbot',
  'Pinterest', 'Googlebot', 'Bingbot', 'Slurp',
  'DuckDuckBot', 'Baiduspider', 'YandexBot', 'Sogou',
  'Exabot', 'ia_archiver', 'AhrefsBot', 'SemrushBot'
];

export function isBot(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()));
}
