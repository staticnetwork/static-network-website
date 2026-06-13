import { platforms, signals } from '../data/network'
import { Link, RouteSEO } from '../components/Router'
import {
  ArrowIcon,
  ButtonLink,
  Eyebrow,
  LiveIndicator,
  Reveal,
  SectionHeading,
  SignalCard,
  SignalMark,
} from '../components/UI'
import { WaitlistForm } from '../components/Forms'

export default function HomePage() {
  return (
    <>
      <RouteSEO path="/" />
      <section className="home-hero">
        <div className="home-hero__media" role="img" aria-label="A figure entering a luminous portal surrounded by future entertainment worlds" />
        <div className="home-hero__veil" />
        <div className="broadcast-grid" />
        <div className="scanlines" />
        <div className="page-frame home-hero__content">
          <div className="hero-channel">
            <LiveIndicator label="TRANSMISSION 001" />
            <span>AI-NATIVE ENTERTAINMENT NETWORK</span>
          </div>
          <p className="hero-kicker">STATIC NETWORK PRESENTS</p>
          <h1>The Home of<br /><em>AI Entertainment</em></h1>
          <p className="hero-tagline">Watch it. Hear it. Play it. Create it. Own it.</p>
          <p className="hero-copy">
            A new entertainment network where creators and audiences build the future
            of music, shows, games, live worlds, and digital culture.
          </p>
          <div className="button-row">
            <ButtonLink to="/waitlist">Join The Waitlist <ArrowIcon /></ButtonLink>
            <ButtonLink to="/discover" variant="ghost">Enter The Network</ButtonLink>
            <ButtonLink to="/studio" variant="quiet">Open Studio Preview</ButtonLink>
          </div>
        </div>
        <div className="hero-telemetry">
          <span>NODE 34.05</span>
          <SignalMark animated />
          <span>UPLINK STABLE</span>
        </div>
      </section>

      <section className="identity-section section">
        <div className="page-frame identity-grid">
          <Reveal>
            <Eyebrow>WHAT IS STATIC?</Eyebrow>
            <h2>One idea.<br />Every format.</h2>
          </Reveal>
          <Reveal className="identity-copy" delay={120}>
            <p>
              STATIC Network is not another streaming service, social feed, or creator
              tool. It is the connective tissue between them.
            </p>
            <p>
              A song can become a film. A character can become a channel. A show can
              become a game. A live broadcast can become a world people own a piece of.
            </p>
            <strong>This is where ideas become entertainment systems.</strong>
          </Reveal>
        </div>
      </section>

      <section className="section systems-section">
        <div className="page-frame">
          <SectionHeading
            eyebrow="THE NETWORK / 8 SYSTEMS"
            title="One Network. Every Format."
            copy="Eight interconnected systems. One place to discover, build, play, broadcast, and own what comes next."
          />
          <div className="systems-grid">
            {platforms.map((platform, index) => (
              <Reveal as="article" className={`system-card system-card--${platform.tone}`} delay={(index % 4) * 55} key={platform.slug}>
                <div className="system-card__top">
                  <span>{platform.number}</span>
                  <LiveIndicator label={platform.status} />
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

      <section className="section current-signals">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading
              eyebrow="CURRENT TRANSMISSIONS"
              title="The signal is moving."
              copy="A preview of what discovery feels like across the network."
            />
            <ButtonLink to="/signals" variant="ghost">View All Signals <ArrowIcon /></ButtonLink>
          </div>
          <div className="signal-grid">
            {signals.slice(0, 3).map((item, index) => (
              <SignalCard item={item} index={index} key={item.code} />
            ))}
          </div>
        </div>
      </section>

      <section className="section play-banner">
        <div className="play-banner__rings" aria-hidden="true"><i /><i /><i /></div>
        <div className="page-frame play-banner__layout">
          <Reveal className="play-banner__copy">
            <Eyebrow>STATIC PLAY / IMAGINATION ON DEMAND</Eyebrow>
            <h2>What would you like<br />to play today?</h2>
            <p>
              Create, remix, share, and play AI-generated games and interactive
              worlds by describing what you want.
            </p>
            <ButtonLink to="/play">Open PLAY Preview <ArrowIcon /></ButtonLink>
          </Reveal>
          <Reveal className="prompt-console" delay={120}>
            <div className="console-topbar">
              <span>WORLD PROMPT</span>
              <span>ENGINE//PREVIEW</span>
            </div>
            <div className="prompt-console__input">
              <span>&gt;</span>
              <p>Create a rain-soaked street racing world where the city changes every lap.</p>
            </div>
            <div className="prompt-tags">
              <span>RACING</span><span>CYBERPUNK</span><span>MULTIPLAYER</span>
            </div>
            <button type="button" disabled>GENERATION REQUIRES FUTURE ENGINE</button>
          </Reveal>
        </div>
      </section>

      <section className="audience-section">
        <article>
          <Reveal>
            <span>C//CREATORS</span>
            <h2>Stop posting content.<br /><em>Start building worlds.</em></h2>
            <p>Build across formats, release directly, grow an audience, and turn ideas into durable entertainment properties.</p>
            <ButtonLink to="/creators" variant="light">Explore Creators <ArrowIcon /></ButtonLink>
          </Reveal>
        </article>
        <article>
          <Reveal>
            <span>F//FANS</span>
            <h2>Do more than watch.<br /><em>Enter the signal.</em></h2>
            <p>Discover early, follow worlds, join broadcasts, play releases, collect drops, and shape what grows next.</p>
            <ButtonLink to="/discover" variant="ghost">Start Discovering <ArrowIcon /></ButtonLink>
          </Reveal>
        </article>
      </section>

      <section className="section why-section">
        <div className="page-frame why-grid">
          <Reveal>
            <Eyebrow>WHY NOW?</Eyebrow>
            <h2>The future is no longer passive.</h2>
            <p>
              Creation tools are accelerating. Audiences expect participation.
              Formats are collapsing into each other. The old map no longer fits the territory.
            </p>
          </Reveal>
          <Reveal className="why-statement" delay={120}>
            <p>The next major entertainment franchise may begin as</p>
            <div><span>A SONG</span><span>A PROMPT</span><span>A CHARACTER</span><span>A SIGNAL</span></div>
            <strong>STATIC is where it can become a world.</strong>
          </Reveal>
        </div>
      </section>

      <section className="section home-waitlist">
        <div className="page-frame waitlist-layout">
          <Reveal>
            <Eyebrow>EARLY ACCESS / TRANSMISSION 001</Eyebrow>
            <h2>Join<br />the signal.</h2>
            <p>Be first to enter STATIC Network as the public network and creator tools come online.</p>
          </Reveal>
          <Reveal delay={120}>
            <WaitlistForm compact />
          </Reveal>
        </div>
      </section>

      <section className="section final-call">
        <div className="final-call__signal" aria-hidden="true" />
        <div className="page-frame">
          <LiveIndicator label="TRANSMISSION ACTIVE" />
          <h2>Build what<br />comes next.</h2>
          <p>Watch it. Hear it. Play it. Create it. Own it.</p>
          <div className="button-row">
            <ButtonLink to="/waitlist">Request Access <ArrowIcon /></ButtonLink>
            <ButtonLink to="/studio" variant="ghost">Enter STATIC Studio</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
