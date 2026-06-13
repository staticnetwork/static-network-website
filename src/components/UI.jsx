import { createElement, useEffect, useRef, useState } from 'react'
import { Link } from './Router'

export function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  )
}

export function SignalMark({ animated = false }) {
  return (
    <span className={`signal-mark ${animated ? 'signal-mark--animated' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

export function LiveIndicator({ label = 'SIGNAL LIVE' }) {
  return (
    <span className="live-indicator">
      <i />
      {label}
    </span>
  )
}

export function ButtonLink({ to, children, variant = 'primary', className = '' }) {
  return (
    <Link className={`button button--${variant} ${className}`} to={to}>
      {children}
    </Link>
  )
}

export function Eyebrow({ children, live = false }) {
  return (
    <p className="eyebrow">
      {live ? <LiveIndicator label="" /> : <span />}
      {children}
    </p>
  )
}

export function SectionHeading({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  )
}

export function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || !('IntersectionObserver' in window)) {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return createElement(
    as,
    {
      ref,
      className: `reveal ${visible ? 'reveal--visible' : ''} ${className}`,
      style: { '--reveal-delay': `${delay}ms` },
    },
    children,
  )
}

export function PageHero({ code, eyebrow, title, copy, status, children, compact = false }) {
  return (
    <section className={`page-hero ${compact ? 'page-hero--compact' : ''}`}>
      <div className="broadcast-grid" aria-hidden="true" />
      <div className="page-hero__scan" aria-hidden="true" />
      <div className="page-frame page-hero__layout">
        <div className="page-hero__content">
          <div className="page-hero__meta">
            <span>{code}</span>
            <LiveIndicator label={status} />
          </div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          <p>{copy}</p>
          {children}
        </div>
        <div className="page-hero__telemetry" aria-hidden="true">
          <span>NET//NODE 88</span>
          <span>UPLINK 100%</span>
          <span>LAT 34.0522</span>
          <span>LNG -118.2437</span>
          <SignalMark animated />
        </div>
      </div>
    </section>
  )
}

export function SignalCard({ item, index }) {
  return (
    <Reveal as="article" className="signal-card" delay={(index % 3) * 70}>
      <div className={`signal-card__visual ${item.className}`}>
        <span>{item.code}</span>
        <div className="visual-noise" aria-hidden="true" />
        <button type="button" aria-label={`Preview ${item.title}`}>
          <PlayIcon />
        </button>
      </div>
      <div className="signal-card__body">
        <div>
          <span>{item.type}</span>
          <span>{item.metric}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.creator}</p>
      </div>
    </Reveal>
  )
}

export function ShellNotice({ children = 'Interactive network demonstration using simulated programming.' }) {
  return (
    <div className="shell-notice" role="note">
      <span>NETWORK DEMO</span>
      <p>{children}</p>
    </div>
  )
}
