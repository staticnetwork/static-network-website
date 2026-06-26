import { useEffect, useState } from 'react'
import { platforms } from '../data/network'
import { channelWorlds, marketDrops } from '../data/media'
import { WaitlistForm } from '../components/Forms'
import { EntityActionHub, EntityCard } from '../components/EntitySystem'
import {
  BroadcastDeck,
  ChannelGallery,
  HeroMediaWall,
  LiveSignalFeed,
  MarketplaceBrowser,
  PlayGenerator,
  RadioPlayer,
  StudioCreator,
} from '../components/NetworkDemos'
import { Link, RouteSEO } from '../components/Router'
import PremiumMotionLayer from '../components/PremiumMotionLayer'
import {
  ArrowIcon,
  ButtonLink,
  Eyebrow,
  LiveIndicator,
  Reveal,
  SectionHeading,
  SignalMark,
} from '../components/UI'
import { getCurrentEntity, subscribeToNetworkUpdates } from '../lib/staticStore'

const atlasStats = [
  ['01', 'Island city core'],
  ['03', 'mainland mega-regions'],
  ['SEA / AIR', 'STATIC Island access'],
  ['YELLOWSTONE', 'max property scale'],
]

const atlasRegions = [
  {
    name: 'STATIC City',
    label: 'Water-surrounded core',
    copy: 'The central social, creator, entertainment, marketplace, venue, sports, radio, and prompt-station city.',
    route: '/',
  },
  {
    name: 'The Desert Fields',
    label: 'El Mirage / open land',
    copy: 'Sahara-scale build terrain for festivals, racing, factions, desert compounds, and user-made worlds.',
    route: '/marketplace',
  },
  {
    name: 'The Forest Fields',
    label: 'Amazon-scale ownership',
    copy: 'Dense terrain for ranches, hidden bases, survival paths, retreats, land empires, and creator ecosystems.',
    route: '/discover',
  },
  {
    name: 'The Snow Fields',
    label: 'Everest-scale frontier',
    copy: 'Mountain territory for prestige builds, faction strongholds, winter events, and high-risk land expansion.',
    route: '/play',
  },
  {
    name: 'STATIC Island',
    label: 'Sea or air only',
    copy: 'A private island culture zone: yacht arrivals, luau nightlife, founder estate, elite hospitality, and vacation energy.',
    route: '/waitlist',
  },
  {
    name: 'Buy Land. Build Worlds.',
    label: 'The Fields thesis',
    copy: 'STATIC builds the core. Players, creators, and crews expand the world with owned land, assets, businesses, and stories.',
    route: '/static-plus',
  },
]

export default function HomePage() {
  const [entity, setEntity] = useState(() => getCurrentEntity())

  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  const entityPreview = entity || {
    name: 'YOUR ENTITY',
    handle: '@origin.signal',
    role: 'PUBLIC IDENTITY',
    genre: 'EVERY FORMAT',
    company: 'YOUR WORLD',
    channelTagline: 'One identity across the entire network.',
    visualStyle: 'Cinematic',
  }

  return (
    <>
      <RouteSEO
        path="/home"
        title="STATIC Network | Public Network Preview"
        description="Explore the STATIC Network public site, creator systems, preview interfaces, and the path from Arrival District into STATIC City."
      />
      <section className="home-hero home-hero--network">
        <div className="home-hero__media" role="img" aria-label="A cinematic STATIC entertainment district at night with venues, creators, billboards, and fans arriving" />
        <div className="home-hero__veil" />
        <div className="broadcast-grid" />
        <div className="scanlines" />
        <PremiumMotionLayer variant="home" density="rich" />
        <HeroMediaWall />
        <div className="page-frame home-hero__content">
          <div className="network-boot">
            <span>ARRIVAL DISTRICT</span><i /><span>CLUBSTATIC LIVE</span><i /><span>ROOFTOP ACCESS</span>
          </div>
          <div className="hero-channel">
            <LiveIndicator label="DISTRICT LIVE" />
            <span>AI-NATIVE ENTERTAINMENT CITY</span>
          </div>
          <p className="hero-kicker">STATIC NETWORK / ARRIVE CONNECT LIVE</p>
          <h1>Arrive.<br /><em>Connect. Live.</em></h1>
          <p className="hero-tagline">The Home of AI Entertainment</p>
          <p className="hero-copy">
            The web access layer for a city-scale entertainment world where creators, fans,
            Entities, music, games, broadcasts, drops, and AI-native worlds meet after dark.
          </p>
          <div className="button-row">
            <ButtonLink to="/">Enter Arrival District <ArrowIcon /></ButtonLink>
            <ButtonLink to={entity ? '/entities/profile' : '/entities/generate'} variant="glass">{entity ? 'View Your Entity' : 'Generate An Entity'}</ButtonLink>
          </div>
        </div>
        <div className="hero-telemetry">
          <span>MAIN ENTRANCE</span>
          <SignalMark animated />
          <span>CLUBSTATIC / ROOFTOP / VIP</span>
          <span>VENUES LIGHTING UP</span>
        </div>
      </section>

      <div className="page-frame home-broadcast-wrap">
        <BroadcastDeck />
      </div>

      <section className="section world-atlas-section">
        <div className="page-frame world-atlas">
          <div className="world-atlas__copy">
            <LiveIndicator label="WORLD ATLAS LOCKED" />
            <p className="eyebrow"><span />STATIC CITY / THE FIELDS / STATIC ISLAND</p>
            <h2>One core city.<br /><em>Limitless land around it.</em></h2>
            <p>
              STATIC City is the social and entertainment core. Three massive mainland regions connect
              by bridge and tunnel: Desert, Forest, and Snow. STATIC Island sits offshore with no bridge,
              accessible only by sea or air.
            </p>
            <div className="world-atlas__stats">
              {atlasStats.map(([value, label]) => (
                <span key={label}><b>{value}</b>{label}</span>
              ))}
            </div>
            <div className="button-row">
              <ButtonLink to="/">Enter Arrival District <ArrowIcon /></ButtonLink>
              <ButtonLink to="/waitlist" variant="glass">Request City Access</ButtonLink>
            </div>
          </div>
          <div className="world-atlas__map">
            <PremiumMotionLayer variant="atlas" density="quiet" />
            <img src="/assets/world/city/heroes/static-fields-macro-map-v3-three-regions-island.png" alt="STATIC City macro map showing the island core, Desert Fields, Forest Fields, Snow Fields, and offshore STATIC Island" />
            <div className="world-atlas__legend">
              <span><i />STATIC City</span>
              <span><i />The Fields</span>
              <span><i />STATIC Island</span>
            </div>
          </div>
          <div className="world-atlas__regions">
            {atlasRegions.map((region, index) => (
              <Reveal as="article" delay={(index % 3) * 60} key={region.name}>
                <Link to={region.route}>
                  <span>{region.label}</span>
                  <h3>{region.name}</h3>
                  <p>{region.copy}</p>
                  <ArrowIcon />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-entity-engine">
        <div className="page-frame">
          <div className="home-entity-engine__copy">
            <LiveIndicator label={entity ? 'YOUR ENTITY ONLINE' : 'ORIGIN SLOT OPEN'} />
            <p className="eyebrow"><span />ENTITY-FIRST SOCIAL ENTERTAINMENT</p>
            <h2>Create The Entity.<br /><em>Build The World.</em></h2>
            <p>On STATIC, your public identity begins with an Entity: a digital performer, creator, host, artist, gamer, influencer, founder, or character built to live across Signals, Channels, Radio, Live, Originals, PLAY, and Marketplace.</p>
            <div className="entity-engine-flow">
              <span>01 CREATE IDENTITY</span><i /><span>02 LAUNCH CHANNEL</span><i /><span>03 TRANSMIT SIGNALS</span>
            </div>
            <div className="button-row">
              <ButtonLink to={entity ? '/entities/profile' : '/entities/generate'}>{entity ? 'View Your Entity' : 'Generate The First Entity'} <ArrowIcon /></ButtonLink>
              <ButtonLink to="/entities" variant="glass">Explore Entity Network</ButtonLink>
            </div>
          </div>
          <div className="home-entity-engine__visual">
            <div className="entity-network-labels"><span>ENTITY ONLINE</span><span>LIVE FEED</span><span>CHANNEL ACTIVE</span></div>
            <EntityCard entity={entityPreview} preview={!entity} />
          </div>
          {entity && <div className="home-entity-engine__actions"><EntityActionHub entity={entity} compact onEntityChange={setEntity} /></div>}
        </div>
      </section>

      <section className="section network-feed-section">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow="LIVE SIGNAL FEED"
              title="Entities are transmitting."
              copy="Entity posts, uploads, drops, worlds, broadcasts, films, and playable ideas arriving across STATIC."
            />
            <ButtonLink to="/signals" variant="glass">Open Full Feed <ArrowIcon /></ButtonLink>
          </div>
          <LiveSignalFeed limit={6} />
        </div>
      </section>

      <section className="section systems-section systems-section--premium">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow="THE STATIC NETWORK"
            title="Eight systems. One expanding city."
            copy="Eight interconnected systems. One place to discover, build, play, broadcast, and own what comes next."
            />
            <span className="system-count">08<br /><small>CORE SYSTEMS</small></span>
          </div>
          <div className="systems-grid systems-grid--media">
            {platforms.map((platform, index) => (
              <Reveal as="article" className={`system-card system-card--${platform.tone}`} delay={(index % 4) * 55} key={platform.slug}>
                <div className="system-card__top">
                  <span>{platform.number}</span>
                  <LiveIndicator label={platform.status} />
                </div>
                <div className="system-card__visual">
                  <i /><i /><i />
                  <SignalMark animated={index === 2 || index === 4} />
                </div>
                <div>
                  <p>{platform.label}</p>
                  <h3>{platform.name}</h3>
                  <span>{platform.description}</span>
                </div>
                <Link to={`/${platform.slug}`} aria-label={`Explore ${platform.name}`}>
                  Enter system <ArrowIcon />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section product-stage product-stage--play">
        <div className="page-frame">
          <div className="product-stage__heading">
            <div>
              <Eyebrow>STATIC PLAY / LIVE PROTOTYPE</Eyebrow>
              <h2>Describe the world.<br />Watch the arcade light up.</h2>
            </div>
            <p>Run the preview generation sequence and see a playable-world concept form from your prompt.</p>
          </div>
          <PlayGenerator compact />
        </div>
      </section>

      <section className="section product-stage product-stage--radio">
        <div className="page-frame">
          <div className="product-stage__heading">
            <div>
              <Eyebrow>STATIC RADIO / ALWAYS ON</Eyebrow>
              <h2>Tune into the<br />world behind the screen.</h2>
            </div>
            <ButtonLink to="/radio" variant="glass">Enter Radio <ArrowIcon /></ButtonLink>
          </div>
          <RadioPlayer mini />
        </div>
      </section>

      <section className="section product-stage product-stage--studio">
        <div className="page-frame">
          <div className="product-stage__heading">
            <div>
              <Eyebrow>STATIC STUDIO / CREATOR OS</Eyebrow>
              <h2>Your creation tower.<br />Every format.</h2>
            </div>
            <p>Move between song, film, character, game, world, and drop from the same creator command floor. The prompt stations come first; the city traversal layer comes next.</p>
          </div>
          <StudioCreator mini />
        </div>
      </section>

      <section className="section channel-preview-section">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow="CREATOR-OWNED WORLDS"
              title="The Entity gets the Channel."
              copy={`${channelWorlds.length} network worlds demonstrate how one public identity can carry music, games, film, live programming, drops, and story.`}
            />
            <ButtonLink to="/channels" variant="glass">Explore Channels <ArrowIcon /></ButtonLink>
          </div>
          <ChannelGallery limit={5} />
        </div>
      </section>

      <section className="section home-market-section">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow="STATIC MARKETPLACE"
              title="Take part of the world with you."
              copy={`${marketDrops.length} network drops demonstrate how music, worlds, characters, templates, skins, and access can move through STATIC.`}
            />
            <ButtonLink to="/marketplace" variant="glass">Open Marketplace <ArrowIcon /></ButtonLink>
          </div>
          <MarketplaceBrowser limit={3} />
        </div>
      </section>

      <section className="section home-waitlist home-waitlist--premium">
        <div className="access-orbit" aria-hidden="true"><i /><i /><i /></div>
        <div className="page-frame waitlist-layout">
          <Reveal>
            <LiveIndicator label="PRIVATE BETA ACCESS" />
            <h2>Request your<br /><em>city pass.</em></h2>
            <p>Join the access list for creator pilots, early releases, private venues, and first-look network testing as STATIC City opens in controlled phases.</p>
            <div className="access-points"><span>CREATOR ACCESS</span><span>PRIVATE VENUES</span><span>FOUNDING DROPS</span></div>
          </Reveal>
          <Reveal delay={120}>
            <WaitlistForm compact />
          </Reveal>
        </div>
      </section>

      <section className="section final-call final-call--premium">
        <div className="final-call__signal" aria-hidden="true" />
        <div className="page-frame">
          <LiveIndicator label="THE SIGNAL IS LIVE" />
          <h2>The city is<br />starting to open.</h2>
          <p>Watch it. Hear it. Play it. Create it. Own it.</p>
          <div className="button-row">
            <ButtonLink to="/">Enter Arrival District <ArrowIcon /></ButtonLink>
            <ButtonLink to="/studio" variant="glass">Open Creator Studio</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
