import { useMemo, useState } from 'react'
import { directoryData, originalSeries, platforms } from '../data/network'
import { marketDrops } from '../data/media'
import { ContactForm, WaitlistForm } from '../components/Forms'
import {
  BroadcastDeck,
  ChannelGallery,
  LiveBroadcasts,
  LiveSignalFeed,
  MarketplaceBrowser,
  MediaVisual,
  PlayGenerator,
  RadioPlayer,
  StudioCreator,
} from '../components/NetworkDemos'
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
  SignalMark,
} from '../components/UI'

const platformBySlug = Object.fromEntries(platforms.map((platform) => [platform.slug, platform]))

function DemoStatus({ label = 'INTERACTIVE NETWORK DEMO', detail = 'Local prototype programming' }) {
  return (
    <div className="demo-status">
      <LiveIndicator label={label} />
      <span>{detail}</span>
    </div>
  )
}

function OriginalsSlate() {
  const [active, setActive] = useState(0)
  const selected = originalSeries[active]

  return (
    <div className="originals-slate">
      <div className={`originals-feature ${selected.className}`}>
        <div className="originals-feature__art"><i /><SignalMark animated /><button type="button" aria-label={`Play ${selected.title} demo`}><PlayIcon /></button></div>
        <div className="originals-feature__copy">
          <LiveIndicator label="STATIC ORIGINAL" />
          <h2>{selected.title}</h2>
          <span>{selected.format}</span>
          <p>{selected.logline}</p>
          <ButtonLink to="/waitlist">Add To My Signal <ArrowIcon /></ButtonLink>
        </div>
      </div>
      <div className="originals-rail">
        {originalSeries.map((series, index) => (
          <button className={index === active ? 'is-active' : ''} type="button" onClick={() => setActive(index)} key={series.title}>
            <span>0{index + 1}</span><div><b>{series.title}</b><small>{series.format}</small></div><ArrowIcon />
          </button>
        ))}
      </div>
    </div>
  )
}

function LabsConsole() {
  const [active, setActive] = useState(0)
  const experiments = [
    { title: 'WORLD COMPOSER', code: 'EXP-041', status: 'Creator alpha', copy: 'Arrange story, sound, entities, space, rules, and interaction inside one visual system.' },
    { title: 'FORMAT BRIDGE', code: 'EXP-117', status: 'Research signal', copy: 'Translate one creative source into connected release concepts across music, video, game, and live.' },
    { title: 'ENTITY CORE', code: 'EXP-230', status: 'Identity lab', copy: 'Shape memory, voice, visual language, boundaries, and world permissions for persistent characters.' },
    { title: 'NETWORK ADAPTER', code: 'EXP-302', status: 'Systems architecture', copy: 'A modular translation layer for generation, publishing, safety, storage, and future network services.' },
  ]
  const experiment = experiments[active]

  return (
    <div className="labs-console">
      <div className="labs-console__nav">
        <div className="console-topbar"><span>LAB DIRECTORY</span><span>{experiments.length} ACTIVE</span></div>
        {experiments.map((item, index) => (
          <button className={index === active ? 'is-active' : ''} type="button" onClick={() => setActive(index)} key={item.code}>
            <span>{item.code}</span><b>{item.title}</b><small>{item.status}</small>
          </button>
        ))}
      </div>
      <div className="labs-console__stage">
        <div className="lab-hologram"><i /><i /><i /><i /><SignalMark animated /></div>
        <div className="labs-console__copy"><LiveIndicator label={experiment.status} /><span>{experiment.code}</span><h2>{experiment.title}</h2><p>{experiment.copy}</p><ButtonLink to="/waitlist" variant="glass">Request Lab Access <ArrowIcon /></ButtonLink></div>
      </div>
    </div>
  )
}

export function PlatformPage({ slug }) {
  const platform = platformBySlug[slug]
  const content = {
    signals: {
      title: 'Live discovery, without the dead scroll.',
      copy: 'Open signals, creator transmissions, premieres, character updates, music drops, and playable worlds.',
      component: <LiveSignalFeed />,
    },
    channels: {
      title: 'Enter a creator-owned world.',
      copy: 'Channels combine identity, media, live programming, releases, community, and worlds in one destination.',
      component: <ChannelGallery />,
    },
    live: {
      title: 'Every broadcast is a place.',
      copy: 'Move between live rooms, premieres, battles, showcases, and audience-driven events.',
      component: <LiveBroadcasts />,
    },
    originals: {
      title: 'Programming that expands beyond the episode.',
      copy: 'STATIC Originals are designed to become characters, music, broadcasts, games, and worlds.',
      component: <OriginalsSlate />,
    },
    labs: {
      title: 'The experimental layer of STATIC.',
      copy: 'A view into the systems, formats, and interfaces being explored for network creators.',
      component: <LabsConsole />,
    },
  }[slug]

  return (
    <>
      <RouteSEO path={`/${slug}`} />
      <PageHero code={`SYSTEM//${platform.number}`} eyebrow={platform.label} title={platform.headline} copy={platform.description} status={platform.status}>
        <div className="button-row">
          <ButtonLink to="/waitlist">Request Access <ArrowIcon /></ButtonLink>
          <ButtonLink to="/discover" variant="glass">Explore The Network</ButtonLink>
        </div>
      </PageHero>
      {slug === 'live' && <div className="page-frame route-broadcast-deck"><BroadcastDeck compact /></div>}
      <section className="section page-content page-content--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow={`${platform.name} / NETWORK MODE`} title={content.title} copy={content.copy} />
            <DemoStatus detail={`${platform.status} / Simulated public programming`} />
          </div>
          {content.component}
        </div>
      </section>
    </>
  )
}

export function DiscoverPage() {
  return (
    <>
      <RouteSEO path="/discover" />
      <PageHero compact code="NETWORK//INDEX" eyebrow="DISCOVER STATIC" title="Find the next signal." copy="Search creators, worlds, releases, broadcasts, characters, games, and original programming across the network." status="INDEX LIVE" />
      <section className="section discover-page discover-page--active">
        <div className="page-frame">
          <LiveSignalFeed searchable />
        </div>
      </section>
    </>
  )
}

export function RadioPage() {
  return (
    <>
      <RouteSEO path="/radio" />
      <PageHero compact code="SYSTEM//03" eyebrow="STATIC RADIO" title="The network never goes silent." copy="Always-on stations for new music, moods, scenes, creator takeovers, experimental sound, and digital culture." status="ON AIR" />
      <section className="section radio-page radio-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="TUNE THE NETWORK" title="Four stations. Infinite night." copy="Switch stations, start the transmission, and move through the current network programming." />
            <DemoStatus label="RADIO DEMO ACTIVE" detail="Simulated station programming" />
          </div>
          <RadioPlayer />
        </div>
      </section>
    </>
  )
}

export function PlayPage() {
  return (
    <>
      <RouteSEO path="/play" />
      <PageHero code="SYSTEM//04" eyebrow="STATIC PLAY" title="What would you like to play today?" copy="Describe a game, watch the world-building sequence, and explore a generated local concept." status="ENGINE READY" />
      <section className="section play-page play-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="WORLD COMPOSER" title="Prompt imagination into motion." copy="Run the complete prototype flow from prompt to a generated world card." />
            <DemoStatus label="PLAY PROTOTYPE" detail="Interactive local generation sequence" />
          </div>
          <PlayGenerator />
        </div>
      </section>
    </>
  )
}

export function MarketplacePage() {
  return (
    <>
      <RouteSEO path="/marketplace" />
      <PageHero compact code="SYSTEM//07" eyebrow="STATIC MARKETPLACE" title="Own the culture." copy="Explore digital drops, music packs, skins, world templates, character systems, memberships, and creator access." status={`${marketDrops.length} DROPS LIVE`} />
      <section className="section marketplace-page marketplace-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="NETWORK DROPS" title="Built inside the worlds you follow." copy="Filter the market, open a drop, and request access to the creator signal behind it." />
            <DemoStatus label="MARKET DEMO" detail="Curated mock inventory" />
          </div>
          <MarketplaceBrowser />
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
  const [selected, setSelected] = useState(null)

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero compact code={`DIRECTORY//${type.toUpperCase()}`} eyebrow={config[0]} title={config[1]} copy={config[2]} status="DIRECTORY ONLINE" />
      <section className="section directory-page directory-page--active">
        <div className="page-frame">
          <div className="directory-grid">
            {directoryData[type].map((item, index) => (
              <Reveal as="article" className="profile-card profile-card--premium" delay={(index % 3) * 60} key={item.name}>
                <button type="button" onClick={() => setSelected(item)}>
                  <div className={`profile-card__avatar ${item.className}`}><span>0{index + 1}</span><i /><b>{item.name.slice(0, 2)}</b></div>
                  <span>{item.role}</span><h3>{item.name}</h3><p>{item.specialty}</p>
                  <div><strong>{item.stat}</strong><em>Open signal <ArrowIcon /></em></div>
                </button>
              </Reveal>
            ))}
          </div>
          {selected && (
            <div className="profile-focus">
              <button type="button" onClick={() => setSelected(null)} aria-label="Close profile">×</button>
              <div className={`profile-focus__visual ${selected.className}`}><i /><b>{selected.name.slice(0, 2)}</b></div>
              <div><LiveIndicator label={selected.role} /><h2>{selected.name}</h2><p>{selected.specialty}</p><strong>{selected.stat}</strong><ButtonLink to="/waitlist">Follow this signal <ArrowIcon /></ButtonLink></div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export function StudioPage() {
  return (
    <>
      <RouteSEO path="/studio" />
      <PageHero compact code="APP//STUDIO" eyebrow="STATIC STUDIO" title="One command center. Every format." copy="Move between song, video, character, game, world, and drop inside a single creator workspace." status="WORKSPACE ACTIVE" />
      <section className="section studio-page studio-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="CREATOR OS" title="Create across the network." copy="Choose a format, shape the prompt, select a style signal, and generate a simulated output." />
            <DemoStatus label="STUDIO DEMO" detail="Six interactive creation modes" />
          </div>
          <StudioCreator />
        </div>
      </section>
    </>
  )
}

export function MembershipPage({ type }) {
  const creator = type === 'creator-pro'
  const features = creator
    ? ['Advanced Studio workspace', 'Expanded world projects', 'Release planning signals', 'Team creation rooms', 'Performance intelligence', 'Priority creator pilots']
    : ['Deeper network access', 'Early original premieres', 'Private creator drops', 'Member radio sessions', 'Enhanced network identity', 'World access signals']

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero
        code={`ACCESS//${creator ? 'PRO' : 'PLUS'}`}
        eyebrow={creator ? 'CREATOR PRO' : 'STATIC+'}
        title={creator ? 'Build the world. Keep control.' : 'Go deeper into the network.'}
        copy={creator ? 'A professional creator signal for teams building ambitious entertainment worlds.' : 'A premium fan signal for deeper access, early programming, drops, and participation.'}
        status="ACCESS LIST OPEN"
      />
      <section className="section membership-page membership-page--premium">
        <div className="page-frame membership-grid">
          <Reveal>
            <Eyebrow>{creator ? 'PRO CREATOR SIGNAL' : 'MEMBER SIGNAL'}</Eyebrow>
            <h2>{creator ? 'A serious system for serious world builders.' : 'More access. More signal. More participation.'}</h2>
            <p>Join the private access list to receive the first transmission when this network layer opens.</p>
          </Reveal>
          <Reveal className="membership-card membership-card--premium" delay={100}>
            <div className="console-topbar"><span>{creator ? 'CREATOR PRO' : 'STATIC+'}</span><LiveIndicator label="PRIVATE BETA" /></div>
            <h3>{creator ? 'PRO SIGNAL' : 'PLUS SIGNAL'}</h3>
            <strong>FOUNDING ACCESS LIST</strong>
            {features.map((feature) => <p key={feature}><i />{feature}</p>)}
            <ButtonLink to="/waitlist">Request Founding Access <ArrowIcon /></ButtonLink>
            <small>Access details will arrive through a private network transmission.</small>
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
      <PageHero compact code="ACCESS//001" eyebrow="JOIN THE SIGNAL" title="Be early to what comes next." copy="Request access as a creator, fan, studio, or partner and choose the part of the network you want to enter first." status="ACCESS LIST OPEN" />
      <section className="section standalone-form-page standalone-form-page--premium">
        <div className="page-frame form-page-grid">
          <div>
            <Eyebrow>PRIVATE BETA</Eyebrow>
            <h2>Your first<br />transmission starts here.</h2>
            <p>Join the access list for creator pilots, network programming, private drops, and early product sessions.</p>
            <div className="access-points"><span>CREATOR PILOTS</span><span>PRIVATE TRANSMISSIONS</span><span>EARLY RELEASES</span></div>
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
      <PageHero compact code="COMMS//001" eyebrow="CONTACT STATIC" title="Send a direct transmission." copy="For creators, studios, partnerships, press, access, and serious questions." status="COMMS OPEN" />
      <section className="section standalone-form-page">
        <div className="page-frame form-page-grid">
          <div><Eyebrow>DIRECT CHANNELS</Eyebrow><h2>Find the right frequency.</h2><p>Use the network address for direct communication or prepare a message through the transmission form.</p><a className="direct-email" href="mailto:thestaticnetwork.com@gmail.com">thestaticnetwork.com@gmail.com</a></div>
          <ContactForm />
        </div>
      </section>
    </>
  )
}

export function LegalPage({ type }) {
  const privacy = type === 'privacy'
  const sections = useMemo(() => privacy ? [
    ['Current data handling', 'The public network experience uses local browser interactions for prototype controls. Direct email links open your chosen email application.'],
    ['Future services', 'Before accounts, analytics, payments, uploads, or connected creation services open, this notice will be updated to describe the exact services and data flows.'],
    ['Cookies and operations', 'The current experience does not intentionally implement custom advertising or behavioral tracking. Hosting infrastructure may retain standard operational logs.'],
    ['Contact', 'Questions about privacy can be directed to thestaticnetwork.com@gmail.com.'],
  ] : [
    ['Network status', 'STATIC Network currently provides a public media experience and interactive product demonstrations. Access to future services may be limited or invitation-based.'],
    ['Digital experiences', 'Marketplace, membership, generation, publishing, account, and creator workspace interfaces currently demonstrate intended product experiences.'],
    ['Intellectual property', 'STATIC Network branding, visual design, written copy, and original interface concepts are reserved by their respective owner. Demo programming communicates the product direction.'],
    ['Changes', 'Formal platform terms will be prepared and reviewed before connected production services open.'],
  ], [privacy])

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero compact code="LEGAL//PUBLIC" eyebrow={privacy ? 'PRIVACY NOTICE' : 'TERMS OF USE'} title={privacy ? 'Privacy, without static.' : 'Clear terms for the public network.'} copy="Plain-language preliminary information for the current STATIC experience." status="UPDATED JUN 2026" />
      <section className="section legal-page">
        <div className="page-frame legal-layout">
          <aside><span>DOCUMENT</span><strong>{privacy ? 'PRIVACY//001' : 'TERMS//001'}</strong><p>Preliminary public website notice for the current network experience.</p></aside>
          <div>{sections.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p></article>)}</div>
        </div>
      </section>
    </>
  )
}

export function NotFoundPage() {
  return (
    <>
      <RouteSEO path="/404" title="Signal Lost | STATIC Network" description="The requested STATIC Network route could not be found." />
      <section className="not-found"><div className="broadcast-grid" /><div><LiveIndicator label="SIGNAL LOST" /><h1>404</h1><p>This frequency does not exist.</p><ButtonLink to="/">Return To Network <ArrowIcon /></ButtonLink></div></section>
    </>
  )
}
