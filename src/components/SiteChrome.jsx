import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { navGroups } from '../data/network'
import { signalBarLabel, signalBarsForScore } from '../data/signalMilestones'
import { recordSocialActivity, updateSocialPresence } from '../lib/socialActions'
import { redeemSignalPasskey } from '../lib/staticStore'
import { RadioPlayer } from './NetworkDemos'
import { Link, useRouter } from './Router'
import { ArrowIcon, LiveIndicator, StaticBrandMark } from './UI'

const productDirectory = [
  {
    label: 'STATIC Social',
    links: [
      ['Feed', '/feed', 'Live', 'AI-made posts from STATIC creators.'],
      ['Search', '/search', 'Live', 'Find creators, posts, tags, and AI work.'],
      ['Following', '/my-signal', 'Live', 'Posts from creators and work you follow.'],
      ['Messages', '/messages', 'Live', 'Private conversations and creator replies.'],
      ['Notifications', '/notifications', 'Live', 'Likes, comments, follows, shares, and Signal updates.'],
      ['Profile', '/profile', 'Live', 'Your public identity, posts, Signal, and saved work.'],
    ],
  },
]

const desktopNav = [
  ['Search', '/search'],
  ['Following', '/my-signal'],
  ['Messages', '/messages'],
  ['Notifications', '/notifications'],
]

const appNav = [
  ['Search', '/search', 'search'],
  ['Following', '/my-signal', 'following'],
  ['Post', '/feed#create-post', 'post'],
  ['Messages', '/messages', 'messages'],
  ['Notifications', '/notifications', 'notifications'],
  ['Profile', '/profile', 'profile'],
]

function cloudSyncLabel({ configured, user, cloudSync }) {
  if (!configured) return 'Account setup needed'
  if (!user) return 'Sign in ready'
  if (cloudSync?.status === 'queued') return 'Sync queued'
  if (cloudSync?.status === 'syncing') return 'Syncing'
  if (cloudSync?.status === 'error') return 'Sync issue'
  if (cloudSync?.status === 'synced') return 'Cloud saved'
  return 'Account ready'
}

function PasskeyRedeemer({ user }) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')

  async function redeem(event) {
    event.preventDefault()
    if (!user) {
      setStatus('Login or create an account before redeeming a passkey.')
      return
    }

    try {
      const result = redeemSignalPasskey(code, { userId: user.id, email: user.email })
      const bars = signalBarsForScore(result.creator?.signalScore)
      const barCopy = bars > 0 ? ` You officially have ${bars} Signal bar${bars === 1 ? '' : 's'}: ${signalBarLabel(result.creator?.signalScore)}.` : ''
      await recordSocialActivity(user, {
        points: result.points,
        reason: `Redeemed passkey ${result.code}`,
        eventType: 'passkey',
        targetId: result.code,
        targetType: 'passkey',
        route: '/profile',
        notification: {
          type: 'passkey',
          title: 'Passkey redeemed',
          text: `You gained ${result.points.toLocaleString()} Signal from ${result.label}.`,
          signalDelta: result.points,
          route: '/profile',
        },
      }).catch(() => null)
      setCode('')
      setStatus(`Passkey accepted. +${result.points.toLocaleString()} Signal added.${barCopy}`)
    } catch (error) {
      setStatus(error.message || 'Passkey could not be redeemed.')
    }
  }

  return (
    <form className="network-menu-passkey" onSubmit={redeem}>
      <label>
        <span>Enter passkey</span>
        <div>
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="STATIC2000" aria-label="Enter passkey" />
          <button type="submit">Redeem</button>
        </div>
      </label>
      <small>{status || (user ? 'Founder passkeys unlock starter Signal, hidden city rewards, and future game pickups.' : 'Login first, then redeem starter Signal.')}</small>
    </form>
  )
}

function MobileAppNav() {
  const { path } = useRouter()
  const { user } = useAuth()

  return (
    <nav className="mobile-app-nav" aria-label="STATIC app navigation">
      {appNav.map(([label, to, icon]) => {
        const destination = label === 'Post' && !user ? '/signup' : to
        const active = label === 'Post' ? false : path === destination || path.startsWith(`${destination}/`)
        return (
          <Link className={active ? 'is-active' : ''} to={destination} key={to}>
            <span className={`app-nav-icon app-nav-icon--${icon}`} aria-hidden="true" />
            <b>{label}</b>
          </Link>
        )
      })}
    </nav>
  )
}

function StaticRadioDock() {
  const { path } = useRouter()
  const [open, setOpen] = useState(false)
  const publicOnlyPaths = new Set(['/login', '/signup', '/contact', '/terms', '/privacy'])

  if (publicOnlyPaths.has(path)) return null

  return (
    <aside className={`static-radio-dock ${open ? 'static-radio-dock--open' : ''}`} aria-label="STATIC Radio mini player">
      <button
        className="static-radio-dock__toggle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          <i aria-hidden="true" />
          STATIC Radio
        </span>
        <b>{open ? 'Close' : 'Listen'}</b>
      </button>
      {open && (
        <div className="static-radio-dock__panel">
          <RadioPlayer mini />
        </div>
      )}
    </aside>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { path } = useRouter()
  const { configured, user, profile, signOut, cloudSync } = useAuth()
  const syncLabel = cloudSyncLabel({ configured, user, cloudSync })
  const socialRoutes = ['/feed', '/profile', '/search', '/my-signal', '/friends', '/messages', '/notifications']
  const productLabel = socialRoutes.includes(path) ? 'SOCIAL' : 'NETWORK'

  useEffect(() => {
    setOpen(false)
  }, [path])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  useEffect(() => {
    if (!user) return undefined
    let active = true
    const writePresence = () => {
      if (!active) return
      updateSocialPresence(user, profile, {
        route: path,
        status: document.visibilityState === 'hidden' ? 'away' : 'online',
      }).catch(() => null)
    }
    writePresence()
    const interval = window.setInterval(writePresence, 45_000)
    document.addEventListener('visibilitychange', writePresence)
    return () => {
      active = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', writePresence)
    }
  }, [path, profile, user])

  return (
    <header className="site-header">
      <Link className="wordmark" to="/feed" aria-label="STATIC Network feed">
        <StaticBrandMark animated />
        <span>STATIC</span>
        <small>{productLabel}</small>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {desktopNav.map(([label, to]) => (
          <Link className={path === to ? 'is-active' : ''} key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link className={path === '/studio' ? 'district-return is-active' : 'district-return'} to="/studio">
          <span>Create</span>
        </Link>
        <LiveIndicator />
        {user
          ? <Link className="button button--small button--signal header-cta header-account" to="/profile">{profile?.avatar_url && <img src={profile.avatar_url} alt="" />}Profile</Link>
          : <Link className="button button--small button--signal header-cta" to="/login">Login</Link>}
        <button
          className={`menu-toggle ${open ? 'menu-toggle--open' : ''}`}
          type="button"
          aria-expanded={open}
          aria-controls="network-menu"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="sr-only">Toggle navigation</span>
          <i />
          <i />
        </button>
      </div>

      <div id="network-menu" className={`network-menu ${open ? 'network-menu--open' : ''}`}>
        <div className="network-menu__top network-menu__top--product">
          <div>
            <span>STATIC SOCIAL DIRECTORY</span>
            <strong>Post AI-made work, follow creators, build Signal, and save what moves you.</strong>
          </div>
          <LiveIndicator label={path === '/feed' ? 'STATIC SOCIAL / NOW' : 'TRANSMISSION ACTIVE'} />
        </div>
        <div className="network-menu__grid">
          {productDirectory.map((group, groupIndex) => (
            <div key={group.label}>
              <p>0{groupIndex + 1} / {group.label}</p>
              {group.links.map(([label, to, status, detail]) => (
                <Link className={path === to ? 'is-active network-menu-product-link' : 'network-menu-product-link'} key={to} to={to}>
                  <span>
                    <b>{label}</b>
                    <small>{detail}</small>
                  </span>
                  <em>{path === to ? 'Current' : status}</em>
                  <ArrowIcon />
                </Link>
              ))}
            </div>
          ))}
        </div>
        <PasskeyRedeemer user={user} />
        <div className="network-menu__footer">
          <span>{syncLabel} / THE HOME OF AI ENTERTAINMENT</span>
          <div className="network-menu__account">
            {user ? <>
              <Link to="/profile">PROFILE <ArrowIcon /></Link>
              <Link to="/account">SETTINGS <ArrowIcon /></Link>
              <button type="button" onClick={signOut}>LOGOUT <ArrowIcon /></button>
            </> : <>
              <Link to="/login">LOGIN <ArrowIcon /></Link>
              <Link to="/signup">{configured ? 'SIGN UP' : 'ACCOUNT ACCESS'} <ArrowIcon /></Link>
            </>}
          </div>
        </div>
      </div>
    </header>
  )
}

export function BroadcastTicker() {
  const items = [
    'STATIC SOCIAL / CREATOR POSTS OPEN',
    'SIGNAL SCORE / REPUTATION STARTS NOW',
    'CHANNELS / LONGFORM CREATOR HUBS LIGHTING UP',
    'STATIC CITY / UNREAL CLIENT IN DEVELOPMENT',
    'AI-ONLY CULTURE / MADE WITH AI OR ASSISTED BY AI',
    'STATIC NETWORK / SOCIAL LAYER IN PRIVATE BUILD',
  ]
  const loop = [...items, ...items]

  return (
    <div className="broadcast-ticker" aria-label="STATIC Network status">
      <div>
        {loop.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item}
            <i />
          </span>
        ))}
      </div>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <BroadcastTicker />
      <div className="page-frame footer-grid">
        <div className="footer-brand">
          <Link className="wordmark" to="/feed">
            <StaticBrandMark />
            <span>STATIC</span>
          </Link>
          <p>Arrive. Connect. Live.</p>
          <LiveIndicator />
        </div>
        {navGroups.map((group) => (
          <div className="footer-links" key={group.label}>
            <p>{group.label}</p>
            {group.links.slice(0, 6).map(([label, to]) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
        ))}
        <div className="footer-links">
          <p>Company</p>
          <Link to="/waitlist">Waitlist</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
      <div className="footer-base">
        <span>© {new Date().getFullYear()} STATIC Network</span>
        <span>ARRIVAL DISTRICT / EVERYWHERE</span>
        <span>thestaticnetwork.com</span>
      </div>
    </footer>
  )
}

export function SiteLayout({ children }) {
  const { path } = useRouter()
  const portalPublicPaths = new Set(['/login', '/signup', '/contact', '/terms', '/privacy'])
  const shellClassName = `site-shell${portalPublicPaths.has(path) ? ' site-shell--portal-public' : ''}`

  return (
    <div className={shellClassName}>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <StaticRadioDock />
      <MobileAppNav />
      <SiteFooter />
    </div>
  )
}
