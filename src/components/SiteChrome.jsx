import { useEffect, useState } from 'react'
import { navGroups } from '../data/network'
import { Link, useRouter } from './Router'
import { ArrowIcon, LiveIndicator, SignalMark } from './UI'

const desktopNav = [
  ['Discover', '/discover'],
  ['Signals', '/signals'],
  ['Channels', '/channels'],
  ['Radio', '/radio'],
  ['Play', '/play'],
  ['Live', '/live'],
  ['Studio', '/studio'],
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { path } = useRouter()

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
        <LiveIndicator />
        <Link className="button button--small button--signal header-cta" to="/waitlist">
          Join
        </Link>
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
          <span>THE HOME OF AI ENTERTAINMENT</span>
          <Link to="/waitlist">REQUEST ACCESS <ArrowIcon /></Link>
        </div>
      </div>
    </header>
  )
}

export function BroadcastTicker() {
  const items = [
    'NOW TRANSMITTING / FREQUENCY ZERO',
    'STATIC ONE / GLASS SATELLITES',
    'CHROME DISTRICT / WORLD OPEN',
    'MEMORY PALACE / PREMIERE 21:00 PT',
    'CREATOR SIGNALS / 14 ACTIVE',
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
          <p>The Home of AI Entertainment</p>
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
        <span>LOS ANGELES / EVERYWHERE</span>
        <span>thestaticnetwork.com</span>
      </div>
    </footer>
  )
}

export function SiteLayout({ children }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  )
}
