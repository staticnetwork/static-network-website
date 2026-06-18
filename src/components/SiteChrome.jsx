import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { navGroups } from '../data/network'
import { Link, useRouter } from './Router'
import { ArrowIcon, LiveIndicator, SignalMark } from './UI'
import SageSystem from './sage/SageSystem'

const desktopNav = [
  ['Discover', '/discover'],
  ['Feed', '/feed'],
  ['My Signal', '/my-signal'],
  ['Entities', '/entities'],
  ['Signals', '/signals'],
  ['Channels', '/channels'],
  ['Radio', '/radio'],
  ['Play', '/play'],
  ['Live', '/live'],
  ['Studio', '/studio'],
  ['Marketplace', '/marketplace'],
]

const appNav = [
  ['District', '/', '◇'],
  ['My Signal', '/my-signal', '◌'],
  ['Create', '/entities/create', '+'],
  ['Studio', '/studio', '▣'],
  ['Account', '/account', '◎'],
]

function cloudSyncLabel({ configured, user, cloudSync }) {
  if (!configured) return 'Local only'
  if (!user) return 'Cloud login'
  if (cloudSync?.status === 'queued') return 'Sync queued'
  if (cloudSync?.status === 'syncing') return 'Syncing'
  if (cloudSync?.status === 'error') return 'Sync issue'
  if (cloudSync?.status === 'synced') return 'Cloud saved'
  return 'Cloud ready'
}

function MobileAppNav() {
  const { path } = useRouter()

  return (
    <nav className="mobile-app-nav" aria-label="STATIC app navigation">
      {appNav.map(([label, to, icon]) => {
        const active = to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`)
        return (
          <Link className={active ? 'is-active' : ''} to={to} key={to}>
            <span>{icon}</span>
            <b>{label}</b>
          </Link>
        )
      })}
    </nav>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { path } = useRouter()
  const { configured, user, profile, signOut, cloudSync } = useAuth()
  const syncLabel = cloudSyncLabel({ configured, user, cloudSync })

  useEffect(() => {
    setOpen(false)
  }, [path])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="STATIC Network home">
        <SignalMark animated />
        <span>STATIC</span>
        <small>NETWORK</small>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {desktopNav.map(([label, to]) => (
          <Link className={path === to ? 'is-active' : ''} key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link className={path === '/' ? 'district-return is-active' : 'district-return'} to="/">
          <span>Arrival District</span>
        </Link>
        <LiveIndicator />
        <span className={`cloud-sync-pill cloud-sync-pill--${cloudSync?.status || 'local-only'}`} title={cloudSync?.message || syncLabel}>
          <i />
          <span>{syncLabel}</span>
        </span>
        {user
          ? <Link className="button button--small button--signal header-cta header-account" to="/account">{profile?.avatar_url && <img src={profile.avatar_url} alt="" />}Account</Link>
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
        <div className="network-menu__top">
          <span>NETWORK DIRECTORY</span>
          <LiveIndicator label="TRANSMISSION ACTIVE" />
        </div>
        <div className="network-menu__grid">
          {navGroups.map((group, groupIndex) => (
            <div key={group.label}>
              <p>0{groupIndex + 1} / {group.label}</p>
              {group.links.map(([label, to]) => (
                <Link className={path === to ? 'is-active' : ''} key={to} to={to}>
                  <span>{label}</span>
                  <ArrowIcon />
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="network-menu__footer">
          <span>{syncLabel} / THE HOME OF AI ENTERTAINMENT</span>
          <div className="network-menu__account">
            {user ? <>
              <Link to="/account">ACCOUNT <ArrowIcon /></Link>
              <Link to="/studio">STUDIO <ArrowIcon /></Link>
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
    'MAIN ENTRANCE / ARRIVAL DISTRICT OPENING',
    'CLUBSTATIC / LIVE FLOOR WARMING',
    'ROOFTOP LOUNGE / PRIVATE ACCESS QUEUE',
    'CREATOR BOULEVARD / CHANNELS LIGHTING UP',
    'ARCADE WORLDS / STATIC PLAY PREVIEW',
    'S.A.G.E. / CONCIERGE SIGNAL ONLINE',
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
          <Link className="wordmark" to="/">
            <SignalMark />
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

export function SiteLayout({ children, assistantEnabled = true }) {
  const { path } = useRouter()
  const portalPublicPaths = new Set(['/login', '/signup', '/contact', '/terms', '/privacy'])
  const shellClassName = `site-shell${portalPublicPaths.has(path) ? ' site-shell--portal-public' : ''}`

  return (
    <div className={shellClassName}>
      <a className="skip-link" href="#main">Skip to content</a>
      {assistantEnabled && <SageSystem />}
      <SiteHeader />
      <main id="main">{children}</main>
      <MobileAppNav />
      <SiteFooter />
    </div>
  )
}
