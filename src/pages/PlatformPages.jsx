import { useEffect, useMemo, useState } from 'react'
import { directoryData, originalSeries, platforms } from '../data/network'
import { ContactForm, WaitlistForm } from '../components/Forms'
import { EntityCard } from '../components/EntitySystem'
import {
  BroadcastDeck,
  ChannelGallery,
  LiveBroadcasts,
  LiveSignalFeed,
  MarketplaceBrowser,
  MediaVisual,
  PlayGenerator,
  RadioPlayer,
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
import { getCurrentEntity, getNetworkStats, subscribeToNetworkUpdates } from '../lib/staticStore'
import { useAuth } from '../context/AuthContext'
import { useBackendCapability } from '../lib/backendReadiness'
import { startStripeCheckout } from '../lib/socialActions'
import { previewSocialSignals, socialBotCreators } from '../data/socialBots'

const platformBySlug = Object.fromEntries(platforms.map((platform) => [platform.slug, platform]))

const platformHeroScenes = {
  channels: {
    image: '/assets/world/city/heroes/static-channels-signal-walk-v3.png',
    className: 'page-hero--channels-district',
  },
  live: {
    image: '/assets/world/city/heroes/static-arena-sports-quarter-v1-approved.png',
    className: 'page-hero--live-arena',
  },
  originals: {
    image: '/assets/world/city/heroes/static-channels-creator-venue-row-v1.png',
    className: 'page-hero--originals-premiere',
  },
  labs: {
    image: '/assets/static-labs-atrium.png',
    className: 'page-hero--labs-atrium',
  },
}

function profileRoute(handle = '') {
  return `/profile/${String(handle).replace('@', '')}`
}

function SignalBillboardWall() {
  const signals = previewSocialSignals.slice(0, 6)
  const [active, setActive] = useState(0)
  const signal = signals[active] || signals[0]

  return (
    <section className="platform-action-surface signal-billboard-wall" aria-label="Signals billboard wall">
      <div className="signal-billboard-wall__hero">
        <img src={signal.mediaUrls?.[0]} alt="" />
        <div>
          <LiveIndicator label="BILLBOARD LIVE" />
          <h3>{signal.title}</h3>
          <p>{signal.caption}</p>
          <div className="button-row">
            <ButtonLink to={`/feed#${signal.id}`}>Open Post <ArrowIcon /></ButtonLink>
            <ButtonLink to={profileRoute(signal.entityHandle)} variant="glass">Open Creator</ButtonLink>
          </div>
        </div>
      </div>
      <div className="signal-billboard-wall__screens" aria-label="Billboard signal selector">
        {signals.map((item, index) => (
          <button className={index === active ? 'is-active' : ''} type="button" onClick={() => setActive(index)} key={item.id}>
            <img src={item.mediaUrls?.[0]} alt="" />
            <span>{item.entityName}</span>
            <b>{item.title}</b>
          </button>
        ))}
      </div>
    </section>
  )
}

function ChannelPremiereCalendar() {
  const premieres = previewSocialSignals.slice(1, 7).map((signal, index) => ({
    ...signal,
    time: ['8:00 PM', '9:30 PM', '10:15 PM', '11:00 PM', 'MIDNIGHT', '2:00 AM'][index],
    room: ['Creator Venue', 'Fashion Channel', 'Music Room', 'Fan Wall', 'Private Lounge', 'Aftershow'][index],
  }))

  return (
    <section className="platform-action-surface channel-premiere-calendar" aria-label="Channel premiere calendar">
      <div>
        <LiveIndicator label="TONIGHT ON CHANNELS" />
        <h3>Premieres with doors, screens, and fan walls.</h3>
          <p>Channels present like real creator venues: scheduled drops, screen takeovers, profile routes, and creator-owned rooms instead of plain account cards.</p>
      </div>
      <div>
        {premieres.map((premiere) => (
          <Link to={`/feed#${premiere.id}`} key={premiere.id}>
            <img src={premiere.mediaUrls?.[0]} alt="" />
            <span>{premiere.time} / {premiere.room}</span>
            <b>{premiere.entityName}</b>
            <p>{premiere.title}</p>
            <ArrowIcon />
          </Link>
        ))}
      </div>
    </section>
  )
}

function LiveEventHeat() {
  const [heat, setHeat] = useState(72)
  const fans = socialBotCreators.slice(24, 30)

  return (
    <section className="platform-action-surface live-event-heat" aria-label="Live event fan wall">
      <div>
        <LiveIndicator label="FAN WALL ACTIVE" />
        <h3>Audience energy changes the room.</h3>
        <p>Fan reactions, creator comments, and live-room activity raise a visible heat meter across the broadcast.</p>
        <button className="button" type="button" onClick={() => setHeat((value) => Math.min(100, value + 4))}>Raise The Heat</button>
      </div>
      <div className="live-event-heat__wall">
        <strong>{heat}%</strong>
        <span style={{ '--heat': `${heat}%` }}><i /></span>
        <div>
          {fans.map((fan) => (
            <Link to={profileRoute(fan.handle)} key={fan.id}>
              <img src={fan.avatarUrl} alt="" />
              <b>{fan.displayName}</b>
              <small>{fan.archetype}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function OriginalsPremiereStreet() {
  const posts = previewSocialSignals.slice(6, 10)
  return (
    <section className="platform-action-surface originals-premiere-street" aria-label="Originals premiere street">
      <div>
        <LiveIndicator label="PREMIERE STREET" />
        <h3>Originals launch with posts, fans, and aftershows.</h3>
        <p>The release page behaves like an event: a story points into creator posts, sound, fan edits, red-carpet moments, and Channel routes.</p>
      </div>
      <div>
        {posts.map((post) => (
          <Link to={`/feed#${post.id}`} key={post.id}>
            <img src={post.mediaUrls?.[0]} alt="" />
            <span>{post.postType}</span>
            <b>{post.title}</b>
          </Link>
        ))}
      </div>
    </section>
  )
}

function LabsAdapterBoard() {
  const adapters = [
    ['Upload', 'Media, avatars, banners, thumbnails, and audio storage'],
    ['Assist', 'Caption, polish, prompt, and post-help tools'],
    ['Checkout', 'Static+, Creator Pro, and Static Coins'],
    ['Safety', 'Rights, moderation, reporting, and launch controls'],
  ]

  return (
    <section className="platform-action-surface labs-adapter-board" aria-label="Labs adapter board">
      {adapters.map(([title, copy]) => (
        <article key={title}>
          <SignalMark animated />
          <span>{title}</span>
          <p>{copy}</p>
        </article>
      ))}
    </section>
  )
}

function PlatformActionSurface({ slug }) {
  if (slug === 'signals') return <SignalBillboardWall />
  if (slug === 'channels') return <ChannelPremiereCalendar />
  if (slug === 'live') return <LiveEventHeat />
  if (slug === 'originals') return <OriginalsPremiereStreet />
  if (slug === 'labs') return <LabsAdapterBoard />
  return null
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
          <PreviewStatus detail={`${platform.status} / Live district programming`} />
          </div>
          {content.component}
          <PlatformActionSurface slug={slug} />
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
    ['CREATE', 'Studio', 'Move from viewer to builder with saved projects, concepts, worlds, releases, and future blueprints.', '/studio', `${stats.projects} saves`],
    ['PLAY', 'STATIC PLAY', 'Prompt a world, save the concept, and get used to the venue before it becomes a place in the game.', '/play', `${stats.worlds} worlds`],
    ['LIVE', 'Arena', 'Treat premieres, rooms, events, and performances like places people can enter.', '/live', `${stats.reminders} reminders`],
  ]

  return (
    <section className="discovery-command-rail" aria-label="STATIC discovery command lanes">
      <div className="discovery-command-rail__intro">
        <LiveIndicator label="NETWORK COMMAND" />
        <h2>The feed is not the product. The city is.</h2>
        <p>Discovery pulls people from watching into following, creating, playing, broadcasting, collecting, and returning. Each section works as a web/app destination now and becomes a place people can visit inside the larger STATIC world.</p>
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
          <p>Every piece of entertainment becomes a doorway into a world people can follow, remix, play, collect, and return to.</p>
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
        <p>A clip, post, song, trailer, show, or game idea can become a place with identity, social memory, live energy, and ownership paths.</p>
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

function RadioVoteQueue() {
  const tracks = [
    ['rooftop-hook', 'Ari Nova', 'Rooftop hook test', 'Neon R&B / 2:44', 38],
    ['station-id', 'Cleo Pulse', 'Midnight station ID', 'Voice drop / 0:18', 31],
    ['bassline', 'Juno Black', 'Chrome bassline draft', 'Alt club / 1:52', 26],
    ['afterhours', 'Rome Realm', 'After-hours interview bed', 'Talk bed / 3:10', 19],
  ]
  const [votes, setVotes] = useState(() => Object.fromEntries(tracks.map(([id, , , , count]) => [id, count])))
  const leading = tracks.reduce((winner, item) => votes[item[0]] > votes[winner[0]] ? item : winner, tracks[0])

  return (
    <section className="platform-action-surface radio-vote-queue" aria-label="Radio listener vote queue">
      <div>
        <LiveIndicator label="LISTENER VOTE" />
        <h3>Vote what plays next.</h3>
        <p>The rooftop queue reacts to the room: tracks, station IDs, interviews, and creator uploads move up when listeners push them.</p>
        <strong>{leading[1]} leads the queue</strong>
      </div>
      <div>
        {tracks.map(([id, creator, title, meta]) => (
          <article key={id}>
            <span>{creator}</span>
            <b>{title}</b>
            <small>{meta}</small>
            <button type="button" onClick={() => setVotes((current) => ({ ...current, [id]: current[id] + 1 }))}>
              Vote <em>{votes[id]}</em>
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function PlayReactionKiosk() {
  const concepts = [
    ['racing', 'Velocity Sprint', 'Night racing world', 81],
    ['fantasy', 'Celestial Realms', 'Fantasy raid world', 64],
    ['arena', 'Battle Arena', 'Squad combat world', 72],
    ['city', 'Cyber City', 'Open-world social hub', 88],
  ]
  const [energy, setEnergy] = useState(() => Object.fromEntries(concepts.map(([id, , , level]) => [id, level])))

  return (
    <section className="platform-action-surface play-reaction-kiosk" aria-label="STATIC PLAY crowd reaction kiosk">
      <div>
        <LiveIndicator label="CROWD METER" />
        <h3>The portal reacts before launch.</h3>
        <p>Every world pitch gets audience heat, making PLAY feel like people are gathering around a gate instead of reading a menu.</p>
      </div>
      <div>
        {concepts.map(([id, title, copy]) => (
          <article key={id}>
            <span>{copy}</span>
            <b>{title}</b>
            <div className="play-reaction-kiosk__meter"><i style={{ width: `${energy[id]}%` }} /></div>
            <button type="button" onClick={() => setEnergy((current) => ({ ...current, [id]: Math.min(100, current[id] + 3) }))}>Boost crowd</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function StoreSavedFolder() {
  const items = [
    ['creator-template', 'Creator template pack', 'Profile, billboard, and store-ready layouts'],
    ['radio-pack', 'Radio drop pack', 'Station IDs, tags, and intro beds'],
    ['market-skin', 'Chrome jacket skin', 'Wearable concept for profile and future avatar'],
    ['venue-kit', 'Venue starter kit', 'Screens, lights, signage, and launch assets'],
  ]
  const [saved, setSaved] = useState(['creator-template'])

  return (
    <section className="platform-action-surface store-saved-folder" aria-label="Static Store saved folder">
      <div>
        <LiveIndicator label="SAVED FOLDER" />
        <h3>Save assets before you buy.</h3>
        <p>The Store now behaves like a collection system: save packs, compare creator assets, and keep a clean folder for the work you want to use.</p>
        <strong>{saved.length} saved</strong>
      </div>
      <div>
        {items.map(([id, title, copy]) => {
          const isSaved = saved.includes(id)
          return (
            <article className={isSaved ? 'is-saved' : ''} key={id}>
              <SignalMark animated={isSaved} />
              <span>{isSaved ? 'Saved' : 'Store asset'}</span>
              <b>{title}</b>
              <p>{copy}</p>
              <button type="button" onClick={() => setSaved((current) => isSaved ? current.filter((item) => item !== id) : [...current, id])}>
                {isSaved ? 'Remove' : 'Save'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function StudioCreationStack() {
  const modes = [
    ['caption', 'Caption Assist', 'Turn a rough idea into a post-ready caption.'],
    ['campaign', 'Campaign Builder', 'Package multiple posts around one creator drop.'],
    ['asset', 'Asset Brief', 'Shape a market-ready pack with title, copy, and usage.'],
  ]
  const [mode, setMode] = useState(modes[0][0])
  const selected = modes.find(([id]) => id === mode) || modes[0]

  return (
    <section className="platform-action-surface studio-creation-stack" aria-label="Studio creation stack">
      <div>
        <LiveIndicator label="CREATE STACK" />
        <h3>Create without leaving the network.</h3>
        <p>Studio organizes AI-assisted posting, creator campaigns, asset briefs, and upgrade paths around the same work that appears on STATIC Social.</p>
      </div>
      <div>
        <div className="studio-creation-stack__tabs">
          {modes.map(([id, label]) => (
            <button className={id === mode ? 'is-active' : ''} type="button" onClick={() => setMode(id)} key={id}>{label}</button>
          ))}
        </div>
        <article>
          <span>{selected[1]}</span>
          <b>{selected[2]}</b>
          <p>Start from the feed composer, attach media, use the AI assist, and publish when the post is ready.</p>
          <ButtonLink to="/feed#create-post">Open Composer <ArrowIcon /></ButtonLink>
        </article>
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
        image="/assets/world/city/heroes/static-radio-rooftop-v1-approved.png"
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
          <RadioVoteQueue />
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
        image="/assets/world/city/heroes/static-play-portal-district-v1-approved.png"
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
          <PlayReactionKiosk />
        </div>
      </section>
    </>
  )
}

export function MarketplacePage() {
  const { session, user } = useAuth()
  const stripeCapability = useBackendCapability('stripe')
  const [checkoutStatus, setCheckoutStatus] = useState('')

  async function checkout(product) {
    if (!user) {
      setCheckoutStatus('Log in or create an account before buying Static Coins.')
      return
    }
    setCheckoutStatus('Opening secure checkout...')
    try {
      await startStripeCheckout(session, product)
    } catch (error) {
      setCheckoutStatus(error.message || 'Checkout is not configured yet.')
    }
  }

  return (
    <>
      <RouteSEO path="/marketplace" />
      <PageHero
        compact
        code="STORE//07"
        eyebrow="STATIC STORE"
        title="Buy assets. Build worlds. Carry them forward."
        copy="Preview digital drops, music packs, skins, world templates, character systems, memberships, and creator assets. Static Coins and real purchases unlock after payment, tax, rights, and marketplace safety are connected."
        status="Store preview"
        image="/assets/world/city/heroes/static-market-walk-v1-approved.png"
        imagePosition="center center"
        className="page-hero--marketplace-boulevard"
      />
      <section className="section marketplace-page marketplace-page--active">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow={stripeCapability.validated ? 'STATIC STORE / CHECKOUT READY' : 'STATIC STORE / PREVIEW'} title={stripeCapability.validated ? 'The economy can issue checkout sessions.' : 'The economy starts as intent before transactions.'} copy={stripeCapability.validated ? 'Browse assets, buy Static Coins through secure Stripe checkout, and keep wallet fulfillment tied to the backend ledger.' : 'Browse assets, save what you want, and preview how Static Coins will connect the social app to the future game. Real checkout stays locked until the payment stack is ready.'} />
            <PreviewStatus label={stripeCapability.validated ? 'STRIPE READY' : 'STORE PREVIEW'} detail={stripeCapability.loading ? 'Checking checkout' : stripeCapability.validated ? 'Secure checkout configured' : 'Checkout provider pending'} />
          </div>
          <div className="store-economy-strip" aria-label="Static Store economy plan">
            {[
              ['3 free weekly credits', 'Free accounts start with a small weekly creation allowance.'],
              ['Static+ upgrade', 'More weekly creation credits, larger uploads, and early creator tools.'],
              ['Static Coins', 'Future wallet for assets, creation, boosts, tips, and game-mode purchases.'],
              ['Game carryover', 'Approved creations and purchases are designed to travel into STATIC City.'],
            ].map(([title, copy]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="coin-pack-grid" aria-label="Static Coin packs">
            {[
              ['coins_500', '500 Static Coins', 'Starter creation pack'],
              ['coins_2500', '2,500 Static Coins', 'Creator build pack'],
              ['coins_10000', '10,000 Static Coins', 'World-builder pack'],
            ].map(([product, title, copy]) => (
              <article key={product}>
                <span>Static Coins</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <button className="button button--glass" type="button" onClick={() => checkout(product)}>Buy Pack</button>
              </article>
            ))}
          </div>
          {checkoutStatus && <p className="form-status" role="status">{checkoutStatus}</p>}
          <MarketplaceBrowser />
          <StoreSavedFolder />
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
  const creationTracks = [
    ['3 free weekly assists', 'Create, polish, caption, and post AI work before upgrading.'],
    ['Static+ / $19.99', 'More creation credits, larger uploads, premium templates, and creator tools.'],
    ['Creator Pro / $99.99', 'Advanced campaign systems, coding help, brand kits, assets, and studio workflows.'],
    ['Static Coins', 'Buy credits, unlock assets, and carry owned work into future STATIC worlds.'],
  ]
  const studioModules = [
    ['Image Studio', 'Generate images, posters, covers, product shots, profile art, and campaign visuals.', 'Visual creation'],
    ['Video Studio', 'Make shorts, trailers, cinematic clips, ads, reels, and music-video scenes.', 'Motion creation'],
    ['Music Studio', 'Create songs, hooks, station IDs, voice ideas, audio packs, and creator sound.', 'Audio creation'],
    ['Influencer Studio', 'Build recurring AI creators, brand worlds, post sets, looks, and story arcs.', 'Creator campaigns'],
    ['Asset Studio', 'Design drops, templates, marketplace items, skins, props, and collectible packs.', 'Sellable assets'],
    ['Blueprint Studio', 'Package characters, worlds, venues, vehicles, interiors, and future game-ready concepts.', 'Game carryover'],
  ]

  return (
    <>
      <RouteSEO path="/studio" />
      <PageHero
        compact
        code="Studio"
        eyebrow="STATIC STUDIO"
        title="The creation suite for the AI creator era."
        copy="STATIC Studio is where posts become assets, assets become drops, and drops become worlds. Start with AI-assisted posting now, then expand into images, video, music, campaigns, templates, marketplace items, and game-ready blueprints."
        status="Opening soon"
        image="/assets/static-labs-atrium.png"
        imagePosition="center center"
        className="page-hero--studio-tower"
      />
      <section className="section studio-coming-soon">
        <div className="page-frame studio-coming-soon__grid">
          <article className="studio-coming-soon__lead">
            <LiveIndicator label="CREATE TAB" />
            <h2>Make the work. Post the work. Build your Signal.</h2>
            <p>The Create tab is becoming the place where AI creators make everything they need for STATIC Social: visuals, music, videos, thumbnails, captions, campaigns, templates, drops, and future game blueprints. No separate toolbox. No cold dashboard. One creator suite built into the network.</p>
            <div className="studio-coming-soon__pills" aria-label="Studio preview categories">
              {['Images', 'Video', 'Music', 'Music videos', 'AI influencers', 'Assets', 'Campaigns', 'Game blueprints'].map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="button-row">
              <ButtonLink to="/feed#create-post">Create A Post <ArrowIcon /></ButtonLink>
              <ButtonLink to="/static-plus" variant="glass">View Static+</ButtonLink>
            </div>
          </article>
          <aside className="studio-coming-soon__showcase" aria-label="STATIC Studio coming soon preview">
            <div className="studio-showcase-card studio-showcase-card--main">
              <SignalMark animated />
              <span>STATIC CREATE</span>
              <h3>One prompt can become a post, a song, a video, a drop, or a world.</h3>
              <p>Every creation is designed to live on your profile, earn Signal, sell in the Store, and eventually travel into STATIC City.</p>
            </div>
            <div className="studio-showcase-card">
              <b>3</b>
              <span>Free assists every week</span>
            </div>
            <div className="studio-showcase-card">
              <b>∞</b>
              <span>Upgradeable creator paths</span>
            </div>
          </aside>
          <div className="studio-module-grid" aria-label="STATIC Studio product modules">
            {studioModules.map(([title, copy, status]) => (
              <article key={title}>
                <SignalMark animated />
                <span>{status}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="studio-coming-soon__tracks">
            {creationTracks.map(([title, copy]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <StudioCreationStack />
        </div>
      </section>
    </>
  )
}

export function MembershipPage({ type }) {
  const creator = type === 'creator-pro'
  const { session, user } = useAuth()
  const stripeCapability = useBackendCapability('stripe')
  const [checkoutStatus, setCheckoutStatus] = useState('')
  const features = creator
    ? ['Coding and app prototyping tools', 'Advanced AI workflow adapters', 'Team creation rooms', 'API and automation planning', 'Asset pipeline support', 'Priority engine-workflow access']
    : ['More weekly creation credits', 'Larger uploads', 'Early creator tools', 'Private creator drops', 'Member radio sessions', 'Enhanced network identity']

  async function checkout() {
    if (!user) {
      setCheckoutStatus('Create an account or log in before upgrading to Static+.')
      return
    }
    setCheckoutStatus('Opening secure checkout...')
    try {
      await startStripeCheckout(session, creator ? 'creator_pro' : 'static_plus')
    } catch (error) {
      setCheckoutStatus(error.message || 'Checkout is not configured yet.')
    }
  }

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero
        code={`ACCESS//${creator ? 'PRO' : 'PLUS'}`}
        eyebrow={creator ? 'CREATOR PRO' : 'STATIC+'}
        title={creator ? 'The operator tier for serious builders.' : 'The full STATIC creator suite.'}
        copy={creator ? 'Creator Pro is designed as the $99.99/month builder tier: coding help, advanced workflows, API adapters, automations, team rooms, asset pipelines, release operations, and priority engine-path access.' : 'Static+ is designed as the $19.99/month creation tier: more credits, larger uploads, image tools, video tools, music tools, asset tools, blueprints, and future game-linked perks.'}
        status={stripeCapability.validated ? 'Checkout ready' : 'Payment setup pending'}
      />
      <section className="section membership-page membership-page--premium">
        <div className="page-frame membership-grid">
          <Reveal>
            <Eyebrow>{creator ? 'PRO CREATOR PASS' : 'MEMBER PASS'}</Eyebrow>
            <h2>{creator ? 'A serious system for serious world builders.' : 'More access. More signal. More participation.'}</h2>
            <p>{stripeCapability.validated ? 'Upgrade through secure checkout when you are logged in. Static Coins and subscriptions are wired to the backend economy path.' : 'Join the list now. Checkout activates when the payment provider finishes validation.'}</p>
          </Reveal>
          <Reveal className="membership-card membership-card--premium" delay={100}>
            <div className="console-topbar"><span>{creator ? 'CREATOR PRO' : 'STATIC+'}</span><LiveIndicator label={stripeCapability.validated ? 'CHECKOUT READY' : 'PAYMENT PENDING'} /></div>
            <h3>{creator ? 'PRO PASS' : 'PLUS PASS'}</h3>
            <div className="membership-price">{creator ? '$99.99' : '$19.99'}<span>/ month</span></div>
            <strong>{creator ? 'FOUNDING ACCESS LIST' : 'PLANNED UPGRADE'}</strong>
            {features.map((feature) => <p key={feature}><i />{feature}</p>)}
            <button className="button button--primary" type="button" onClick={checkout}>{creator ? 'Upgrade To Creator Pro' : 'Upgrade To Static+'} <ArrowIcon /></button>
            {checkoutStatus && <small>{checkoutStatus}</small>}
            {!checkoutStatus && <small>{stripeCapability.validated ? 'Stripe checkout is configured. Login is required before purchase.' : creator ? 'Creator Pro checkout opens after Stripe price IDs are connected.' : 'Stripe checkout activates when Static+ price IDs are connected.'}</small>}
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
        image="/assets/world/city/heroes/static-signals-boulevard-v8-final.png"
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
    ['Current data handling', 'STATIC receives information visitors intentionally submit through account creation, login, profile setup, posts, follows, comments, saved items, reports, access requests, and contact forms.'],
    ['Media and AI work', 'Uploaded or posted media may include captions, tool notes, AI-assistance declarations, profile details, and related metadata needed to display and moderate the network.'],
    ['Operations', 'STATIC does not intentionally implement custom advertising or behavioral tracking in this launch build. Hosting, authentication, database, and storage providers may retain standard operational logs.'],
    ['Future services', 'Creation engines, payments, marketplace transactions, live streaming, game clients, and advanced provider workflows will receive updated privacy language before they are opened publicly.'],
    ['Contact', 'Questions about privacy can be directed to thestaticnetwork.com@gmail.com.'],
  ] : [
    ['Network status', 'STATIC Social is the current public product surface. Visitors may browse without an account, but posting, liking, commenting, saving, sharing, reporting, and live actions require a STATIC account.'],
    ['AI-work rule', 'Public posts on STATIC Social are intended for work made by AI or with meaningful AI assistance. Users are responsible for having rights to the media, prompts, captions, and materials they submit.'],
    ['Moderation', 'STATIC may review, limit, remove, or preserve content and account activity when needed for safety, rights, abuse prevention, platform integrity, or legal compliance.'],
    ['Roadmap features', 'Creation tools, marketplace transactions, payments, live streaming, game-world access, and advanced provider integrations are not promised as live until they are explicitly launched.'],
    ['Intellectual property', 'STATIC Network branding, visual design, written copy, original world concepts, and interface concepts are reserved by their respective owner.'],
    ['Changes', 'Formal platform terms will continue to evolve as STATIC Social, creation tools, and future game clients move from controlled rollout into public operation.'],
  ], [privacy])

  return (
    <>
      <RouteSEO path={`/${type}`} />
      <PageHero compact code="LEGAL//PUBLIC" eyebrow={privacy ? 'PRIVACY NOTICE' : 'TERMS OF USE'} title={privacy ? 'Privacy for STATIC Social.' : 'Terms for STATIC Social.'} copy="Plain-language launch information for the current STATIC Social experience." status="UPDATED JUN 2026" />
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
