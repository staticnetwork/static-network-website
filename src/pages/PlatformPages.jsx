import { useEffect, useMemo, useState } from 'react'
import { directoryData, originalSeries, platforms } from '../data/network'
import { marketDrops } from '../data/media'
import { ContactForm, WaitlistForm } from '../components/Forms'
import { EntityActionHub, EntityCard } from '../components/EntitySystem'
import { EntityAvatar } from '../components/AvatarSystem'
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
import { getChannelForEntity, getCurrentEntity, getNetworkStats, subscribeToNetworkUpdates } from '../lib/staticStore'
import { useAuth } from '../context/AuthContext'
import { getStorageMode } from '../lib/storage/storageAdapter'

const platformBySlug = Object.fromEntries(platforms.map((platform) => [platform.slug, platform]))

const platformHeroScenes = {
  channels: {
    image: '/assets/static-channels-district.png',
    className: 'page-hero--channels-district',
  },
  live: {
    image: '/assets/static-live-arena.png',
    className: 'page-hero--live-arena',
  },
  originals: {
    image: '/assets/static-originals-premiere.png',
    className: 'page-hero--originals-premiere',
  },
  labs: {
    image: '/assets/static-labs-atrium.png',
    className: 'page-hero--labs-atrium',
  },
}

function PreviewStatus({ label = 'DISTRICT PREVIEW', detail = 'Preview programming' }) {
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
        <div className="originals-feature__art"><i /><SignalMark animated /><button type="button" aria-label={`Play ${selected.title} preview`}><PlayIcon /></button></div>
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
  const [entity, setEntity] = useState(() => getCurrentEntity())
  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])
  const heroScene = platformHeroScenes[slug] || {}
  const content = {
    signals: {
      title: 'A boulevard of culture before it breaks.',
      copy: 'Open signals, creator transmissions, premieres, character updates, music drops, and playable worlds moving through the district.',
      component: <LiveSignalFeed />,
    },
    channels: {
      title: 'Enter a creator-owned venue.',
      copy: 'Channels combine identity, media, live programming, releases, community, and worlds in one district destination.',
      component: <ChannelGallery />,
    },
    live: {
      title: 'Every broadcast is a room you can enter.',
      copy: 'Move between live rooms, premieres, battles, showcases, and audience-driven events inside the arena.',
      component: <LiveBroadcasts />,
    },
    originals: {
      title: 'Premieres built to spill into the street.',
      copy: 'STATIC Originals are designed to become characters, music, broadcasts, games, and worlds across the district.',
      component: <OriginalsSlate />,
    },
    labs: {
      title: 'The experimental floor beneath the district.',
      copy: 'A view into the systems, formats, and interfaces being explored for STATIC creators.',
      component: <LabsConsole />,
    },
  }[slug]

  return (
    <>
      <RouteSEO path={`/${slug}`} />
      <PageHero
        code={`VENUE//${platform.number}`}
        eyebrow={platform.label}
        title={platform.headline}
        copy={platform.description}
        status={platform.status}
        image={heroScene.image || ''}
        imagePosition="center center"
        className={heroScene.className || ''}
      >
        <div className="button-row">
          <ButtonLink to="/waitlist">Request Access <ArrowIcon /></ButtonLink>
          <ButtonLink to="/discover" variant="glass">Explore The Network</ButtonLink>
        </div>
      </PageHero>
      {slug === 'live' && <div className="page-frame route-broadcast-deck"><BroadcastDeck compact /></div>}
      <section className="section page-content page-content--active">
        <div className="page-frame">
          {slug === 'channels' && (
            <div className="local-channel-launch">
              <div>
                <LiveIndicator label={entity ? 'ENTITY CHANNEL ONLINE' : 'ORIGIN CHANNEL AVAILABLE'} />
                <h2>{entity ? 'Your Entity owns this destination.' : 'Create the Entity. Launch the Channel.'}</h2>
                <p>{entity ? 'Open the public-facing world where your Entity’s Signals, video, music, live status, Drops, and Worlds connect.' : 'Every Entity automatically receives a Channel that becomes the center of its entertainment world.'}</p>
                <ButtonLink to={entity ? `/channels/${entity.handle.replace('@', '')}` : '/entities/create'}>
                  {entity ? 'Open Your Channel' : 'Create Entity + Channel'} <ArrowIcon />
                </ButtonLink>
              </div>
              {entity && <EntityCard entity={entity} />}
            </div>
          )}
          <div className="section-row">
            <SectionHeading eyebrow={`${platform.name} / NETWORK MODE`} title={content.title} copy={content.copy} />
            <PreviewStatus detail={`${platform.status} / Public preview programming`} />
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
      <PageHero
        compact
        code="DISTRICT//INDEX"
        eyebrow="DISCOVER STATIC"
        title="Find the next signal."
        copy="Search creators, venues, releases, broadcasts, characters, games, and original programming across the district."
        status="INDEX LIVE"
        image="/assets/static-discover-hub.png"
        imagePosition="center center"
        className="page-hero--discover-hub"
      >
        <div className="button-row">
          <ButtonLink to="/">Enter Arrival District <ArrowIcon /></ButtonLink>
          <ButtonLink to="/" variant="glass">Enter Arrival District</ButtonLink>
        </div>
      </PageHero>
      <section className="section discover-page discover-page--active">
        <div className="page-frame">
          <DiscoveryCommandRail />
          <DiscoveryTheater />
          <DiscoveryWorldSwitchboard />
          <LiveSignalFeed searchable />
        </div>
      </section>
    </>
  )
}

function DiscoveryCommandRail() {
  const [stats, setStats] = useState(() => getNetworkStats())
  useEffect(() => subscribeToNetworkUpdates(() => setStats(getNetworkStats())), [])
  const commandLanes = [
    ['WATCH', 'Signals', 'Swipe the public pulse for clips, premieres, drops, worlds, and creator transmissions.', '/signals', `${stats.publicSignals} public`],
    ['FOLLOW', 'My Signal', 'Build the return feed that makes STATIC feel personal instead of random.', '/my-signal', `${stats.follows} follows`],
    ['CREATE', 'Studio', 'Move from viewer to builder with saved projects, concepts, worlds, and releases.', '/studio', `${stats.projects} saves`],
    ['PLAY', 'STATIC PLAY', 'Prompt a world, save the concept, and start turning imagination into a destination.', '/play', `${stats.worlds} worlds`],
    ['LIVE', 'Arena', 'Treat premieres, rooms, events, and performances like places people can enter.', '/live', `${stats.reminders} reminders`],
  ]

  return (
    <section className="discovery-command-rail" aria-label="STATIC discovery command lanes">
      <div className="discovery-command-rail__intro">
        <LiveIndicator label="NETWORK COMMAND" />
        <h2>The feed is not the product. The city is.</h2>
        <p>Discovery should pull people from watching into following, creating, playing, broadcasting, collecting, and returning.</p>
      </div>
      <div className="discovery-command-rail__lanes">
        {commandLanes.map(([code, title, copy, route, status]) => (
          <Link to={route} key={code}>
            <span>{code}</span>
            <b>{title}</b>
            <p>{copy}</p>
            <em>{status}</em>
            <ArrowIcon />
          </Link>
        ))}
      </div>
    </section>
  )
}

function DiscoveryTheater() {
  const stories = [
    ['VA', 'VANTA', 'Album world'],
    ['KO', 'KIRA//OS', 'Playable city'],
    ['MS', 'MOTHER STATIC', 'Live host'],
    ['NS', 'NORTHSTAR', 'Originals'],
    ['PD', 'PARALLEL', 'Entity lab'],
  ]
  const actions = [
    ['Follow venue', '/channels'],
    ['Save to My Signal', '/my-signal'],
    ['Remix world', '/play'],
    ['Open creator tower', '/studio'],
  ]

  return (
    <section className="discovery-theater" aria-label="STATIC social entertainment theater">
      <div className="discovery-theater__screen">
        <span>FOR YOU / WORLD FEED</span>
        <div className="discovery-theater__visual">
          <MediaVisual className="media--chrome" label="WORLD 04">
            <span className="feed-status feed-status--live">Playable</span>
            <button type="button" aria-label="Play Chrome District preview"><PlayIcon /></button>
          </MediaVisual>
        </div>
        <div>
          <LiveIndicator label="SIGNAL TAKING OFF" />
          <h2>Chrome District is not just a clip. It is a venue, a game concept, a drop path, and a creator identity.</h2>
          <p>This is the direction: every piece of entertainment should be a doorway into a world people can follow, remix, play, collect, and return to.</p>
        </div>
      </div>
      <aside className="discovery-theater__social">
        <span>STORY RING</span>
        <div className="story-ring-row">
          {stories.map(([initials, name, label]) => (
            <Link to="/channels" key={name}>
              <b>{initials}</b>
              <span>{name}</span>
              <small>{label}</small>
            </Link>
          ))}
        </div>
        <div className="discovery-action-stack">
          {actions.map(([label, route]) => (
            <Link to={route} key={label}>{label}<ArrowIcon /></Link>
          ))}
        </div>
      </aside>
    </section>
  )
}

function DiscoveryWorldSwitchboard() {
  const switchboard = [
    ['Watch', 'Open the public pulse and see what is moving through the district right now.', '/signals', 'Feed loop'],
    ['Follow', 'Save venues into My Signal so discovery becomes a return habit.', '/my-signal', 'Social loop'],
    ['Create', 'Start an Entity and turn a creator, character, brand, or world into a public identity.', '/entities/create', 'Identity loop'],
    ['Broadcast', 'Preview live rooms, premieres, and countdowns as enterable events.', '/live', 'Event loop'],
    ['Play', 'Describe a world and save the playable concept for the Arcade.', '/play', 'Game loop'],
    ['Collect', 'Save drops and access intent before marketplace transactions go live.', '/marketplace', 'Economy loop'],
  ]

  return (
    <section className="discovery-switchboard" aria-label="STATIC discovery world switchboard">
      <div>
        <span>DISCOVERY SHOULD BRANCH</span>
        <h2>Every signal needs somewhere bigger to go.</h2>
        <p>The real product move is turning a clip, post, song, trailer, show, or game idea into a place with identity, social memory, live energy, and future ownership.</p>
      </div>
      <div>
        {switchboard.map(([title, copy, route, status]) => (
          <Link to={route} key={title}>
            <b>{title}</b>
            <p>{copy}</p>
            <small>{status}</small>
            <ArrowIcon />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function RadioPage() {
  return (
    <>
      <RouteSEO path="/radio" />
      <PageHero
        compact
        code="VENUE//03"
        eyebrow="STATIC RADIO"
        title="The district never goes silent."
        copy="Always-on stations for new music, moods, scenes, creator takeovers, after-hours sound, and digital culture."
        status="ON AIR"
        image="/assets/static-radio-rooftop.png"
        imagePosition="center center"
        className="page-hero--radio-rooftop"
      />
      <section className="section radio-page radio-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="TUNE THE DISTRICT" title="Four stations. Infinite night." copy="Switch stations, start the transmission, and move through current district programming." />
            <PreviewStatus label="RADIO PREVIEW ACTIVE" detail="Preview station programming" />
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
      <PageHero
        code="VENUE//04"
        eyebrow="STATIC PLAY"
        title="What would you like to play today?"
        copy="Describe a game, watch the world-building sequence, and explore a generated preview concept."
        status="ENGINE READY"
        image="/assets/static-play-world-gate.png"
        imagePosition="center center"
        className="page-hero--play-world-gate"
      />
      <section className="section play-page play-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="ARCADE COMPOSER" title="Prompt imagination into motion." copy="Run the preview flow from prompt to a generated world card." />
            <PreviewStatus label="PLAY PREVIEW" detail="Interactive preview generation sequence" />
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
      <PageHero
        compact
        code="BOULEVARD//07"
        eyebrow="STATIC MARKETPLACE"
        title="Own the culture."
        copy="Explore digital drops, music packs, skins, world templates, character systems, memberships, and creator access."
        status={`${marketDrops.length} DROPS LIVE`}
        image="/assets/static-marketplace-boulevard.png"
        imagePosition="center center"
        className="page-hero--marketplace-boulevard"
      />
      <section className="section marketplace-page marketplace-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="DISTRICT DROPS" title="Built inside the worlds you follow." copy="Filter the market, open a drop, and request access to the creator venue behind it." />
            <PreviewStatus label="MARKET PREVIEW" detail="Curated preview inventory" />
          </div>
          <MarketplaceBrowser />
        </div>
      </section>
    </>
  )
}

export function DirectoryPage({ type }) {
  const config = {
    creators: ['CREATOR DIRECTORY', 'Meet the people lighting up the district.', 'Artists, directors, producers, designers, storytellers, performers, and world builders.'],
    studios: ['STUDIO DIRECTORY', 'Independent worlds need independent studios.', 'Creative teams combining formats, disciplines, tools, and communities under one venue.'],
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
                  <div><strong>{item.stat}</strong><em>Open venue <ArrowIcon /></em></div>
                </button>
              </Reveal>
            ))}
          </div>
          {selected && (
            <div className="profile-focus">
              <button type="button" onClick={() => setSelected(null)} aria-label="Close profile">×</button>
              <div className={`profile-focus__visual ${selected.className}`}><i /><b>{selected.name.slice(0, 2)}</b></div>
              <div><LiveIndicator label={selected.role} /><h2>{selected.name}</h2><p>{selected.specialty}</p><strong>{selected.stat}</strong><ButtonLink to="/waitlist">Follow this venue <ArrowIcon /></ButtonLink></div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export function StudioPage() {
  const [entity, setEntity] = useState(() => getCurrentEntity())
  const { user, profile, configured } = useAuth()
  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])
  const channel = entity ? getChannelForEntity(entity.id) : null
  const mode = getStorageMode(user)

  return (
    <>
      <RouteSEO path="/studio" />
      <PageHero
        compact
        code="TOWER//STUDIO"
        eyebrow="STATIC STUDIO"
        title="Your creation tower. Every format."
        copy="Move between song, video, character, game, world, and drop inside a single creator workspace."
        status="WORKSPACE ACTIVE"
        image="/assets/static-studio-tower.png"
        imagePosition="center center"
        className="page-hero--studio-tower"
      />
      <section className="section studio-page studio-page--active">
        <div className="page-frame">
          <div className="studio-command-center">
            <div className="studio-command-center__intro">
              <LiveIndicator label={entity ? 'ENTITY WORKSPACE ACTIVE' : 'ENTITY CORE READY'} />
              <h2>{entity ? `${entity.name} controls the signal.` : 'Begin with the public identity.'}</h2>
              <p>Humans build backstage. The Entity publishes, performs, hosts, releases, goes live, and becomes the face of the world.</p>
              {!entity && <ButtonLink to="/entities/create">Create Entity <ArrowIcon /></ButtonLink>}
            </div>
            {entity ? (
              <div className="studio-command-center__entity">
                <div className="studio-operator-card">
                  <EntityAvatar entity={entity} size="profile" />
                  <div>
                    <span>ACTIVE ENTITY / {mode.toUpperCase()} MODE</span>
                    <h3>{entity.name}</h3>
                    <p>{entity.handle} / {entity.companyBrand || entity.company || 'Independent Entity'}</p>
                    <dl>
                      <div><dt>CHANNEL</dt><dd>{channel?.displayName || channel?.name || 'Initializing'}</dd></div>
                      <div><dt>SIGNAL SCORE</dt><dd>{entity.signalScore}</dd></div>
                      <div><dt>OPERATOR</dt><dd>{profile?.display_name || user?.email || (configured ? 'Login required for sync' : 'Local creator')}</dd></div>
                    </dl>
                  </div>
                </div>
                <EntityActionHub entity={entity} compact onEntityChange={setEntity} />
                <div className="studio-control-grid">
                  <ButtonLink to="/entities/profile" variant="glass">Edit / View Entity</ButtonLink>
                  <ButtonLink to="/entities/avatar" variant="glass">Customize Avatar</ButtonLink>
                  <ButtonLink to="/channel/customize" variant="glass">Customize Channel</ButtonLink>
                  <ButtonLink to="/feed" variant="glass">Transmit / Open Feed</ButtonLink>
                  <ButtonLink to={`/channels/${entity.handle.replace('@', '')}`} variant="glass">View Channel</ButtonLink>
                  <ButtonLink to={user ? '/account' : '/login'} variant="glass">{user ? 'Account / Import' : 'Login For Sync'}</ButtonLink>
                </div>
              </div>
            ) : (
              <div className="studio-empty-core"><SignalMark animated /><span>MY ENTITY</span><h3>Origin identity not initialized.</h3><p>Creation starts with the Entity, then expands into Signals, video, live, Worlds, Drops, songs, shows, and games.</p></div>
            )}
          </div>
          <div className="section-row">
            <SectionHeading eyebrow="CREATOR TOWER" title="Expand the Entity across every format." copy="Shape songs, video, characters, games, worlds, and drops from the same backstage command floor." />
            <PreviewStatus label="STUDIO MODE" detail="Six interactive creation modes" />
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
        copy={creator ? 'A professional creator pass for teams building ambitious entertainment worlds.' : 'A premium fan pass for deeper access, early programming, drops, and participation.'}
        status="ACCESS LIST OPEN"
      />
      <section className="section membership-page membership-page--premium">
        <div className="page-frame membership-grid">
          <Reveal>
            <Eyebrow>{creator ? 'PRO CREATOR PASS' : 'MEMBER PASS'}</Eyebrow>
            <h2>{creator ? 'A serious system for serious world builders.' : 'More access. More signal. More participation.'}</h2>
            <p>Join the private access list to receive the first transmission when this network layer opens.</p>
          </Reveal>
          <Reveal className="membership-card membership-card--premium" delay={100}>
            <div className="console-topbar"><span>{creator ? 'CREATOR PRO' : 'STATIC+'}</span><LiveIndicator label="PRIVATE BETA" /></div>
            <h3>{creator ? 'PRO PASS' : 'PLUS PASS'}</h3>
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
      <PageHero
        compact
        code="ACCESS//001"
        eyebrow="REQUEST DISTRICT ACCESS"
        title="Be early to what comes next."
        copy="Request access as a creator, fan, studio, or partner and choose the part of the district you want to enter first."
        status="ACCESS LIST OPEN"
        image="/assets/static-access-gate.png"
        imagePosition="center center"
        className="page-hero--access-gate"
      />
      <section className="section standalone-form-page standalone-form-page--premium">
        <div className="page-frame form-page-grid">
          <div>
            <Eyebrow>PRIVATE BETA</Eyebrow>
            <h2>Your district<br />pass starts here.</h2>
            <p>Join the access list for creator pilots, district programming, private drops, and early product sessions.</p>
            <div className="access-points"><span>CREATOR PILOTS</span><span>PRIVATE VENUES</span><span>EARLY RELEASES</span></div>
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
      <PageHero compact code="COMMS//001" eyebrow="CONTACT STATIC" title="Open a private channel." copy="For creators, studios, partnerships, press, access, and serious questions entering the STATIC district." status="COMMS OPEN" />
      <section className="section standalone-form-page">
        <div className="page-frame form-page-grid">
          <div><Eyebrow>DIRECT CHANNELS</Eyebrow><h2>Find the right entrance.</h2><p>Use the district address for direct communication or stage a message through the contact console.</p><a className="direct-email" href="mailto:thestaticnetwork.com@gmail.com">thestaticnetwork.com@gmail.com</a></div>
          <ContactForm />
        </div>
      </section>
    </>
  )
}

export function LegalPage({ type }) {
  const privacy = type === 'privacy'
  const sections = useMemo(() => privacy ? [
    ['Current data handling', 'The public district receives only the information visitors intentionally submit through access or contact interactions. Direct email links open your chosen email application.'],
    ['Future services', 'As account, creation, upload, payment, or connected media systems open, this notice will be updated to describe the exact services and data flows.'],
    ['Cookies and operations', 'The current public district does not intentionally implement custom advertising or behavioral tracking. Hosting infrastructure may retain standard operational logs.'],
    ['Contact', 'Questions about privacy can be directed to thestaticnetwork.com@gmail.com.'],
  ] : [
    ['Network status', 'STATIC Network is opening in controlled phases. Access to connected services may be limited, invitation-based, or operator-approved.'],
    ['Digital experiences', 'Marketplace, membership, generation, publishing, account, and creator workspace interfaces communicate intended product experiences until their connected services open.'],
    ['Intellectual property', 'STATIC Network branding, visual design, written copy, and original interface concepts are reserved by their respective owner. Preview programming communicates the product direction.'],
    ['Changes', 'Formal platform terms will be prepared and reviewed before connected production services open.'],
  ], [privacy])

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero compact code="LEGAL//PUBLIC" eyebrow={privacy ? 'PRIVACY NOTICE' : 'TERMS OF USE'} title={privacy ? 'Privacy at the district edge.' : 'Terms for controlled access.'} copy="Plain-language preliminary information for the public STATIC district." status="UPDATED JUN 2026" />
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
