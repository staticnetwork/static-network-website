import { useMemo, useState } from 'react'
import {
  directoryData,
  marketplaceItems,
  originalSeries,
  platforms,
  radioStations,
  signals,
} from '../data/network'
import { ContactForm, WaitlistForm } from '../components/Forms'
import { Link, RouteSEO } from '../components/Router'
import {
  ArrowIcon,
  ButtonLink,
  Eyebrow,
  LiveIndicator,
  PageHero,
  PlayIcon,
  Reveal,
  SectionHeading,
  ShellNotice,
  SignalCard,
  SignalMark,
} from '../components/UI'

const platformBySlug = Object.fromEntries(platforms.map((platform) => [platform.slug, platform]))

function FeedPreview({ limit = 6 }) {
  return (
    <div className="signal-grid signal-grid--wide">
      {signals.slice(0, limit).map((item, index) => (
        <SignalCard item={item} index={index} key={item.code} />
      ))}
    </div>
  )
}

function ChannelPreview() {
  return (
    <div className="world-grid">
      {[
        ['CHROME DISTRICT', 'KIRA//OS', '12.8K INSIDE', 'world--chrome'],
        ['MEMORY PALACE', 'NORTHSTAR', '8.4K INSIDE', 'world--memory'],
        ['NIGHT SHIFT', 'VANTA', '6.1K INSIDE', 'world--night'],
        ['REDLINE', 'APEX GHOST', '4.9K INSIDE', 'world--redline'],
      ].map(([name, creator, stat, className], index) => (
        <Reveal as="article" className={`world-card ${className}`} delay={(index % 2) * 70} key={name}>
          <div className="world-card__index">WORLD//0{index + 1}</div>
          <div className="world-card__body">
            <span>{stat}</span>
            <h3>{name}</h3>
            <p>by {creator}</p>
            <button type="button">Preview world <ArrowIcon /></button>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

function LivePreview() {
  return (
    <div className="live-stage">
      <div className="live-stage__screen">
        <div className="live-stage__art">
          <SignalMark animated />
          <span>LIVE//09</span>
        </div>
        <div className="live-stage__overlay">
          <LiveIndicator label="LIVE NOW" />
          <div><h3>FREQUENCY ZERO</h3><p>VANTA live from Night Shift</p></div>
          <span>8,642 WATCHING</span>
        </div>
      </div>
      <aside>
        <div className="console-topbar"><span>LIVE CHAT</span><span>8.6K</span></div>
        {['ghostmode: the stage design is unreal', 'luxx: signal from london', 'KIRA//OS: drop the new world', 'static_one: TRANSMISSION LOCKED'].map((message) => (
          <p key={message}><i />{message}</p>
        ))}
        <div className="chat-input">Chat requires future account access</div>
      </aside>
    </div>
  )
}

function LabPreview() {
  return (
    <div className="lab-grid">
      {[
        ['WORLD COMPOSER', 'Arrange story, sound, entities, and interaction inside one visual system.', 'PROTOTYPE 0.4'],
        ['FORMAT BRIDGE', 'Translate one creative source into release-ready concepts across multiple formats.', 'RESEARCH'],
        ['ENTITY CORE', 'Define identity, memory, voice, style, and world permissions for persistent characters.', 'SPEC DRAFT'],
        ['PROVIDER ADAPTERS', 'A future modular layer for approved generation, storage, commerce, and safety providers.', 'ARCHITECTURE'],
      ].map(([title, copy, status], index) => (
        <Reveal as="article" className="lab-card" delay={(index % 2) * 80} key={title}>
          <span>LAB//0{index + 1}</span>
          <div className="lab-card__diagram"><i /><i /><i /><b /></div>
          <h3>{title}</h3>
          <p>{copy}</p>
          <strong>{status}</strong>
        </Reveal>
      ))}
    </div>
  )
}

export function PlatformPage({ slug }) {
  const platform = platformBySlug[slug]
  const featureLabel =
    slug === 'signals' ? 'Live discovery feed' :
    slug === 'channels' ? 'Creator world directory' :
    slug === 'live' ? 'Broadcast interface' :
    slug === 'originals' ? 'Original programming slate' :
    'Experimental tool systems'

  return (
    <>
      <RouteSEO path={`/${slug}`} />
      <PageHero
        code={`SYSTEM//${platform.number}`}
        eyebrow={platform.label}
        title={platform.headline}
        copy={platform.description}
        status={platform.status}
      >
        <div className="button-row">
          <ButtonLink to="/waitlist">Request Early Access <ArrowIcon /></ButtonLink>
          <ButtonLink to="/discover" variant="ghost">Explore The Network</ButtonLink>
        </div>
      </PageHero>

      <section className="section page-content">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow={`${platform.name.toUpperCase()} / INTERFACE PREVIEW`}
              title={featureLabel}
              copy="A production-quality view of the intended public experience. Interactive services will connect only after the underlying platform systems are approved."
            />
            <ShellNotice />
          </div>
          {slug === 'signals' && <FeedPreview />}
          {slug === 'channels' && <ChannelPreview />}
          {slug === 'live' && <LivePreview />}
          {slug === 'originals' && <OriginalsPreview />}
          {slug === 'labs' && <LabPreview />}
        </div>
      </section>

      <FeatureBands platform={platform} />
    </>
  )
}

function FeatureBands({ platform }) {
  const features = {
    signals: ['MIXED MEDIA FEED', 'CULTURE GRAPH', 'REMIX PATHS'],
    channels: ['OWNED DESTINATIONS', 'RELEASE ARCHIVES', 'COMMUNITY LAYERS'],
    live: ['PREMIERES', 'WATCH PARTIES', 'INTERACTIVE EVENTS'],
    originals: ['SERIES', 'DOCUMENTARIES', 'EXPANDING WORLDS'],
    labs: ['CREATOR TOOLS', 'OPEN ADAPTERS', 'FUTURE APIs'],
  }[platform.slug]

  return (
    <section className="feature-bands">
      {features.map((feature, index) => (
        <Reveal as="article" key={feature}>
          <span>0{index + 1}</span>
          <h3>{feature}</h3>
          <p>
            Designed as part of one interoperable network rather than a disconnected feature.
          </p>
        </Reveal>
      ))}
    </section>
  )
}

export function DiscoverPage() {
  return (
    <>
      <RouteSEO path="/discover" />
      <PageHero
        compact
        code="DIRECTORY//ALL"
        eyebrow="DISCOVER THE NETWORK"
        title="Find the next signal."
        copy="Trending worlds, broadcasts, releases, entities, games, and creators from across STATIC."
        status="FEED REFRESHING"
      />
      <section className="section discover-page">
        <div className="page-frame">
          <div className="filter-row" aria-label="Discovery filters">
            {['FOR YOU', 'TRENDING', 'LIVE', 'MUSIC', 'WORLDS', 'GAMES', 'ORIGINALS'].map((filter, index) => (
              <button className={index === 0 ? 'is-active' : ''} type="button" key={filter}>{filter}</button>
            ))}
          </div>
          <FeedPreview />
          <div className="discover-cta">
            <p>Personalized discovery will require future account and recommendation systems.</p>
            <ButtonLink to="/waitlist" variant="ghost">Join For Early Access <ArrowIcon /></ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}

export function RadioPage() {
  const [active, setActive] = useState(0)
  const station = radioStations[active]

  return (
    <>
      <RouteSEO path="/radio" />
      <PageHero
        compact
        code="SYSTEM//03"
        eyebrow="STATIC RADIO"
        title="The network never goes silent."
        copy="Always-on stations for the music, moods, scenes, creators, and digital cultures forming right now."
        status="ON AIR"
      />
      <section className="section radio-page">
        <div className="page-frame">
          <ShellNotice>Station selection and player motion work locally. No audio stream is connected.</ShellNotice>
          <div className="radio-console">
            <div className={`radio-now radio-now--${station.color}`}>
              <div className="radio-now__top"><LiveIndicator label="NOW PLAYING" /><span>{station.signal} FM</span></div>
              <div className="radio-disc"><i /><b><SignalMark animated /></b></div>
              <div className="radio-track">
                <span>STATIC RADIO ORIGINAL BROADCAST</span>
                <h2>{station.name}</h2>
                <p>{station.genre}</p>
              </div>
              <div className="waveform" aria-hidden="true">
                {Array.from({ length: 34 }, (_, index) => <i style={{ '--bar': `${18 + ((index * 17) % 64)}%` }} key={index} />)}
              </div>
              <button type="button" aria-label="Audio preview unavailable"><PlayIcon /> PREVIEW PLAYER</button>
            </div>
            <div className="station-list">
              <div className="console-topbar"><span>STATION DIRECTORY</span><span>{radioStations.length} ONLINE</span></div>
              {radioStations.map((item, index) => (
                <button className={index === active ? 'is-active' : ''} type="button" onClick={() => setActive(index)} key={item.name}>
                  <span>0{index + 1}</span>
                  <div><b>{item.name}</b><small>{item.genre}</small></div>
                  <em>{item.listeners}</em>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export function PlayPage() {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('')

  function handlePreview(event) {
    event.preventDefault()
    setStatus(prompt.trim()
      ? 'Prompt staged locally. A generation provider is not connected.'
      : 'Describe a world before staging the preview.')
  }

  return (
    <>
      <RouteSEO path="/play" />
      <PageHero
        code="SYSTEM//04"
        eyebrow="STATIC PLAY"
        title="What would you like to play today?"
        copy="Describe a game, remix a world, set the rules, and turn imagination into a playable release."
        status="ENGINE STANDBY"
      />
      <section className="section play-page">
        <div className="page-frame">
          <ShellNotice>The prompt console is an honest UI preview. It does not call a game-generation API.</ShellNotice>
          <div className="play-builder">
            <aside>
              <div className="console-topbar"><span>WORLD LIBRARY</span><span>LOCAL</span></div>
              {['New world', 'Chrome District', 'Dead Air', 'Neon Football'].map((world, index) => (
                <button className={index === 0 ? 'is-active' : ''} type="button" key={world}>
                  <span>0{index + 1}</span>{world}
                </button>
              ))}
            </aside>
            <form onSubmit={handlePreview}>
              <div className="play-builder__viewport">
                <div className="world-horizon"><i /><i /><i /></div>
                <div className="world-status"><span>UNTITLED WORLD</span><span>NO ENGINE CONNECTED</span></div>
              </div>
              <label>
                <span>DESCRIBE YOUR GAME OR WORLD</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows="4"
                  placeholder="A co-op survival game inside a city that only exists during thunderstorms..."
                />
              </label>
              <div className="play-builder__controls">
                <div className="prompt-tags"><span>GENRE +</span><span>STYLE +</span><span>RULES +</span></div>
                <button className="button button--signal" type="submit">Stage Prompt <ArrowIcon /></button>
              </div>
              <p className="form-status" role="status">{status}</p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

function OriginalsPreview() {
  return (
    <div className="originals-grid">
      {originalSeries.map((series, index) => (
        <Reveal as="article" className={`original-card ${series.className}`} delay={(index % 2) * 70} key={series.title}>
          <div className="original-card__frame"><span>STATIC ORIGINAL</span><button type="button"><PlayIcon /></button></div>
          <div><span>{series.format}</span><h3>{series.title}</h3><p>{series.logline}</p></div>
        </Reveal>
      ))}
    </div>
  )
}

export function MarketplacePage() {
  return (
    <>
      <RouteSEO path="/marketplace" />
      <PageHero
        compact
        code="SYSTEM//07"
        eyebrow="STATIC MARKETPLACE"
        title="Own the culture."
        copy="A preview marketplace for creator assets, drops, skins, templates, memberships, and digital experiences."
        status="MARKET PREVIEW"
      />
      <section className="section marketplace-page">
        <div className="page-frame">
          <ShellNotice>No payments, wallet, inventory, or transaction system is connected.</ShellNotice>
          <div className="filter-row">
            {['FEATURED', 'WORLDS', 'AUDIO', 'GAME ASSETS', 'MEMBERSHIPS', 'TOOLS'].map((filter, index) => (
              <button className={index === 0 ? 'is-active' : ''} type="button" key={filter}>{filter}</button>
            ))}
          </div>
          <div className="market-grid">
            {marketplaceItems.map((item, index) => (
              <Reveal as="article" className="market-card" delay={(index % 3) * 60} key={item.name}>
                <div className={`market-card__visual ${item.className}`}><span>{item.edition}</span><i /></div>
                <div className="market-card__body">
                  <span>{item.type}</span><h3>{item.name}</h3><p>{item.creator}</p>
                  <div><strong>{item.price}</strong><button type="button" disabled>Preview only</button></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function DirectoryPage({ type }) {
  const config = {
    creators: ['CREATOR DIRECTORY', 'Meet the people building the signal.', 'Artists, directors, producers, designers, storytellers, performers, and world builders.'],
    studios: ['STUDIO DIRECTORY', 'Independent worlds need independent studios.', 'Creative teams combining formats, disciplines, tools, and communities under one signal.'],
    entities: ['ENTITY DIRECTORY', 'Characters that can live beyond one story.', 'Persistent digital identities designed to perform, evolve, interact, and move across worlds.'],
  }[type]

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero compact code={`DIRECTORY//${type.toUpperCase()}`} eyebrow={config[0]} title={config[1]} copy={config[2]} status="DIRECTORY ONLINE" />
      <section className="section directory-page">
        <div className="page-frame">
          <div className="directory-grid">
            {directoryData[type].map((item, index) => (
              <Reveal as="article" className="profile-card" delay={(index % 3) * 60} key={item.name}>
                <div className={`profile-card__avatar ${item.className}`}><span>0{index + 1}</span><i /></div>
                <span>{item.role}</span><h3>{item.name}</h3><p>{item.specialty}</p>
                <div><strong>{item.stat}</strong><button type="button">View preview <ArrowIcon /></button></div>
              </Reveal>
            ))}
          </div>
          <div className="directory-note">
            <p>Profiles are illustrative previews for the future directory system.</p>
            <ButtonLink to="/waitlist" variant="ghost">Apply For Early Access <ArrowIcon /></ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}

export function StudioPage() {
  const [status, setStatus] = useState('')

  return (
    <>
      <RouteSEO path="/studio" />
      <PageHero compact code="APP//STUDIO" eyebrow="STATIC STUDIO" title="One command center. Every format." copy="A future creator workspace for shaping ideas into music, video, games, entities, worlds, and releases." status="STUDIO PREVIEW" />
      <section className="section studio-page">
        <div className="page-frame">
          <ShellNotice>Editor controls are visual previews. Generation, uploads, storage, and publishing are not connected.</ShellNotice>
          <div className="studio-shell">
            <div className="studio-shell__rail">
              <SignalMark />
              {['⌁', '◇', '◫', '△', '◎'].map((icon, index) => <button className={index === 0 ? 'is-active' : ''} type="button" key={icon}>{icon}</button>)}
            </div>
            <aside className="studio-shell__library">
              <div className="console-topbar"><span>PROJECT</span><span>V.001</span></div>
              <h3>UNTITLED WORLD</h3>
              {['Idea', 'Sound', 'Visuals', 'Entities', 'World', 'Release'].map((item, index) => (
                <button className={index === 0 ? 'is-active' : ''} type="button" key={item}><span>0{index + 1}</span>{item}</button>
              ))}
            </aside>
            <div className="studio-shell__work">
              <div className="studio-toolbar">
                <span>CANVAS / WORLD COMPOSER</span>
                <div><button type="button" onClick={() => setStatus('Saved locally in preview state only.')}>SAVE</button><button type="button" onClick={() => setStatus('Publishing requires future accounts, storage, and moderation.')}>PUBLISH</button></div>
              </div>
              <div className="studio-canvas">
                <div className="canvas-node canvas-node--idea"><span>01</span><b>CORE IDEA</b><p>A city that dreams through its citizens.</p></div>
                <div className="canvas-node canvas-node--sound"><span>02</span><b>SOUND</b><p>Night transmission</p></div>
                <div className="canvas-node canvas-node--entity"><span>03</span><b>ENTITY</b><p>THE WITNESS</p></div>
                <svg aria-hidden="true" viewBox="0 0 800 420"><path d="M190 190 C320 190 300 80 470 105M190 210 C330 220 340 330 520 320" /></svg>
              </div>
              <div className="studio-timeline">
                <div className="console-topbar"><span>FORMAT TIMELINE</span><span>00:00:14:22</span></div>
                <div><span>VIDEO</span><i /><i /><i /></div>
                <div><span>AUDIO</span><i /><i /></div>
                <div><span>WORLD</span><i /></div>
              </div>
            </div>
          </div>
          <p className="form-status" role="status">{status}</p>
        </div>
      </section>
    </>
  )
}

export function MembershipPage({ type }) {
  const creator = type === 'creator-pro'
  const features = creator
    ? ['Advanced Studio workspace', 'Expanded project limits', 'Release planning tools', 'Team workspace preview', 'Future analytics layer', 'Priority creator access']
    : ['Premium network access', 'Early original premieres', 'Exclusive creator drops', 'Enhanced radio sessions', 'Member identity treatment', 'Future world benefits']

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero
        code={`ACCESS//${creator ? 'PRO' : 'PLUS'}`}
        eyebrow={creator ? 'CREATOR PRO' : 'STATIC+'}
        title={creator ? 'Build the world. Keep control.' : 'Go deeper into the network.'}
        copy={creator ? 'A future professional layer for creators and teams building serious entertainment systems.' : 'A future fan membership for deeper access, exclusives, drops, and participation.'}
        status="ACCESS PREVIEW"
      />
      <section className="section membership-page">
        <div className="page-frame membership-grid">
          <Reveal>
            <Eyebrow>MEMBERSHIP CONCEPT</Eyebrow>
            <h2>{creator ? 'A professional system, not another subscription trap.' : 'Membership should feel like access, not interruption.'}</h2>
            <p>Final pricing, availability, benefits, billing, and terms have not been established.</p>
          </Reveal>
          <Reveal className="membership-card" delay={100}>
            <div className="console-topbar"><span>{creator ? 'CREATOR PRO' : 'STATIC+'}</span><span>COMING LATER</span></div>
            <h3>{creator ? 'PRO SIGNAL' : 'PLUS SIGNAL'}</h3>
            <strong>PRICING NOT ANNOUNCED</strong>
            {features.map((feature) => <p key={feature}><i />{feature}</p>)}
            <ButtonLink to="/waitlist">Join The Access List <ArrowIcon /></ButtonLink>
            <small>No checkout or subscription is active.</small>
          </Reveal>
        </div>
      </section>
    </>
  )
}

export function WaitlistPage() {
  return (
    <>
      <RouteSEO path="/waitlist" />
      <PageHero compact code="ACCESS//001" eyebrow="JOIN THE SIGNAL" title="Be early to what comes next." copy="Request access as a creator, fan, studio, or partner while STATIC Network is being built." status="WAITLIST OPEN" />
      <section className="section standalone-form-page">
        <div className="page-frame form-page-grid">
          <div>
            <Eyebrow>EARLY ACCESS</Eyebrow>
            <h2>One form.<br />No fake promises.</h2>
            <p>The interface is ready. Data collection will only be connected after the provider, consent language, and privacy handling are approved.</p>
            <div className="access-points"><span>PRIVATE TRANSMISSIONS</span><span>CREATOR PILOTS</span><span>EARLY RELEASES</span></div>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </>
  )
}

export function ContactPage() {
  return (
    <>
      <RouteSEO path="/contact" />
      <PageHero compact code="COMMS//001" eyebrow="CONTACT STATIC" title="Send a direct transmission." copy="For creators, studios, partnerships, press, early access, and serious questions." status="COMMS OPEN" />
      <section className="section standalone-form-page">
        <div className="page-frame form-page-grid">
          <div>
            <Eyebrow>DIRECT CHANNELS</Eyebrow>
            <h2>Find the right frequency.</h2>
            <p>Until the contact system is connected, use the direct network email.</p>
            <a className="direct-email" href="mailto:thestaticnetwork.com@gmail.com">thestaticnetwork.com@gmail.com</a>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  )
}

export function LegalPage({ type }) {
  const privacy = type === 'privacy'
  const sections = useMemo(() => privacy ? [
    ['Current data handling', 'This public preview does not currently send waitlist or contact form data to a server. Browser interactions remain local unless you choose a direct email link.'],
    ['Future services', 'Before accounts, analytics, payments, uploads, or provider APIs launch, this notice will be replaced with a reviewed policy describing the exact services and data flows.'],
    ['Cookies and analytics', 'No custom advertising or behavioral tracking system is intentionally implemented in this preview build. Hosting infrastructure may retain standard operational logs.'],
    ['Contact', 'Questions about privacy can be directed to thestaticnetwork.com@gmail.com.'],
  ] : [
    ['Preview status', 'STATIC Network is currently a public website and interface preview. Features shown as previews are not promises of immediate availability.'],
    ['No transactions', 'Marketplace, subscriptions, payments, generation, publishing, accounts, and storage are not active in this build.'],
    ['Intellectual property', 'STATIC Network branding, visual design, written copy, and original interface concepts are reserved by their respective owner. Illustrative mock content is provided only to communicate the product direction.'],
    ['Changes', 'Formal platform terms will be prepared and reviewed before production services launch.'],
  ], [privacy])

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero compact code="LEGAL//PUBLIC" eyebrow={privacy ? 'PRIVACY NOTICE' : 'TERMS OF USE'} title={privacy ? 'Privacy, without static.' : 'Clear terms for a preview network.'} copy="Plain-language preliminary information for the current public website." status="UPDATED JUN 2026" />
      <section className="section legal-page">
        <div className="page-frame legal-layout">
          <aside><span>DOCUMENT</span><strong>{privacy ? 'PRIVACY//001' : 'TERMS//001'}</strong><p>Preliminary public website notice. Not a substitute for final reviewed production policies.</p></aside>
          <div>
            {sections.map(([title, copy], index) => (
              <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p></article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function NotFoundPage() {
  return (
    <>
      <RouteSEO path="/404" title="Signal Lost | STATIC Network" description="The requested STATIC Network route could not be found." />
      <section className="not-found">
        <div className="broadcast-grid" />
        <div><LiveIndicator label="SIGNAL LOST" /><h1>404</h1><p>This frequency does not exist.</p><ButtonLink to="/">Return To Network <ArrowIcon /></ButtonLink></div>
      </section>
    </>
  )
}
