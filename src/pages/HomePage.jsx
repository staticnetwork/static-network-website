import { platforms } from '../data/network'
import { channelWorlds, marketDrops } from '../data/media'
import { WaitlistForm } from '../components/Forms'
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
import {
  ArrowIcon,
  ButtonLink,
  Eyebrow,
  LiveIndicator,
  Reveal,
  SectionHeading,
  SignalMark,
} from '../components/UI'

export default function HomePage() {
  return (
    <>
      <RouteSEO path="/" />
      <section className="home-hero home-hero--network">
        <div className="home-hero__media" role="img" aria-label="A figure entering a luminous portal surrounded by future entertainment worlds" />
        <div className="home-hero__veil" />
        <div className="broadcast-grid" />
        <div className="scanlines" />
        <HeroMediaWall />
        <div className="page-frame home-hero__content">
          <div className="network-boot">
            <span>STATIC OS</span><i /><span>NETWORK ONLINE</span><i /><span>NODE 001</span>
          </div>
          <div className="hero-channel">
            <LiveIndicator label="NOW TRANSMITTING" />
            <span>AI-NATIVE ENTERTAINMENT NETWORK</span>
          </div>
          <p className="hero-kicker">STATIC NETWORK / PUBLIC SIGNAL</p>
          <h1>The Home of<br /><em>AI Entertainment</em></h1>
          <p className="hero-tagline">Watch it. Hear it. Play it. Create it. Own it.</p>
          <p className="hero-copy">
            One living network for music, shows, games, broadcasts, creators,
            characters, worlds, and the audiences entering them.
          </p>
          <div className="button-row">
            <ButtonLink to="/discover">Enter The Network <ArrowIcon /></ButtonLink>
            <ButtonLink to="/waitlist" variant="glass">Request Access</ButtonLink>
          </div>
        </div>
        <div className="hero-telemetry">
          <span>UPLINK 100%</span>
          <SignalMark animated />
          <span>34.0522 / -118.2437</span>
          <span>14 CHANNELS ACTIVE</span>
        </div>
      </section>

      <div className="page-frame home-broadcast-wrap">
        <BroadcastDeck />
      </div>

      <section className="section network-feed-section">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow="LIVE SIGNAL FEED"
              title="The network is moving."
              copy="Drops, worlds, broadcasts, characters, films, and playable ideas arriving from across STATIC."
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
              title="Eight systems. One living world."
              copy="Discover, build, play, broadcast, release, and own across an interconnected entertainment network."
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
              <h2>Describe the world.<br />Watch it come online.</h2>
            </div>
            <p>Run the simulated generation sequence and see a local playable-world concept form from your prompt.</p>
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
              <h2>One command center.<br />Every format.</h2>
            </div>
            <p>Move between song, film, character, game, world, and drop without leaving the creative signal.</p>
          </div>
          <StudioCreator mini />
        </div>
      </section>

      <section className="section channel-preview-section">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow="CREATOR-OWNED WORLDS"
              title="Not profiles. Destinations."
              copy={`${channelWorlds.length} demo channels are transmitting across music, games, film, entities, and studio worlds.`}
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
            <h2>Enter the<br /><em>next signal.</em></h2>
            <p>Join the access list for creator pilots, early releases, private transmissions, and network testing.</p>
            <div className="access-points"><span>CREATOR ACCESS</span><span>EARLY TRANSMISSIONS</span><span>PRIVATE NETWORK DROPS</span></div>
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
          <h2>This is where<br />entertainment goes next.</h2>
          <p>Watch it. Hear it. Play it. Create it. Own it.</p>
          <div className="button-row">
            <ButtonLink to="/discover">Enter STATIC <ArrowIcon /></ButtonLink>
            <ButtonLink to="/studio" variant="glass">Open Creator Studio</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
