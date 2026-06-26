import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'src/lib/launchSystems.js',
  'src/components/FeedSystem.jsx',
  'src/pages/NetworkOSPages.jsx',
  'src/pages/AccountPages.jsx',
  'netlify/functions/assist-social-post.js',
  'netlify/functions/create-livekit-token.js',
  'netlify/functions/create-stripe-checkout.js',
  'netlify/functions/radio-admin.js',
  'netlify/functions/record-launch-event.js',
  'netlify/functions/upload-media.js',
  'supabase/social_backbone.sql',
  'supabase/social_launch_hardening.sql',
  'supabase/commerce_backbone.sql',
  'supabase/radio_backbone.sql',
  'supabase/meta_level_infra.sql',
  'public/manifest.webmanifest',
  'public/sw.js',
]

const requiredRoutes = [
  '/feed',
  '/profile',
  '/profile/mrstone',
  '/search',
  '/messages',
  '/notifications',
  '/live',
  '/radio',
  '/marketplace',
  '/studio',
  '/static-plus',
  '/creator-pro',
  '/account',
  '/login',
  '/signup',
]

const requiredSqlTables = [
  'content_impressions',
  'creator_affinity',
  'interest_affinity',
  'creator_analytics_daily',
  'media_derivatives',
  'search_events',
  'trending_terms',
  'push_subscriptions',
  'moderation_appeals',
  'copyright_takedowns',
  'creator_payout_accounts',
  'creator_payouts',
  'ops_events',
]

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath))
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function routeExists(route) {
  const app = read('src/App.jsx')
  return app.includes(`case '${route}'`) || app.includes(`path.startsWith('${route}/'`)
}

const files = requiredFiles.map((file) => ({ file, ok: exists(file) }))
const routes = requiredRoutes.map((route) => ({ route, ok: routeExists(route) }))
const sql = read('supabase/meta_level_infra.sql')
const tables = requiredSqlTables.map((table) => ({ table, ok: sql.includes(`public.${table}`) || sql.includes(` ${table} `) }))
const manifest = exists('public/manifest.webmanifest') ? JSON.parse(read('public/manifest.webmanifest')) : null
const feedSystem = read('src/components/FeedSystem.jsx')
const launchSystems = read('src/lib/launchSystems.js')
const socialPages = read('src/pages/NetworkOSPages.jsx')
const supabaseStore = read('src/lib/storage/supabaseStore.js')
const networkDemos = read('src/components/NetworkDemos.jsx')
const socialCss = read('src/social-reframe.css')
const launchChecks = [
  {
    check: 'for-you-ranking',
    ok: launchSystems.includes('rankForYouSignals') && launchSystems.includes('recordFeedEngagement'),
  },
  {
    check: 'batched-launch-events',
    ok: launchSystems.includes('flushRemoteLaunchEvents') && read('netlify/functions/record-launch-event.js').includes('body.events'),
  },
  {
    check: 'search-result-analytics',
    ok: socialPages.includes('resultCount: creatorResults.length + filteredSearchResults.length'),
  },
  {
    check: 'media-derivative-queue',
    ok: supabaseStore.includes('media_derivatives') &&
      feedSystem.includes('mediaDerivativeStatus') &&
      feedSystem.includes('Media optimized for the STATIC player.'),
  },
  {
    check: 'push-subscription-control',
    ok: socialPages.includes('NotificationDeliveryPanel') &&
      socialPages.includes('saveSocialPushSubscription') &&
      supabaseStore.includes('push_subscriptions'),
  },
  {
    check: 'radio-mini-no-directory',
    ok: networkDemos.includes('radio-player__mini-footer') &&
      networkDemos.includes('mini ?') &&
      socialCss.includes('.radio-player.radio-player--mini') &&
      socialCss.includes('grid-template-columns: minmax(0, 1fr)'),
  },
  {
    check: 'carousel-limit',
    ok: feedSystem.includes('MAX_CAROUSEL_MEDIA = 10') && feedSystem.includes('Posts support up to'),
  },
]

const summary = {
  ok: [...files, ...routes, ...tables, ...launchChecks].every((item) => item.ok),
  files,
  routes,
  metaLevelTables: tables,
  launchChecks,
  pwa: {
    manifest: Boolean(manifest?.name && manifest?.start_url && manifest?.icons?.length),
    serviceWorker: exists('public/sw.js'),
  },
  checkedAt: new Date().toISOString(),
}

console.log(JSON.stringify(summary, null, 2))

if (!summary.ok) process.exitCode = 1
