import { useCallback, useEffect, useMemo, useState } from 'react'
import { AvatarStudio, StoredMedia } from '../components/AvatarSystem'
import { ChannelCustomizer } from '../components/ChannelCustomizer'
import { CreatorAvatar, EntityComposer, EntityFeed, SignalStrengthBadge } from '../components/FeedSystem'
import { LiveSignalFeed, RadioPlayer } from '../components/NetworkDemos'
import { Link, RouteSEO, useRouter } from '../components/Router'
import { ArrowIcon, ButtonLink, LiveIndicator, PageHero, SignalMark, StaticBrandMark } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { allSeededSocialCreators, dexCreatorPosts, dexCreatorProfile, officialFounderPosts, officialFounderProfile, previewSocialSignals, socialBotCreators } from '../data/socialBots'
import { unlockedSignalMilestones } from '../data/signalMilestones'
import { getCreatorAnalytics, getTrendingTokens, recordSearchQuery } from '../lib/launchSystems'
import { addCreatorSignalPoints, addSocialNotification, getCreatorProfile, getCurrentEntity, getFollow, getFollows, getNetworkStats, getSignals, getSocialNotifications, markSocialNotificationsRead, normalizeHandle, subscribeToNetworkUpdates } from '../lib/staticStore'
import { getSocialActivityNotifications, getSocialMessageThreads, getSocialThreadMessages, markSocialActivityRead, markSocialThreadRead, recordSocialActivity, saveSocialPushSubscription, searchSocialProfiles, sendSocialMessage, toggleSocialFollow } from '../lib/socialActions'

function creatorFallbackFromAuth(profile, user) {
  return {
    id: user?.id || '',
    displayName: profile?.display_name || profile?.displayName || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
    username: profile?.username || user?.user_metadata?.username || '',
    email: user?.email || '',
    avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || '',
    banner_url: profile?.banner_url || '',
    bio: profile?.bio || '',
    website_url: profile?.website_url || '',
    signal_score: profile?.signal_score,
  }
}

function isMrStoneAccount(user, profile) {
  const role = user?.app_metadata?.role || user?.user_metadata?.role
  const values = [
    role,
    profile?.username,
    profile?.display_name,
    user?.user_metadata?.username,
    user?.user_metadata?.display_name,
    user?.email,
  ].map((value) => String(value || '').trim().toLowerCase())

  return values.some((value) => (
    value === 'owner'
    || value === 'mrstone'
    || value === 'mr.stone'
    || value === 'mr stone'
    || value === '@mrstone'
    || value === 'thestaticnetwork.com@gmail.com'
  ))
}

export function FeedPage({ signalsMode = false, followedOnly = false }) {
  const [stats, setStats] = useState(() => getNetworkStats())
  const { user, profile } = useAuth()
  const creator = user ? getCreatorProfile(creatorFallbackFromAuth(profile, user)) : dexCreatorProfile
  useEffect(() => subscribeToNetworkUpdates(() => setStats(getNetworkStats())), [])
  if (followedOnly) return <FollowingPage />
  const path = followedOnly ? '/my-signal' : signalsMode ? '/signals' : '/feed'
  const feedMode = followedOnly || signalsMode
  const isAiNetwork = !followedOnly && !signalsMode
  const shouldShowHero = followedOnly || signalsMode
  const heroImage = signalsMode
    ? '/assets/world/city/heroes/static-signals-boulevard-v8-final.png'
    : followedOnly
      ? '/assets/world/city/heroes/static-fields-macro-map-v3-three-regions-island.png'
      : '/assets/world/city/heroes/static-channels-signal-walk-v3.png'
  const heroClassName = signalsMode
    ? 'page-hero--signals-boulevard'
    : followedOnly
      ? 'page-hero--discover-hub'
      : 'page-hero--channels-district'

  return (
    <>
      <RouteSEO path={path} />
      {shouldShowHero && (
        <PageHero
          compact
          code={followedOnly ? 'My Signal' : 'Public Feed'}
          eyebrow={followedOnly ? 'MY SIGNAL' : 'STATIC SIGNALS'}
          title={followedOnly ? 'Your followed creators, one pulse.' : 'The AI work feed is live.'}
          copy={followedOnly ? 'A personal feed built from the creators, Channels, and AI work you choose to follow.' : 'Post AI-made or AI-assisted work, follow creators, build Signal, save what moves you, and step into the posts already lighting up the district.'}
          status={followedOnly ? 'Personal feed' : 'AI social live'}
          image={heroImage}
          imagePosition="center center"
          className={heroClassName}
        >
          <div className="button-row">
            <ButtonLink to={followedOnly ? '/discover' : '/feed#create-post'}>{followedOnly ? 'Discover Creators' : 'Post AI Work'} <ArrowIcon /></ButtonLink>
            <ButtonLink to={followedOnly ? '/signals' : '/signup'} variant="glass">{followedOnly ? 'Public Posts' : 'Create Profile'}</ButtonLink>
          </div>
        </PageHero>
      )}
      <section className={`section feed-page ${isAiNetwork ? 'feed-page--app' : ''}`}>
        <div className="page-frame">
          {feedMode && (
            <div className="signal-pulse-panel">
              {[
                ['Public Posts', stats.publicSignals],
                ['Channels', stats.channels],
                ['Follows', stats.follows],
                ['Saved Assets', stats.savedCatalog],
                ['Access Requests', stats.requestedCatalog],
              ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
            </div>
          )}
          {signalsMode && <SignalsBillboardWall />}
          {signalsMode && <EntityComposer onTransmitted={() => setStats(getNetworkStats())} />}
          {feedMode ? (
            <LiveSignalFeed searchable followedOnly={followedOnly} />
          ) : (
            <>
              <div className="ai-social-workspace ai-social-workspace--northstar">
                <SocialDesktopRail stats={stats} creator={creator} user={user} />
                <main className="ai-social-main-column" aria-label="STATIC Social feed">
                  <SocialFeedTopBar stats={stats} creator={creator} user={user} />
                  <EntityFeed showComposer={Boolean(user)} />
                </main>
                <AiSocialSideRail stats={stats} creator={creator} user={user} />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

function SignalsBillboardWall() {
  const signals = previewSocialSignals.slice(0, 6)
  const [active, setActive] = useState(0)
  const signal = signals[active] || signals[0]

  if (!signal) return null

  return (
    <section className="platform-action-surface signal-billboard-wall signals-billboard-wall" aria-label="Signals billboard wall">
      <div className="signal-billboard-wall__hero">
        <img src={signalPrimaryMediaUrl(signal)} alt="" />
        <div>
          <LiveIndicator label="BILLBOARD LIVE" />
          <h3>{signal.title}</h3>
          <p>{signal.caption || signal.text}</p>
          <div className="button-row">
            <ButtonLink to={`/feed#${signal.id}`}>Open Post <ArrowIcon /></ButtonLink>
            <ButtonLink to={`/profile/${normalizeHandle(signal.entityHandle)}`} variant="glass">Open Creator</ButtonLink>
          </div>
        </div>
      </div>
      <div className="signal-billboard-wall__screens" aria-label="Billboard signal selector">
        {signals.map((item, index) => (
          <button className={index === active ? 'is-active' : ''} type="button" onClick={() => setActive(index)} key={item.id}>
            <img src={signalPrimaryMediaUrl(item)} alt="" />
            <span>{item.entityName}</span>
            <b>{item.title}</b>
          </button>
        ))}
      </div>
    </section>
  )
}

function SocialFeedTopBar({ stats, creator, user }) {
  return (
    <section className="social-feed-topbar" aria-label="STATIC Social feed controls">
      <Link className="social-feed-search-bar" to="/search">
        <span aria-hidden="true" />
        <b>Search creators, signals, and more...</b>
      </Link>
      <nav className="social-feed-quick-actions" aria-label="Social shortcuts">
        <Link to="/messages" aria-label="Messages">Messages</Link>
        <Link to="/notifications" aria-label="Notifications">Notifications</Link>
        <Link to={user ? '/profile' : '/login'} aria-label="Profile"><CreatorAvatar creator={creator} size="small" /></Link>
      </nav>
      <div className="social-feed-panel-heading">
        <div>
          <span>STATIC Social</span>
          <h1>Feed</h1>
        </div>
        <small>{stats.publicSignals + previewSocialSignals.length + officialFounderPosts.length + dexCreatorPosts.length} posts live</small>
      </div>
      <nav className="social-feed-tabs" aria-label="Feed filters">
        <Link className="is-active" to="/feed">For You</Link>
        <Link to="/my-signal">Following</Link>
        <Link to="/live">Live</Link>
        <Link to="/tv">STATIC TV</Link>
        <Link to="/marketplace">Store</Link>
      </nav>
    </section>
  )
}

function SocialDesktopRail({ creator, user }) {
  const navItems = [
    ['Feed', '/feed'],
    ['Explore', '/discover'],
    ['Signals', '/signals'],
    ['TV', '/tv'],
    ['Messages', '/messages'],
    ['Notifications', '/notifications'],
    ['Profile', user ? '/profile' : '/login'],
    ['Saved', '/my-signal'],
    ['Library', '/marketplace'],
  ]
  const profileRoute = user ? '/profile' : '/profile/dex'
  const scoreLabel = creator.signalScore || '0'

  return (
    <aside className="social-desktop-rail" aria-label="STATIC Social navigation">
      <Link className="social-desktop-rail__brand" to="/feed">
        <StaticBrandMark className="static-brand-mark" />
        <span>STATIC <b>Social</b></span>
      </Link>
      <Link className="social-desktop-rail__profile" to={profileRoute}>
        <CreatorAvatar creator={creator} size="large" />
        <strong>{creator.displayName || 'STATIC Creator'}</strong>
        <small>{creator.handle || '@static'}</small>
      </Link>
      <div className="social-desktop-rail__signal">
        <b>{scoreLabel}</b>
        <span>Signal</span>
        <SignalStrengthBadge score={creator.signalScore} compact />
      </div>
      <div className="social-desktop-rail__primary-actions">
        <Link to={user ? '/feed#create-post' : '/signup'}>Create</Link>
        <Link to={user ? '/live' : '/login'}>Go Live</Link>
      </div>
      <nav className="social-desktop-rail__nav">
        {navItems.map(([label, route]) => (
          <Link className={label === 'Feed' ? 'is-active' : ''} to={route} key={label}>
            <span aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function AiNetworkLaunchPanel() {
  return (
    <section className="ai-network-launch-panel" aria-label="STATIC Network AI social launch">
      <div>
        <span>LIVE PRODUCT / STATIC SOCIAL</span>
        <h2>STATIC Social stands on its own, but it is not just another feed.</h2>
        <p>It is the AI-native social app for posts, creators, Channels, uploaded music, Marketplace intent, and Signal. The next layer is creation inside the app: images, music, videos, music videos, small-scale games, assets, and reusable blueprints that eventually unlock inside STATIC City.</p>
      </div>
      <div className="ai-network-launch-panel__rules">
        {[
          ['01', 'AI made or AI-assisted', 'Every post declares how AI helped create, edit, remix, animate, write, generate, or refine the work.'],
          ['02', 'Signal begins now', 'Posts and unique followers earn 100 Signal. Comments and likes earn 10. Shares earn 20. Reputation becomes the early social layer.'],
          ['03', 'Create inside the app', 'The coming creation suite covers images, music, videos, music videos, small games, assets, worlds, voices, and reusable blueprints.'],
          ['04', 'One login, future transfer', 'Your STATIC login is designed to carry profile, Signal, creations, assets, follows, and future game identity into the client.'],
        ].map(([code, title, copy]) => (
          <article key={title}>
            <span>{code}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function AiSocialSideRail({ stats, user }) {
  const suggestions = [dexCreatorProfile, ...socialBotCreators.slice(14, 18)]
  const trends = ['#STATICSocial', '#AIMade', '#StaticTV', '#CreatorChannels']
  const liveWatchers = [socialBotCreators[3], socialBotCreators[13], socialBotCreators[24], socialBotCreators[37]]

  return (
    <aside className="ai-social-side-rail" aria-label="STATIC Social sidebar">
      <SocialRadioCard />
      <SocialTvCard />
      <section className="social-live-card">
        <LiveIndicator label="Signal Live" />
        <strong>Go live</strong>
        <p>Start a live room, bring guests in, and earn Signal while people watch.</p>
        <div className="social-live-card__watchers" aria-label="AI creator watchers online">
          {liveWatchers.map((item) => <CreatorAvatar creator={item} size="small" key={item.id} />)}
          <span>AI creators are watching</span>
        </div>
        <Link to={user ? '/live' : '/login'}>{user ? 'Go live now' : 'Login to start'}</Link>
      </section>
      <section className="signal-economy-card social-suggestions-card">
        <h3>Suggested creators</h3>
        {suggestions.map((item) => (
          <article className="social-suggestion-row" key={item.id}>
            <Link to={`/profile/${normalizeHandle(item.handle)}`}>
              <CreatorAvatar creator={item} size="small" />
              <span><b>{item.displayName}</b><small>{item.handle}</small></span>
            </Link>
            <FollowCreatorButton creator={item} />
          </article>
        ))}
      </section>
      <section className="social-scope-card social-trends-card">
        <h3>Trending</h3>
        {trends.map((trend) => <Link to={`/search?tag=${encodeURIComponent(trend.replace('#', ''))}`} key={trend}>{trend}<small>{Math.max(12, stats.publicSignals + trend.length)}K posts</small></Link>)}
      </section>
    </aside>
  )
}

function SocialRadioCard({ mobile = false }) {
  return (
    <section className={`social-radio-card ${mobile ? 'social-radio-card--mobile' : ''}`} aria-label="STATIC Radio">
      <div className="social-radio-card__backdrop" aria-hidden="true" />
      <div className="social-radio-card__header">
        <LiveIndicator label="STATIC RADIO" />
        <h3>Creator music in rotation.</h3>
        <p>Approved songs and audio uploads from STATIC creators move into the public station.</p>
      </div>
      <RadioPlayer mini />
    </section>
  )
}

function getStaticTvSignals() {
  return [
    ...getSignals().slice().reverse(),
    ...officialFounderPosts,
    ...dexCreatorPosts,
    ...previewSocialSignals,
  ].filter(isStaticTvSignal)
}

const staticTvFilters = [
  ['all', 'All'],
  ['music-videos', 'Music Videos'],
  ['shows', 'Shows'],
  ['premieres', 'Premieres'],
  ['channels', 'Channels'],
]

function formatStaticTvCount(value = 0) {
  const number = Number(value || 0)
  if (number >= 1_000_000) return `${Number((number / 1_000_000).toFixed(1))}M`
  if (number >= 1_000) return `${Number((number / 1_000).toFixed(1))}K`
  return String(number)
}

function staticTvText(signal = {}) {
  return [
    signal.title,
    signal.text,
    signal.caption,
    signal.tags,
    signal.postType,
    signal.type,
  ].map((value) => String(value || '').toLowerCase()).join(' ')
}

function staticTvKind(signal = {}) {
  const text = staticTvText(signal)
  if (text.includes('music video')) return 'Music Video'
  if (text.includes('show') || text.includes('series') || text.includes('episode')) return 'Show'
  if (text.includes('premiere') || text.includes('red carpet') || text.includes('theater')) return 'Premiere'
  if (text.includes('live') || text.includes('performance')) return 'Live Replay'
  return 'Video'
}

function staticTvDuration(signal = {}) {
  if (signal.duration) return signal.duration
  const durations = ['02:18', '04:44', '08:37', '12:06', '23:47', '01:02:40']
  const key = String(signal.id || signal.title || '').split('').reduce((sum, letter) => sum + letter.charCodeAt(0), 0)
  return durations[key % durations.length]
}

function staticTvCreator(signal = {}) {
  const handle = signal.entityHandle || signal.handle || signal.creatorHandle || ''
  const normalized = normalizeHandle(handle)
  const seeded = allSeededSocialCreators.find((creator) => normalizeHandle(creator.handle) === normalized)
  if (seeded) return seeded
  if (normalizeHandle(officialFounderProfile.handle) === normalized) return officialFounderProfile
  if (normalizeHandle(dexCreatorProfile.handle) === normalized) return dexCreatorProfile
  return {
    id: normalized || signal.creatorId || signal.id || 'static-tv-creator',
    displayName: signal.entityName || signal.creator || 'STATIC Creator',
    handle: handle || '@static',
    avatarUrl: signal.profileImageUrl || signal.avatarUrl || '',
    signalScore: signal.signalScore || 0,
  }
}

function staticTvStats(signal = {}) {
  const reactions = Number(signal.previewReactionCount || signal.reactions?.length || 0)
  const comments = Number(signal.previewCommentCount || signal.comments?.length || 0)
  const shares = Number(signal.previewShareCount || signal.shareCount || 0)
  const views = Number(signal.previewViewCount || (reactions * 6) + (comments * 18) + (shares * 10) + 1240)
  return {
    views: formatStaticTvCount(views),
    reactions: formatStaticTvCount(reactions),
    comments: formatStaticTvCount(comments),
    shares: formatStaticTvCount(shares),
    duration: staticTvDuration(signal),
  }
}

function staticTvMatchesFilter(signal, filter) {
  if (filter === 'all') return true
  if (filter === 'channels') return true
  const text = staticTvText(signal)
  const kind = staticTvKind(signal).toLowerCase()
  if (filter === 'music-videos') return kind.includes('music') || text.includes('music') || text.includes('song') || text.includes('radio')
  if (filter === 'shows') return kind.includes('show') || text.includes('series') || text.includes('episode') || text.includes('film')
  if (filter === 'premieres') return kind.includes('premiere') || text.includes('premiere') || text.includes('red carpet') || text.includes('live')
  return true
}

function staticTvCreatorChannels(tvSignals = []) {
  const channels = new Map()
  tvSignals.forEach((signal) => {
    const creator = staticTvCreator(signal)
    const key = normalizeHandle(creator.handle || creator.displayName || creator.id)
    if (!channels.has(key)) {
      channels.set(key, {
        creator,
        count: 0,
        latest: signal,
        views: 0,
      })
    }
    const channel = channels.get(key)
    const stats = staticTvStats(signal)
    channel.count += 1
    channel.views += Number(String(stats.views).replace(/[^0-9.]/g, '')) || 0
    channel.latest = signal
  })
  return Array.from(channels.values()).slice(0, 8)
}

function getStaticTvCollections(tvSignals = []) {
  const byText = (pattern) => tvSignals.filter((signal) => pattern.test(staticTvText(signal)))
  const fallbackSlice = (start, count) => tvSignals.slice(start, start + count)
  const featured = tvSignals.slice(0, 8)
  const musicVideos = byText(/music video|music|song|radio|performance|rooftop/)
  const shows = byText(/show|series|episode|film|theater|channel|wondercore|arena/)
  const premieres = byText(/premiere|red carpet|live|launch|official/)

  return [
    ['featured', 'Featured on STATIC TV', featured],
    ['music-videos', 'Music Videos', musicVideos.length ? musicVideos.slice(0, 8) : fallbackSlice(0, 6)],
    ['shows', 'Shows & Episodes', shows.length ? shows.slice(0, 8) : fallbackSlice(2, 6)],
    ['premieres', 'Premieres & Live Replays', premieres.length ? premieres.slice(0, 8) : fallbackSlice(1, 6)],
  ].filter(([, , items]) => items.length)
}

function isStaticTvSignal(signal = {}) {
  const mediaUrl = signalPrimaryMediaUrl(signal)
  const mediaTypes = [
    signal.fileType,
    signal.file_type,
    signal.postType,
    signal.type,
    ...(Array.isArray(signal.fileTypes) ? signal.fileTypes : []),
    ...(Array.isArray(signal.file_types) ? signal.file_types : []),
  ].map((value) => String(value || '').toLowerCase()).join(' ')

  return mediaTypes.includes('music video')
    || mediaTypes.includes('music-video')
    || mediaTypes.includes('show')
    || /\bvideo\b/.test(mediaTypes)
    || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(mediaUrl)
}

function StaticTvPreviewMedia({ signal, controls = false }) {
  const mediaUrl = signalPrimaryMediaUrl(signal)
  const mediaRef = signal.mediaRefs?.[0] || signal.mediaId || ''
  const mediaType = String(signal.fileType || signal.file_type || signal.postType || signal.type || '')
  const isVideo = /^video/i.test(mediaType) || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(mediaUrl) || /music video|show|video/i.test(mediaType)
  if (mediaRef && isVideo) return <StoredMedia mediaRef={mediaRef} as="video" controls={controls} alt={signal.title || 'STATIC TV'} />
  if (mediaUrl && /\.(mp4|mov|webm|m4v)(\?|$)/i.test(mediaUrl)) return <video src={mediaUrl} controls={controls} muted={!controls} loop={!controls} playsInline preload="metadata" />
  if (mediaUrl) return <img src={mediaUrl} alt={signal.title || 'STATIC TV'} />
  return <div className="static-tv-empty-frame"><StaticBrandMark className="static-brand-mark" /><span>STATIC TV</span></div>
}

function SocialTvCard() {
  const [tvSignals, setTvSignals] = useState(() => getStaticTvSignals())
  const featured = tvSignals[0]
  const queue = tvSignals.slice(1, 4)
  const featuredStats = featured ? staticTvStats(featured) : null

  useEffect(() => subscribeToNetworkUpdates(() => setTvSignals(getStaticTvSignals())), [])

  return (
    <section className="social-tv-card" aria-label="STATIC TV">
      <div className="social-tv-card__backdrop" aria-hidden="true" />
      <header className="social-tv-card__header">
        <LiveIndicator label="STATIC TV" />
        <h3>Shows, videos, premieres.</h3>
        <p>The network video player for AI-made shows, music videos, creator channels, and live replays.</p>
      </header>
      {featured ? (
        <Link className="social-tv-card__feature" to="/tv">
          <span className="social-tv-card__screen"><StaticTvPreviewMedia signal={featured} /></span>
          <span className="social-tv-card__copy">
            <b>{featured.title || 'STATIC TV upload'}</b>
            <small>{featured.entityName || featured.creator || 'STATIC Creator'} / {staticTvKind(featured)} / {featuredStats?.duration}</small>
          </span>
        </Link>
      ) : (
        <Link className="social-tv-card__feature social-tv-card__feature--empty" to="/feed#create-post">
          <span className="social-tv-card__screen"><StaticBrandMark className="static-brand-mark" /></span>
          <span className="social-tv-card__copy">
            <b>Upload the first STATIC TV drop.</b>
            <small>Post a Video, Music Video, or Show.</small>
          </span>
        </Link>
      )}
      <div className="social-tv-card__queue">
        {queue.map((item) => <Link to={`/feed#${item.id}`} key={item.id}>{item.title || 'Creator video'}<small>{staticTvKind(item)} / {item.entityHandle || item.handle || '@static'}</small></Link>)}
        <Link to="/tv">Open STATIC TV <ArrowIcon /></Link>
      </div>
    </section>
  )
}

function normalizeSearchText(value = '') {
  return String(value || '').toLowerCase()
}

function normalizeSocialToken(value = '') {
  return String(value || '')
    .replace(/^[@#]/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function signalSearchHaystack(signal) {
  return [
    signal.title,
    signal.text,
    signal.caption,
    signal.tags,
    signal.entityName,
    signal.entityHandle,
    ...(signal.comments || []).flatMap((comment) => [comment.text, comment.entityName, comment.entityHandle]),
  ].map(normalizeSearchText).join(' ')
}

function signalMentionsHandle(signal, handle) {
  const normalized = normalizeHandle(handle)
  const mentionText = [
    signal.text,
    signal.caption,
  ].join(' ')
  const mentions = mentionText.match(/@[a-zA-Z0-9._-]+/g) || []
  return mentions.some((mention) => normalizeHandle(mention) === normalized)
}

function signalPrimaryMediaUrl(signal) {
  return signal.mediaUrls?.[0]
    || signal.media_urls?.[0]
    || signal.mediaUrl
    || signal.image
    || ''
}

export function StaticTvPage() {
  const [tvSignals, setTvSignals] = useState(() => getStaticTvSignals())
  const [activeId, setActiveId] = useState(() => getStaticTvSignals()[0]?.id || '')
  const [filter, setFilter] = useState('all')
  const filteredSignals = useMemo(
    () => tvSignals.filter((signal) => staticTvMatchesFilter(signal, filter)),
    [filter, tvSignals],
  )
  const collections = useMemo(
    () => getStaticTvCollections(filteredSignals.length ? filteredSignals : tvSignals),
    [filteredSignals, tvSignals],
  )
  const channels = useMemo(
    () => staticTvCreatorChannels(tvSignals),
    [tvSignals],
  )
  const active = tvSignals.find((item) => item.id === activeId) || filteredSignals[0] || tvSignals[0]
  const activeCreator = active ? staticTvCreator(active) : null
  const activeStats = active ? staticTvStats(active) : null
  const queue = (filteredSignals.length ? filteredSignals : tvSignals).filter((item) => item.id !== active?.id).slice(0, 8)

  useEffect(() => subscribeToNetworkUpdates(() => {
    const next = getStaticTvSignals()
    setTvSignals(next)
    setActiveId((current) => current && next.some((item) => item.id === current) ? current : next[0]?.id || '')
  }), [])

  function chooseFilter(nextFilter) {
    const nextSignals = tvSignals.filter((signal) => staticTvMatchesFilter(signal, nextFilter))
    setFilter(nextFilter)
    setActiveId(nextSignals[0]?.id || tvSignals[0]?.id || '')
  }

  return (
    <>
      <RouteSEO
        path="/tv"
        title="STATIC TV | Creator Shows, Channels, and Music Videos"
        description="Watch creator-uploaded AI videos, shows, premieres, and music videos on STATIC TV."
      />
      <section className="section static-tv-page">
        <div className="page-frame static-tv-shell">
          <header className="static-tv-hero">
            <div className="static-tv-hero__kicker">
              <LiveIndicator label="STATIC TV" />
              <span>Creator video network</span>
            </div>
            <h1>Watch the AI-made channel layer.</h1>
            <p>STATIC TV collects creator-uploaded videos, shows, music videos, live replays, and channel drops into one premium viewing surface. Post from STATIC Social, then watch it here.</p>
            <div className="static-tv-hero__stats">
              <article><b>{tvSignals.length}</b><span>Videos</span></article>
              <article><b>{channels.length}</b><span>Channels</span></article>
              <article><b>{collections.length}</b><span>Collections</span></article>
            </div>
            <div className="button-row">
              <ButtonLink to="/feed#create-post">Upload Video <ArrowIcon /></ButtonLink>
              <ButtonLink to="/feed" variant="glass">Back To Feed</ButtonLink>
            </div>
          </header>
          <nav className="static-tv-tabs" aria-label="STATIC TV categories">
            {staticTvFilters.map(([id, label]) => (
              <button className={id === filter ? 'is-active' : ''} type="button" onClick={() => chooseFilter(id)} key={id}>{label}</button>
            ))}
          </nav>
          <div className="static-tv-layout">
            <article className="static-tv-player">
              <div className="static-tv-player__screen">
                {active ? <StaticTvPreviewMedia signal={active} controls /> : <StaticBrandMark className="static-brand-mark" />}
              </div>
              <div className="static-tv-player__meta">
                <div className="static-tv-player__chips">
                  <span>{active ? staticTvKind(active) : 'STATIC TV'}</span>
                  {activeStats && <span>{activeStats.duration}</span>}
                  <span>AI-made / assisted</span>
                </div>
                <h2>{active?.title || 'No videos uploaded yet.'}</h2>
                <p>{active?.text || active?.caption || 'Post a Video, Music Video, or Show from STATIC Social to start the channel.'}</p>
                {active && (
                  <>
                    <Link className="static-tv-player__creator" to={`/profile/${normalizeHandle(activeCreator?.handle)}`}>
                      <CreatorAvatar creator={activeCreator} size="small" />
                      <span><b>{activeCreator?.displayName || 'STATIC Creator'}</b><small>{activeCreator?.handle || '@static'}</small></span>
                      <SignalStrengthBadge score={activeCreator?.signalScore || active?.signalScore || 0} compact />
                    </Link>
                    <div className="static-tv-player__stats" aria-label="STATIC TV stats">
                      <span><b>{activeStats.views}</b> views</span>
                      <span><b>{activeStats.reactions}</b> likes</span>
                      <span><b>{activeStats.comments}</b> comments</span>
                      <span><b>{activeStats.shares}</b> shares</span>
                    </div>
                    <div className="static-tv-player__actions">
                      <Link to={`/feed#${active.id}`}>Open Post <ArrowIcon /></Link>
                      <Link to={`/profile/${normalizeHandle(activeCreator?.handle)}`}>Open Channel</Link>
                      <Link to="/feed#create-post">Upload Yours</Link>
                    </div>
                  </>
                )}
              </div>
            </article>
            <aside className="static-tv-queue" aria-label="STATIC TV queue">
              <div className="console-topbar"><span>Up Next</span><span>{queue.length} videos</span></div>
              {queue.map((item) => (
                <button className={item.id === active?.id ? 'is-active' : ''} type="button" onClick={() => setActiveId(item.id)} key={item.id}>
                  <span><StaticTvPreviewMedia signal={item} /></span>
                  <b>{item.title || 'Creator video'}</b>
                  <small>{item.entityName || item.creator || 'STATIC Creator'} / {staticTvKind(item)} / {staticTvDuration(item)}</small>
                </button>
              ))}
              {!queue.length && <p>Video queue is waiting for more creator uploads.</p>}
            </aside>
          </div>
          <section className="static-tv-rails" aria-label="STATIC TV collections">
            {collections.map(([id, title, items]) => (
              <StaticTvRail title={title} items={items} activeId={active?.id} onSelect={setActiveId} key={id} />
            ))}
          </section>
          <section className="static-tv-channel-grid" aria-label="STATIC TV creator channels">
            <div className="static-tv-section-heading">
              <span>Creator channels</span>
              <h2>Every video profile becomes a channel.</h2>
            </div>
            <div className="static-tv-channel-grid__items">
              {channels.map((channel) => (
                <Link className="static-tv-channel-card" to={`/profile/${normalizeHandle(channel.creator.handle)}`} key={channel.creator.id || channel.creator.handle}>
                  <CreatorAvatar creator={channel.creator} size="small" />
                  <span><b>{channel.creator.displayName}</b><small>{channel.creator.handle}</small></span>
                  <em>{channel.count} uploads</em>
                </Link>
              ))}
            </div>
          </section>
          <section className="static-tv-upload-guide" aria-label="STATIC TV upload standards">
            <div>
              <span>Upload standard</span>
              <h2>Video posts become television when the work is ready.</h2>
              <p>Choose Video, Music Video, or Show in the post composer, attach the file, confirm it is AI-made or AI-assisted, then publish. STATIC TV keeps video separate from Radio so music, shows, and creator channels each get the right surface.</p>
            </div>
            <div className="static-tv-upload-guide__rules">
              {[
                'AI-made or AI-assisted work only',
                'Own the rights to what you upload',
                'Video, music video, and show posts route to TV',
                'Audio and music uploads route to Radio',
              ].map((rule) => <span key={rule}>{rule}</span>)}
            </div>
          </section>
        </div>
      </section>
    </>
  )
}

function StaticTvRail({ title, items, activeId, onSelect }) {
  if (!items.length) return null
  return (
    <section className="static-tv-rail">
      <div className="static-tv-section-heading">
        <span>STATIC TV</span>
        <h2>{title}</h2>
      </div>
      <div className="static-tv-rail__track">
        {items.map((item) => {
          const stats = staticTvStats(item)
          return (
            <button className={item.id === activeId ? 'is-active' : ''} type="button" onClick={() => onSelect(item.id)} key={item.id}>
              <span className="static-tv-rail__poster">
                <StaticTvPreviewMedia signal={item} />
                <em>{stats.duration}</em>
              </span>
              <b>{item.title || 'STATIC TV upload'}</b>
              <small>{item.entityName || item.creator || 'STATIC Creator'} / {staticTvKind(item)}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ProfilePostCard({ signal }) {
  const mediaUrl = signalPrimaryMediaUrl(signal)
  const mediaRef = signal.mediaRefs?.[0]
  const mediaType = String(signal.fileType || signal.postType || signal.type || '')
  const isVideo = /^video/i.test(mediaType) || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(mediaUrl)
  const isAudio = /(audio|music)/i.test(mediaType) || /\.(mp3|wav|wave|m4a|aac|ogg|flac|aiff|aif)(\?|$)/i.test(mediaUrl)
  const hasMedia = Boolean(mediaRef || mediaUrl)
  const textPreview = signal.text || signal.caption || signal.title || 'STATIC post'

  return (
    <Link className={`creator-profile-post-card ${hasMedia ? '' : 'creator-profile-post-card--text'}`} to={`/feed#${signal.id}`}>
      <span className="creator-profile-post-card__media">
        {mediaRef ? (
          <StoredMedia mediaRef={mediaRef} alt={signal.title || 'STATIC post'} />
        ) : isVideo && mediaUrl ? (
          <video src={mediaUrl} muted playsInline preload="metadata" />
        ) : isAudio && mediaUrl ? (
          <span className="creator-profile-post-card__audio"><SignalMark animated /><audio src={mediaUrl} controls preload="metadata" /></span>
        ) : !hasMedia ? (
          <span className="creator-profile-post-card__text-preview"><i>Text</i><b>{textPreview}</b></span>
        ) : (
          <img src={mediaUrl} alt={signal.title || 'STATIC post'} />
        )}
      </span>
      <span className="creator-profile-post-card__meta">
        <b>{signal.title || 'STATIC post'}</b>
        <small>{signal.entityName || signal.postType || signal.type || 'Post'}</small>
      </span>
    </Link>
  )
}

function ProfilePostGrid({ posts, empty }) {
  if (!posts.length) {
    return <p className="creator-profile-empty-note">{empty}</p>
  }

  return (
    <div className="creator-profile-post-grid">
      {posts.map((signal) => <ProfilePostCard signal={signal} key={signal.id} />)}
    </div>
  )
}

function creatorSearchHaystack(creator) {
  return normalizeSearchText(`${creator.displayName} ${creator.handle} ${creator.archetype || ''} ${creator.vibe || ''} ${creator.bio || ''}`)
}

function CreatorResultRow({ creator, note = 'Profile' }) {
  const profileRoute = `/profile/${normalizeHandle(creator.handle)}`

  return (
    <article className="social-list-row social-list-row--creator">
      <Link className="social-list-row__main" to={profileRoute}>
        <CreatorAvatar creator={creator} size="small" />
        <span><b>{creator.displayName}</b><small>{creator.handle} / {creator.archetype || note}</small></span>
      </Link>
      <div className="social-list-row__creator-actions">
        <SignalStrengthBadge score={creator.signalScore} compact />
        <FollowCreatorButton creator={creator} fallbackLabel={note} />
      </div>
    </article>
  )
}

function creatorProfileRoute(creator) {
  return normalizeHandle(creator?.handle) === 'mrstone' ? '/profile/mrstone' : `/profile/${normalizeHandle(creator?.handle)}`
}

function FollowCreatorButton({ creator, fallbackLabel = 'Follow' }) {
  const { user } = useAuth()
  const [active, setActive] = useState(() => getFollow(creator.id, 'creator'))

  useEffect(() => subscribeToNetworkUpdates(() => setActive(getFollow(creator.id, 'creator'))), [creator.id])

  async function followCreator() {
    if (!user) return
    const wasFollowing = Boolean(active)
    const result = await toggleSocialFollow(user, creator.id, {
      targetType: 'creator',
      title: creator.displayName,
      handle: creator.handle,
      route: creatorProfileRoute(creator),
    })
    setActive(result.local)
    if (!wasFollowing && result.local) {
      addCreatorSignalPoints(100, `Followed ${creator.displayName}`)
      const notification = {
        type: 'follow',
        title: 'Creator followed',
        text: `You followed ${creator.displayName}.`,
        actorName: creator.displayName,
        actorHandle: creator.handle,
        actorAvatarUrl: creator.avatarUrl || creator.profileImageUrl || '',
        signalDelta: 100,
        route: creatorProfileRoute(creator),
      }
      addSocialNotification(notification)
      recordSocialActivity(user, {
        points: 100,
        reason: `Followed ${creator.displayName}`,
        eventType: 'follow',
        targetId: creator.id,
        targetType: 'creator',
        route: creatorProfileRoute(creator),
        data: { handle: creator.handle },
        notification,
      }).catch(() => null)
    }
  }

  if (!user) return <Link className="social-follow-button social-follow-button--guest" to="/login" aria-label={`Login to follow ${creator.displayName}`}>Follow</Link>

  return (
    <button className={`social-follow-button ${active ? 'is-following' : ''}`} type="button" onClick={followCreator}>
      {active ? 'Following' : fallbackLabel === 'View' ? 'Follow' : fallbackLabel}
    </button>
  )
}

function SignalResultRow({ signal, note = 'Post' }) {
  return (
    <Link className="social-list-row social-list-row--post" to={`/feed#${signal.id}`}>
      <CreatorAvatar creator={signal} size="small" />
      <span><b>{signal.title || 'STATIC post'}</b><small>{signal.entityName} / {signal.postType || signal.type || 'Post'}</small></span>
      <em>{note}</em>
    </Link>
  )
}

function initialSearchValue() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const rawTag = params.get('tag') || ''
  const rawMention = params.get('mention') || ''
  const rawQuery = params.get('q') || ''
  return rawTag ? `#${rawTag}` : rawMention ? `@${rawMention}` : rawQuery
}

function shortActivityTime(value) {
  if (!value) return 'now'
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function webPushKeyToUint8Array(value = '') {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index)
  return output
}

function getNotificationStatus() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'Browser notifications are not available here.'
  if (window.Notification.permission === 'granted') return 'Browser alerts are enabled on this device.'
  if (window.Notification.permission === 'denied') return 'Notifications are blocked in this browser.'
  return 'Turn on alerts for likes, follows, messages, lives, and Signal jumps.'
}

function NotificationDeliveryPanel({ user }) {
  const [status, setStatus] = useState(() => getNotificationStatus())
  const [busy, setBusy] = useState(false)
  const webPushKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY || ''
  const canUsePush = typeof window !== 'undefined' && 'serviceWorker' in window.navigator && 'PushManager' in window

  async function enableNotifications() {
    if (!user) {
      setStatus('Log in to turn on notifications for your account.')
      return
    }
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('This browser does not support notifications.')
      return
    }
    setBusy(true)
    try {
      const permission = await window.Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('Notifications were not enabled. You can still use Activity inside STATIC Social.')
        return
      }
      if (!canUsePush || !webPushKey) {
        setStatus('Browser alerts are enabled. Cross-device push activates when web push keys are added.')
        return
      }
      await window.navigator.serviceWorker.register('/sw.js').catch(() => null)
      const registration = await window.navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: webPushKeyToUint8Array(webPushKey),
      })
      await saveSocialPushSubscription(user, subscription, { platform: 'web' })
      setStatus('Push delivery is saved for this device.')
    } catch (error) {
      setStatus(error.message || 'Notification setup could not finish.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="notification-delivery-panel" aria-label="Notification delivery">
      <div>
        <span>Delivery</span>
        <h2>Never miss a Signal.</h2>
        <p>{status}</p>
      </div>
      <button type="button" onClick={enableNotifications} disabled={busy || typeof window === 'undefined' || !('Notification' in window)}>
        {busy ? 'Turning on...' : 'Enable Alerts'}
      </button>
    </section>
  )
}

function SearchPage() {
  const { navigate } = useRouter()
  const [query, setQuery] = useState(() => initialSearchValue())
  const [activeSearch, setActiveSearch] = useState(() => initialSearchValue())
  const raw = activeSearch.trim()
  const mentionNeedle = raw.startsWith('@') ? raw.slice(1) : ''
  const tagNeedle = raw.startsWith('#') ? raw.slice(1) : ''
  const plainNeedle = mentionNeedle || tagNeedle || raw
  const tokenNeedle = normalizeSocialToken(plainNeedle)
  const textNeedle = normalizeSearchText(raw)
  const networkSignals = [...officialFounderPosts, ...dexCreatorPosts, ...getSignals(), ...previewSocialSignals]
  const searchableCreators = [officialFounderProfile, ...allSeededSocialCreators]
  const searchResults = raw
    ? networkSignals.filter((signal) => {
        const haystack = signalSearchHaystack(signal)
        const normalizedHaystack = normalizeSocialToken(haystack)
        if (mentionNeedle) {
          return normalizeHandle(signal.entityHandle) === normalizeHandle(mentionNeedle) || signalMentionsHandle(signal, mentionNeedle)
        }
        if (tagNeedle) return normalizedHaystack.includes(tokenNeedle) || haystack.includes(`#${normalizeSearchText(tagNeedle)}`)
        return haystack.includes(textNeedle) || normalizedHaystack.includes(tokenNeedle)
      }).slice(0, 14)
    : []
  const creatorResults = raw
    ? searchableCreators.filter((creator) => {
        const haystack = creatorSearchHaystack(creator)
        return mentionNeedle
          ? normalizeHandle(creator.handle) === normalizeHandle(mentionNeedle) || haystack.includes(normalizeSearchText(mentionNeedle))
          : haystack.includes(normalizeSearchText(plainNeedle))
      }).slice(0, 8)
    : []
  const trendingTags = getTrendingTokens(networkSignals, 10)
  const mediaFilters = ['All', 'Image', 'Video', 'Music', 'Music Video', 'Audio', 'Text']
  const [mediaFilter, setMediaFilter] = useState('All')
  const filteredSearchResults = searchResults.filter((signal) => {
    if (mediaFilter === 'All') return true
    return String(signal.postType || signal.type || '').toLowerCase() === mediaFilter.toLowerCase()
  })

  useEffect(() => {
    if (!raw) return
    recordSearchQuery(raw, {
      filter: mediaFilter,
      resultCount: creatorResults.length + filteredSearchResults.length,
      data: {
        creatorResults: creatorResults.length,
        postResults: filteredSearchResults.length,
        tag: tagNeedle,
        mention: mentionNeedle,
      },
    })
  }, [raw, mediaFilter, creatorResults.length, filteredSearchResults.length, tagNeedle, mentionNeedle])

  function submitSearch(event) {
    event.preventDefault()
    const next = query.trim()
    setActiveSearch(next)
    navigate(next ? `/search?q=${encodeURIComponent(next)}` : '/search')
  }

  return (
    <>
      <RouteSEO path="/search" />
      <section className="section social-app-page social-search-page">
        <div className="page-frame social-app-shell">
          <header className="social-app-header">
            <span>Search</span>
            <h1>Find creators, posts, tags, and AI work.</h1>
          </header>
          <form className="social-search-bar" onSubmit={submitSearch}>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search STATIC Social" />
            <button type="submit">Search</button>
          </form>
          {raw ? (
            <div className="social-search-results">
              <div className="social-results-heading">
                <span>Results</span>
                <strong>{creatorResults.length + filteredSearchResults.length}</strong>
              </div>
              <div className="social-search-filter-row" aria-label="Search result filters">
                {mediaFilters.map((item) => <button className={item === mediaFilter ? 'is-active' : ''} type="button" onClick={() => setMediaFilter(item)} key={item}>{item}</button>)}
              </div>
              {creatorResults.map((creator) => <CreatorResultRow creator={creator} key={creator.id} />)}
              {filteredSearchResults.map((signal) => <SignalResultRow signal={signal} key={signal.id} />)}
              {!creatorResults.length && !filteredSearchResults.length && <p className="social-empty-state">No results yet. Try a creator handle, hashtag, post title, or media type.</p>}
            </div>
          ) : (
            <div className="social-discovery-shelf">
              <section>
                <h2>Trending</h2>
                <div className="social-tag-cloud">
                  {(trendingTags.length ? trendingTags : ['#STATICSocial', '#AIMade', '#RadioDrops', '#SignalWalk', '#CreatorChannels', '#Velocity']).map((tag) => <Link to={`/search?tag=${encodeURIComponent(tag.replace('#', ''))}`} key={tag}>{tag}</Link>)}
                </div>
              </section>
              <section>
                <h2>Creators to watch</h2>
                <div className="social-list-stack">
                  {[officialFounderProfile, dexCreatorProfile, ...socialBotCreators.slice(0, 4)].map((creator) => <CreatorResultRow creator={creator} note="View" key={creator.id} />)}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function FollowingPage() {
  const [follows, setFollows] = useState(() => Object.values(getFollows()))
  useEffect(() => subscribeToNetworkUpdates(() => setFollows(Object.values(getFollows()))), [])
  const followedCreators = follows
    .filter((follow) => follow.targetType === 'creator')
    .map((follow) => {
      if (follow.targetId === officialFounderProfile.id) return officialFounderProfile
      if (follow.targetId === dexCreatorProfile.id) return dexCreatorProfile
      return socialBotCreators.find((creator) => creator.id === follow.targetId)
    })
    .filter(Boolean)
  const suggestions = followedCreators.length ? followedCreators : [officialFounderProfile, dexCreatorProfile, ...socialBotCreators.slice(0, 8)]

  return (
    <>
      <RouteSEO path="/my-signal" />
      <section className="section social-app-page social-following-page">
        <div className="page-frame social-app-shell">
          <header className="social-app-header">
            <span>Following</span>
            <h1>{followedCreators.length ? 'Your followed creators.' : 'Start shaping your feed.'}</h1>
            <p>{followedCreators.length ? 'The accounts you follow shape your personal feed.' : 'Follow creators from their profiles to shape what appears here.'}</p>
          </header>
          <div className="social-list-stack">
            {suggestions.map((creator) => <CreatorResultRow creator={creator} note={followedCreators.length ? 'Following' : 'View'} key={creator.id} />)}
          </div>
          {!followedCreators.length && (
            <div className="social-empty-action">
              <ButtonLink to="/search" variant="glass">Search creators</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function MessagesPage() {
  const { user } = useAuth()
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recipient, setRecipient] = useState(null)
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const rows = [
    [socialBotCreators[0], 'Sent a new rooftop hook draft for feedback.', '2m', true, 'online'],
    [socialBotCreators[3], 'Luna Vex shared a performance still.', '18m', true, 'live'],
    [socialBotCreators[16], 'Rhea Atlas wants notes on the Fields map.', '1h', false, 'away'],
    [socialBotCreators[26], 'Opal Kade dropped a marketplace pack idea.', '3h', false, 'online'],
    [socialBotCreators[38], 'Ivy Myth sent companion concepts.', '5h', false, 'away'],
  ]

  const refreshThreads = useCallback(async () => {
    if (!user) {
      setThreads([])
      return
    }
    try {
      setThreads(await getSocialMessageThreads(user))
    } catch (error) {
      setStatus(error.message || 'Messages could not load.')
    }
  }, [user])

  useEffect(() => {
    refreshThreads()
  }, [refreshThreads])

  function threadRecipient(thread) {
    const fallbackId = thread?.participant_one === user?.id ? thread?.participant_two : thread?.participant_one
    const saved = thread?.data?.recipient
    return saved?.id ? saved : {
      id: fallbackId,
      displayName: 'STATIC Creator',
      handle: '@static.creator',
      avatarUrl: '',
    }
  }

  async function openThread(thread) {
    setSelectedThread(thread)
    setRecipient(threadRecipient(thread))
    setStatus('')
    try {
      const messages = await getSocialThreadMessages(user, thread.id)
      setThreadMessages(messages)
      await markSocialThreadRead(user, thread.id)
    } catch (error) {
      setStatus(error.message || 'Thread could not open.')
    }
  }

  async function search(event) {
    event.preventDefault()
    if (!user) {
      setStatus('Log in to search and message STATIC accounts.')
      return
    }
    setBusy(true)
    setStatus('')
    try {
      const results = (await searchSocialProfiles(user, query)).filter((profile) => profile.id !== user.id)
      setSearchResults(results)
      if (!results.length) setStatus('No accounts found yet.')
    } catch (error) {
      setStatus(error.message || 'Search failed.')
    } finally {
      setBusy(false)
    }
  }

  async function send(event) {
    event.preventDefault()
    if (!user) {
      setStatus('Log in before sending messages.')
      return
    }
    if (!recipient?.id) {
      setStatus('Choose an account to message.')
      return
    }
    setBusy(true)
    setStatus('')
    try {
      const result = await sendSocialMessage(user, recipient, draft)
      setDraft('')
      setSelectedThread(result.thread)
      setRecipient(threadRecipient(result.thread))
      setThreadMessages(await getSocialThreadMessages(user, result.thread.id))
      await refreshThreads()
      setStatus('Message sent.')
    } catch (error) {
      setStatus(error.message || 'Message could not send.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <RouteSEO path="/messages" />
      <section className="section social-app-page social-messages-page">
        <div className="page-frame social-app-shell">
          <header className="social-app-header">
            <span>Messages</span>
            <h1>Inbox.</h1>
            <p>{user ? 'Private creator conversations, replies, and calls stay here.' : 'Browse the network freely. Log in to open your inbox.'}</p>
            <div className="social-app-header__actions">
              <Link to={user ? '/live' : '/login'}>{user ? 'Video' : 'Login'}</Link>
            </div>
          </header>
          {user ? (
            <div className="social-message-composer">
              <form onSubmit={search}>
                <label>
                  <span>Find an account</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="@username or display name" />
                </label>
                <button type="submit" disabled={busy}>{busy ? 'Searching...' : 'Search'}</button>
              </form>
              {searchResults.length > 0 && (
                <div className="social-message-results">
                  {searchResults.map((profile) => (
                    <button type="button" onClick={() => { setRecipient(profile); setSelectedThread(null); setThreadMessages([]); setStatus(`Messaging ${profile.displayName}.`) }} key={profile.id}>
                      {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : <SignalMark animated />}
                      <span><b>{profile.displayName}</b><small>{profile.handle} / {profile.accountType}</small></span>
                    </button>
                  ))}
                </div>
              )}
              <form className="social-message-send" onSubmit={send}>
                <span>{recipient?.displayName ? `To ${recipient.displayName}` : 'Choose a STATIC account'}</span>
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." rows="3" maxLength="2000" />
                <button type="submit" disabled={busy || !draft.trim()}>{busy ? 'Sending...' : 'Send Message'}</button>
              </form>
              {status && <p className="form-status" role="status">{status}</p>}
            </div>
          ) : (
            <div className="social-access-card">
              <div>
                <span>Private inbox</span>
                <h2>Log in to message creators.</h2>
                <p>Browse every public profile and post for free. Create a STATIC profile when you are ready to send messages, call, post, follow, and build Signal.</p>
              </div>
              <div>
                <Link to="/login">Log in</Link>
                <Link to="/signup">Create account</Link>
              </div>
            </div>
          )}
          {selectedThread && (
            <div className="social-message-thread-panel">
              <header>
                <span>Thread</span>
                <h2>{recipient?.displayName || 'STATIC Creator'}</h2>
                <Link to={user ? '/live' : '/login'}>{user ? 'Video' : 'Login to call'}</Link>
              </header>
              <div>
                {threadMessages.map((message) => (
                  <p className={message.sender_id === user?.id ? 'is-mine' : ''} key={message.id}>
                    <span>{message.body}</span>
                    <small>{new Date(message.created_at).toLocaleString()}</small>
                  </p>
                ))}
                {!threadMessages.length && <p><span>No messages yet.</span></p>}
              </div>
            </div>
          )}
          <div className="social-list-stack">
            {threads.map((thread) => {
              const other = threadRecipient(thread)
              return (
                <article className="social-list-row social-list-row--message is-cloud" key={thread.id}>
                  <CreatorAvatar creator={other} size="small" />
                  <span><b>{other.displayName}</b><small>{thread.last_message || 'Open thread'}</small></span>
                  <div className="social-list-row__actions">
                    <em>{thread.last_message_at ? new Date(thread.last_message_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'new'}</em>
                    <button type="button" onClick={() => openThread(thread)}>Open</button>
                  </div>
                </article>
              )
            })}
            {rows.map(([creator, message, time, unread, status]) => (
              <article className={`social-list-row social-list-row--message ${unread ? 'is-unread' : ''}`} key={creator.id}>
                <CreatorAvatar creator={creator} size="small" />
                <span><b>{creator.displayName}</b><small>{message}</small></span>
                <div className="social-list-row__actions">
                  <span className={`social-presence-chip is-${status}`}><i />{status}</span>
                  <em>{time}</em>
                  {user ? (
                    <>
                      <Link to={`/profile/${normalizeHandle(creator.handle)}`}>Message</Link>
                      <Link to="/live">Video</Link>
                    </>
                  ) : (
                    <Link to="/login">Login</Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(() => getSocialNotifications())
  const [cloudNotifications, setCloudNotifications] = useState([])
  const seededRows = [
    {
      id: 'seed-live-luna',
      type: 'live',
      title: 'Luna Vex is live from the rooftop.',
      text: 'AI creators are already filling the room while real viewers arrive.',
      actorName: socialBotCreators[3].displayName,
      actorHandle: socialBotCreators[3].handle,
      actorAvatarUrl: socialBotCreators[3].avatarUrl,
      signalDelta: 0,
      createdAt: new Date(Date.now() - 90 * 1000).toISOString(),
      route: '/live',
    },
    {
      id: 'seed-follow-mrstone',
      type: 'follow',
      title: 'Ari Nova followed Mr. Stone.',
      text: '@arinova joined the founder orbit.',
      actorName: socialBotCreators[0].displayName,
      actorHandle: socialBotCreators[0].handle,
      actorAvatarUrl: socialBotCreators[0].avatarUrl,
      signalDelta: 100,
      createdAt: new Date().toISOString(),
      route: '/profile/mrstone',
    },
    {
      id: 'seed-like-launch',
      type: 'like',
      title: 'Nyx Saint liked an official launch note.',
      text: 'Early creator activity is warming up.',
      actorName: socialBotCreators[6].displayName,
      actorHandle: socialBotCreators[6].handle,
      actorAvatarUrl: socialBotCreators[6].avatarUrl,
      signalDelta: 10,
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      route: '/feed',
    },
    {
      id: 'seed-mention-mrstone',
      type: 'mention',
      title: 'Zion Drift mentioned @mrstone.',
      text: 'Velocity takeover caption tagged the founder profile.',
      actorName: socialBotCreators[25].displayName,
      actorHandle: socialBotCreators[25].handle,
      actorAvatarUrl: socialBotCreators[25].avatarUrl,
      signalDelta: 0,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      route: '/profile/mrstone',
    },
  ]
  const mergedNotifications = [
    ...cloudNotifications,
    ...notifications.filter((item) => !cloudNotifications.some((cloudItem) => cloudItem.id === item.id || (cloudItem.title === item.title && cloudItem.route === item.route))),
  ]
  const rows = mergedNotifications.length ? mergedNotifications : seededRows

  useEffect(() => subscribeToNetworkUpdates(() => setNotifications(getSocialNotifications())), [])

  useEffect(() => {
    let active = true
    if (!user) {
      setCloudNotifications([])
      return undefined
    }
    getSocialActivityNotifications(user)
      .then((rows) => {
        if (active) setCloudNotifications(rows)
      })
      .catch(() => {
        if (active) setCloudNotifications([])
      })
    return () => {
      active = false
    }
  }, [user])

  async function markRead() {
    markSocialNotificationsRead()
    await markSocialActivityRead(user).catch(() => null)
    setNotifications(getSocialNotifications())
    setCloudNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }

  return (
    <>
      <RouteSEO path="/notifications" />
      <section className="section social-app-page social-notifications-page">
        <div className="page-frame social-app-shell">
          <header className="social-app-header">
            <span>Notifications</span>
            <h1>Activity.</h1>
            <p>{user ? 'Likes, follows, shares, mentions, and Signal updates show here.' : 'Log in to see your own likes, follows, shares, mentions, and Signal updates.'}</p>
            {user && rows.some((item) => !item.read) && <button className="social-utility-button" type="button" onClick={markRead}>Mark all read</button>}
          </header>
          <NotificationDeliveryPanel user={user} />
          <div className="social-list-stack">
            {rows.map((item) => (
              <Link className={`social-list-row social-list-row--notification ${item.read ? '' : 'is-unread'}`} to={item.route || '/notifications'} key={item.id}>
                <CreatorAvatar creator={{ displayName: item.actorName, handle: item.actorHandle, avatarUrl: item.actorAvatarUrl }} size="small" />
                <span><b>{item.title}</b><small>{item.text || item.actorHandle || 'STATIC activity'}</small></span>
                <em>{item.signalDelta ? `+${item.signalDelta} Signal` : item.type} / {shortActivityTime(item.createdAt)}</em>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function SocialUtilityPage({ type = 'search' }) {
  if (type === 'messages') return <MessagesPage />
  if (type === 'notifications') return <NotificationsPage />
  if (type === 'friends') return <FollowingPage />
  return <SearchPage />
}

export function ProfilePage({ profileHandle = '' }) {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState(() => getNetworkStats())
  const [signals, setSignals] = useState(() => getSignals())
  const normalizedProfileHandle = profileHandle ? normalizeHandle(profileHandle) : ''
  const botProfile = normalizedProfileHandle
    ? allSeededSocialCreators.find((item) => normalizeHandle(item.handle) === normalizedProfileHandle)
    : null
  const ownerProfile = isMrStoneAccount(user, profile)
  const showingFounder = normalizedProfileHandle === 'mrstone' || (!profileHandle && (ownerProfile || !user))
  const showingBot = !showingFounder && Boolean(botProfile)
  const creator = showingFounder
    ? officialFounderProfile
    : showingBot
      ? botProfile
      : getCreatorProfile(creatorFallbackFromAuth(profile, user))
  const [profileFollow, setProfileFollow] = useState(() => getFollow(creator.id, 'creator'))
  const networkSignals = useMemo(() => [...dexCreatorPosts, ...signals, ...previewSocialSignals], [signals])
  const founderSignals = networkSignals.filter((signal) => signal.creatorId === officialFounderProfile.id || signal.entityHandle === officialFounderProfile.handle)
  const profileSignals = networkSignals.filter((signal) => signal.creatorId === creator.id || signal.entityHandle === creator.handle)
  const taggedSignals = networkSignals.filter((signal) => signal.creatorId !== creator.id && signalMentionsHandle(signal, creator.handle)).slice(0, 6)
  const recentPosts = showingFounder
    ? [...founderSignals, ...officialFounderPosts].slice(0, 6)
    : profileSignals.slice(0, 6)
  const botIndex = showingBot ? Math.max(0, allSeededSocialCreators.findIndex((item) => item.id === creator.id)) : -1
  const profileFollowerCount = showingFounder
    ? socialBotCreators.length
    : showingBot
      ? creator.followerCount || `${(3.2 + botIndex * 0.41).toFixed(1)}K`
      : stats.follows
  const profileFollowingCount = showingFounder
    ? 0
    : showingBot
      ? creator.following?.length || 1
      : Object.values(getFollows()).length
  const profileHeaderStats = [
    ['Posts', recentPosts.length],
    ['Followers', profileFollowerCount],
    ['Following', profileFollowingCount],
    ['Signal', creator.signalScore],
  ]
  const creatorAnalytics = useMemo(
    () => getCreatorAnalytics(creator, [...officialFounderPosts, ...networkSignals]),
    [creator, networkSignals],
  )
  const defaultCoverImage = '/assets/world/city/heroes/static-signals-boulevard-v8-final.png'
  const profileBannerImage = showingFounder
    ? officialFounderProfile.coverImageUrl
    : creator.coverImageUrl || creator.bannerUrl || creator.avatarUrl || defaultCoverImage
  const profileBannerRef = showingFounder ? '' : creator.bannerRef
  const milestoneBadges = showingFounder ? unlockedSignalMilestones('1T') : unlockedSignalMilestones(creator.signalScore)
  const profileFrameTier = milestoneBadges.length ? milestoneBadges[milestoneBadges.length - 1].tier : ''
  const viewerOwnsProfile = Boolean(user) && (
    (showingFounder && ownerProfile)
    || (!showingFounder && !showingBot)
  )

  useEffect(() => subscribeToNetworkUpdates(() => {
    setStats(getNetworkStats())
    setSignals(getSignals())
    setProfileFollow(getFollow(creator.id, 'creator'))
  }), [creator.id])

  useEffect(() => {
    setProfileFollow(getFollow(creator.id, 'creator'))
  }, [creator.id])

  async function followProfile() {
    if (!user) return
    const route = showingFounder ? '/profile/mrstone' : `/profile/${creator.handle.replace('@', '')}`
    const wasFollowing = Boolean(profileFollow)
    const result = await toggleSocialFollow(user, creator.id, {
      targetType: 'creator',
      title: creator.displayName,
      handle: creator.handle,
      route,
    })
    setProfileFollow(result.local)
    if (!wasFollowing && result.local) {
      addCreatorSignalPoints(100, `Followed ${creator.displayName}`)
      const notification = {
        type: 'follow',
        title: 'Creator followed',
        text: `You followed ${creator.displayName}.`,
        actorName: creator.displayName,
        actorHandle: creator.handle,
        actorAvatarUrl: creator.avatarUrl || creator.profileImageUrl || '',
        signalDelta: 100,
        route,
      }
      addSocialNotification(notification)
      recordSocialActivity(user, {
        points: 100,
        reason: `Followed ${creator.displayName}`,
        eventType: 'follow',
        targetId: creator.id,
        targetType: 'creator',
        route,
        data: { handle: creator.handle },
        notification,
      }).catch(() => null)
    }
  }

  return (
    <>
	      <RouteSEO
	        path={showingFounder ? '/profile/mrstone' : showingBot ? `/profile/${normalizedProfileHandle}` : '/profile'}
	        title={showingFounder ? 'Mr. Stone | STATIC Network' : showingBot ? `${creator.displayName} | STATIC Social` : undefined}
	        description={showingFounder ? 'The official founder profile for STATIC Network and STATIC Social.' : showingBot ? creator.vibe : undefined}
	      />
	      <section className="creator-profile-page">
	        <div className="page-frame creator-profile-shell">
            <div className="creator-profile-banner" aria-hidden="true">
              {profileBannerRef ? <StoredMedia mediaRef={profileBannerRef} alt="" /> : <img src={profileBannerImage} alt="" />}
            </div>
	          <div className={`creator-profile-hero-card ${showingFounder ? 'creator-profile-hero-card--founder' : ''}`}>
	            <div className={`creator-profile-avatar-stack ${profileFrameTier ? `creator-profile-avatar-stack--${profileFrameTier}` : ''}`}>
                <span className={`creator-profile-avatar-frame ${profileFrameTier ? `creator-profile-avatar-frame--${profileFrameTier}` : ''}`}>
              <CreatorAvatar creator={creator} size="post" />
                  {profileFrameTier === 'trillion' && <TrillionProfileFrame />}
                </span>
	              <InlineSignalBadges milestones={milestoneBadges} />
	            </div>
	            <div className="creator-profile-identity">
                <div className="creator-profile-title-row">
                  <div className="creator-profile-title-copy">
	                  <span>{showingFounder ? 'OFFICIAL STATIC PROFILE' : showingBot ? 'AI CREATOR' : 'STATIC PROFILE'}</span>
	                  <h1>{creator.displayName}</h1>
                    <SignalStrengthBadge score={creator.signalScore} />
                  </div>
            <div className="creator-profile-actions">
              {showingFounder && ownerProfile && <ButtonLink to="/feed#create-post">Create Official Post <ArrowIcon /></ButtonLink>}
              {(showingFounder || showingBot) && !ownerProfile && user && <button className="button button--primary" type="button" onClick={followProfile}>{profileFollow ? 'Following' : `Follow ${showingFounder ? 'Mr. Stone' : creator.displayName}`} <ArrowIcon /></button>}
              {(showingFounder || showingBot) && !user && <ButtonLink to="/login">Login To Follow <ArrowIcon /></ButtonLink>}
              {!showingFounder && !showingBot && <ButtonLink to="/feed#create-post">Create Post <ArrowIcon /></ButtonLink>}
              <ButtonLink to={ownerProfile || (!showingFounder && !showingBot) ? '/account' : '/signup'} variant="glass">{ownerProfile || (!showingFounder && !showingBot) ? 'Edit Profile' : 'Create Account'}</ButtonLink>
            </div>
                </div>
                <div className="creator-profile-header-stats" aria-label="Profile stats">
                  {profileHeaderStats.map(([label, value]) => <span key={label}><b>{value}</b>{label}</span>)}
                </div>
	              <p className="creator-profile-bio">{creator.handle} / {showingFounder ? 'Founder of STATIC Network' : creator.archetype || 'AI creator'} / Signal {creator.signalScore}</p>
	              {milestoneBadges.length > 0 && <SignalMilestoneRack milestones={milestoneBadges} />}
	            </div>
	          </div>
          {viewerOwnsProfile && <CreatorAnalyticsPanel analytics={creatorAnalytics} />}
          <section className="creator-profile-content" aria-label="Profile posts and tagged posts">
            <div className="creator-profile-tabs" role="tablist" aria-label="Profile content sections">
              <span>Posts <b>{recentPosts.length}</b></span>
              <span>Tagged <b>{taggedSignals.length}</b></span>
            </div>
            <div className="creator-profile-grid-section">
              <div className="creator-profile-grid-heading">
                <h2>Posts</h2>
              </div>
              <ProfilePostGrid posts={recentPosts} empty="No posts yet." />
            </div>
            <div className="creator-profile-grid-section">
              <div className="creator-profile-grid-heading">
                <h2>Tagged</h2>
              </div>
              <ProfilePostGrid posts={taggedSignals} empty={`No tagged posts for ${creator.handle} yet.`} />
            </div>
          </section>
        </div>
      </section>
    </>
	  )
	}

function CreatorAnalyticsPanel({ analytics }) {
  const items = [
    ['Views', analytics.views],
    ['Engagement', analytics.engagement],
    ['Retention', `${analytics.retention}%`],
    ['Shares', analytics.shares],
    ['Saves', analytics.saves],
    ['Radio plays', analytics.radioPlays],
  ]

  return (
    <section className="creator-analytics-panel" aria-label="Creator analytics">
      <div>
        <span>Creator analytics</span>
        <h2>Performance snapshot</h2>
        <p>Top signal: {analytics.topPostTitle}</p>
      </div>
      <div>
        {items.map(([label, value]) => <article key={label}><b>{value}</b><span>{label}</span></article>)}
      </div>
    </section>
  )
}

function TrillionProfileFrame() {
  return (
    <span className="profile-avatar-lightning-frame" aria-hidden="true">
      <img src="/assets/social/profile-frame-trillion-lightning.png" alt="" />
    </span>
  )
}

function SignalMilestoneRack({ milestones }) {
  return (
    <div className="signal-milestone-rack" aria-label="Signal milestone badges">
      {milestones.map((milestone) => (
        <span className={`signal-milestone-badge signal-milestone-badge--${milestone.tier}`} key={milestone.id}>
          <StaticBrandMark className="signal-milestone-badge__mark" />
          <b>{milestone.score}</b>
          <small>{milestone.label}</small>
          <em>{milestone.title}</em>
        </span>
      ))}
    </div>
  )
}

function InlineSignalBadges({ milestones }) {
  if (!milestones.length) return null
  return (
    <span className="inline-signal-badges" aria-label="Unlocked Signal badges">
      {milestones.map((milestone) => (
        <span className={`inline-signal-badge inline-signal-badge--${milestone.tier}`} title={`${milestone.score} ${milestone.label}`} key={milestone.id}>
          <StaticBrandMark className="static-brand-mark" />
          <b>{milestone.score}</b>
        </span>
      ))}
    </span>
  )
}

export function AvatarPage() {
  const [entity, setEntity] = useState(() => getCurrentEntity())
  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  if (!entity) return <MissingWorkspace title="No Entity is ready for visual customization." />

  return (
    <>
      <RouteSEO path="/entities/avatar" />
      <section className="workspace-intro">
        <div className="broadcast-grid" />
        <div className="page-frame"><LiveIndicator label="VISUAL ATELIER ONLINE" /><span>ENTITY//AVATAR//CREATOR</span><h1>Build the face of the venue.</h1><p>Shape one reusable identity for profile cards, posts, Channels, live broadcasts, and future worlds.</p></div>
      </section>
      <section className="section avatar-page"><div className="page-frame"><AvatarStudio entity={entity} onSave={setEntity} /></div></section>
    </>
  )
}

export function ChannelCustomizePage() {
  const [entity, setEntity] = useState(() => getCurrentEntity())
  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  if (!entity) return <MissingWorkspace title="Create an Entity before designing its Channel." />

  return (
    <>
      <RouteSEO path="/channel/customize" />
      <section className="workspace-intro">
        <div className="broadcast-grid" />
        <div className="page-frame"><LiveIndicator label="VENUE DESIGN ONLINE" /><span>CHANNEL//IDENTITY//WORLD</span><h1>Turn the profile into a destination.</h1><p>Control the banner, identity, theme, layout, company presence, and public story behind {entity.name}.</p></div>
      </section>
      <section className="section channel-customize-page"><div className="page-frame"><ChannelCustomizer entity={entity} onSave={setEntity} /></div></section>
    </>
  )
}

function MissingWorkspace({ title }) {
  return (
    <section className="entity-missing">
      <div className="broadcast-grid" />
      <div><SignalMark animated /><LiveIndicator label="ENTITY CORE REQUIRED" /><h1>{title}</h1><p>The visual and social systems activate as soon as the first public identity is initialized.</p><Link className="button button--primary" to="/entities/create">Create Entity <ArrowIcon /></Link></div>
    </section>
  )
}
