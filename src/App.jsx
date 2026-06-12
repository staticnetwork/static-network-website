import { useState } from 'react'

const navItems = [
  ['Signals', '#signals'],
  ['Channels', '#channels'],
  ['Radio', '#radio'],
  ['Play', '#play'],
  ['Originals', '#originals'],
  ['Marketplace', '#marketplace'],
  ['Creators', '#creators'],
]

const platforms = [
  {
    id: 'signals',
    number: '01',
    name: 'STATIC Signals',
    tag: 'Discovery feed',
    description:
      'Discover what is breaking now. Music, videos, game previews, AI characters, trailers, creator drops, and new worlds all begin as signals.',
  },
  {
    id: 'channels',
    number: '02',
    name: 'STATIC Channels',
    tag: 'Creator-owned worlds',
    description:
      'Creator-owned entertainment worlds where artists, storytellers, gamers, and digital creators build their fanbase, content library, and universe.',
  },
  {
    id: 'radio',
    number: '03',
    name: 'STATIC Radio',
    tag: 'Always broadcasting',
    description:
      '24/7 AI-powered stations for music, moods, genres, creators, and digital culture. A living soundtrack that never goes offline.',
  },
  {
    id: 'play',
    number: '04',
    name: 'STATIC PLAY',
    tag: 'Playable imagination',
    description:
      'Create, remix, share, and play AI-generated games. Prompt the game. Build the world. Choose the characters. Set the rules.',
    featured: true,
    line: 'What would you like to play today?',
  },
  {
    id: 'originals',
    number: '05',
    name: 'STATIC Originals',
    tag: 'New-format stories',
    description:
      'AI-native shows, animated series, documentaries, characters, and digital franchises built for the next era of entertainment.',
  },
  {
    id: 'marketplace',
    number: '06',
    name: 'STATIC Marketplace',
    tag: 'Own the culture',
    description:
      'Buy, sell, and trade digital assets, music packs, skins, characters, templates, drops, memberships, and creator-powered experiences.',
  },
  {
    id: 'labs',
    number: '07',
    name: 'STATIC LABS',
    tag: 'Build what comes next',
    description:
      'Creator tools, workflows, templates, and future API systems for building AI-native entertainment worlds.',
  },
]

const playPrompts = [
  'Create a street racing game.',
  'Build a zombie survival world.',
  'Remix a fighting arena.',
  'Turn a song into a playable experience.',
  'Turn a character into a game.',
  'Turn a show into a universe.',
]

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  )
}

function SignalMark() {
  return (
    <span className="signal-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}

function SectionIntro({ eyebrow, title, children, align = 'left' }) {
  return (
    <div className={`section-intro section-intro--${align}`}>
      <p className="eyebrow"><span />{eyebrow}</p>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [formStatus, setFormStatus] = useState('')

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    // TODO: Connect this form to the production waitlist backend or email provider.
    setFormStatus('Thanks — your signal was received. Backend connection coming soon.')
    event.currentTarget.reset()
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header">
        <a className="wordmark" href="#top" onClick={closeMenu} aria-label="STATIC Network home">
          <SignalMark />
          <span>STATIC</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">Toggle navigation</span>
          <i />
          <i />
        </button>

        <nav
          id="primary-navigation"
          className={`primary-nav ${menuOpen ? 'primary-nav--open' : ''}`}
          aria-label="Primary navigation"
        >
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={closeMenu}>{label}</a>
          ))}
        </nav>

        <a className="button button--small header-cta" href="#waitlist">
          Join The Waitlist
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-media" role="img" aria-label="A figure entering a luminous portal surrounded by futuristic screens showing music, games, and cinematic worlds" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-noise" aria-hidden="true" />

          <div className="hero-content">
            <p className="eyebrow hero-eyebrow"><span />AI-NATIVE ENTERTAINMENT NETWORK</p>
            <p className="hero-brand">STATIC <b>Network</b></p>
            <h1 id="hero-title">The Home of<br /><em>AI Entertainment</em></h1>
            <p className="hero-tagline">Watch it. Hear it. Play it.<br />Create it. Own it.</p>
            <p className="hero-copy">
              A new entertainment network where creators, artists, gamers,
              storytellers, and fans build the future of music, shows, games,
              live worlds, and digital culture.
            </p>
            <div className="button-row">
              <a className="button button--primary" href="#waitlist">
                Join The Waitlist <ArrowIcon />
              </a>
              <a className="button button--ghost" href="#network">
                Enter The Network
              </a>
            </div>
            <p className="hero-note">Built for the next generation of creators, fans, and entertainment worlds.</p>
          </div>

          <div className="transmission-status" aria-hidden="true">
            <span>TRANSMISSION 001</span>
            <b><i /> SIGNAL LIVE</b>
            <span>34°03&apos;N / 118°15&apos;W</span>
          </div>
          <a className="scroll-cue" href="#network" aria-label="Scroll to learn about STATIC Network">
            <span>SCROLL TO ENTER</span><i />
          </a>
        </section>

        <section className="manifesto section" id="network">
          <div className="ambient-orb ambient-orb--one" aria-hidden="true" />
          <div className="section-frame">
            <div className="manifesto-index" aria-hidden="true">S/001</div>
            <SectionIntro eyebrow="THE NEW SIGNAL" title="Entertainment Is Changing">
              <p className="lead">
                STATIC Network is not another streaming app, social platform, or content feed.
              </p>
            </SectionIntro>
            <div className="manifesto-copy">
              <p>
                It is a new entertainment network built for the AI era, where a
                song can become a video, a character can become a show, a show can
                become a game, and a creator can turn one idea into an entire world.
              </p>
              <p>
                STATIC gives creators the tools to build, release, share, and
                monetize entertainment across music, video, gaming, live
                experiences, and digital marketplaces.
              </p>
              <strong>This is where ideas become entertainment properties.</strong>
            </div>
          </div>
        </section>

        <section className="platforms section" aria-labelledby="platforms-title">
          <div className="section-frame">
            <SectionIntro eyebrow="THE NETWORK" title="One Network. Every Format." align="center">
              <p>Seven interconnected systems. One place to discover, build, play, and own what comes next.</p>
            </SectionIntro>
            <h2 className="sr-only" id="platforms-title">STATIC Network platforms</h2>
            <div className="platform-grid">
              {platforms.map((platform) => (
                <article
                  className={`platform-card ${platform.featured ? 'platform-card--featured' : ''}`}
                  id={platform.id}
                  key={platform.id}
                >
                  <div className="card-topline">
                    <span>{platform.number}</span>
                    <i />
                    <span>{platform.tag}</span>
                  </div>
                  <h3>{platform.name}</h3>
                  <p>{platform.description}</p>
                  {platform.line && <strong>{platform.line}</strong>}
                  <a href={platform.id === 'play' ? '#play-feature' : '#waitlist'} aria-label={`Explore ${platform.name}`}>
                    Explore <ArrowIcon />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="play-feature section" id="play-feature">
          <div className="play-visual" aria-hidden="true">
            <div className="play-ring play-ring--one" />
            <div className="play-ring play-ring--two" />
            <div className="play-core">
              <SignalMark />
              <span>GENERATING WORLD</span>
            </div>
          </div>
          <div className="section-frame play-layout">
            <div className="play-copy">
              <p className="eyebrow"><span />STATIC PLAY / IMAGINATION ON DEMAND</p>
              <h2>Don&apos;t Choose<br />The Game. <em>Create It.</em></h2>
              <p>
                STATIC PLAY is where gaming becomes imagination on demand.
                Describe the game you want and bring it to life through
                AI-powered tools, remixable templates, and creator-built worlds.
              </p>
              <a className="button button--primary" href="#waitlist">
                Explore STATIC PLAY <ArrowIcon />
              </a>
            </div>
            <div className="prompt-list">
              <p>WHAT WOULD YOU LIKE TO PLAY TODAY?</p>
              {playPrompts.map((prompt, index) => (
                <div key={prompt}>
                  <span>0{index + 1}</span>
                  <b>{prompt}</b>
                  <ArrowIcon />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="audiences section" id="creators">
          <div className="section-frame audience-grid">
            <article className="audience-panel audience-panel--creator">
              <div className="panel-code">C // 01</div>
              <p className="eyebrow"><span />FOR CREATORS</p>
              <h2>Built For The<br /><em>New Creator</em></h2>
              <p>
                STATIC is for creators who do not want to wait for permission.
                Artists. Producers. Writers. Filmmakers. Animators. Game builders.
                AI creators. Digital performers. Storytellers. World builders.
              </p>
              <p>
                Launch ideas, grow audiences, monetize worlds, and build
                entertainment brands from the ground up.
              </p>
              <strong>Stop posting content. Start building worlds.</strong>
              <a className="button button--light" href="#waitlist">Become A Creator <ArrowIcon /></a>
            </article>

            <article className="audience-panel audience-panel--fan">
              <div className="panel-code">F // 02</div>
              <p className="eyebrow"><span />FOR FANS</p>
              <h2>Built For Fans<br /><em>Who Want More</em></h2>
              <p>
                Fans do not just want to watch anymore. They want to discover,
                remix, play, collect, support, participate, and belong.
              </p>
              <p>
                Follow creators, enter worlds, play games, join live experiences,
                unlock drops, and become part of the signal before everyone else.
              </p>
              <strong>Find what&apos;s next before it becomes mainstream.</strong>
              <a className="button button--ghost" href="#waitlist">Join The Waitlist <ArrowIcon /></a>
            </article>
          </div>
        </section>

        <section className="why-now section">
          <div className="why-lines" aria-hidden="true" />
          <div className="section-frame why-layout">
            <SectionIntro eyebrow="WHY NOW" title="The Future Is No Longer Passive">
              <p>
                The old entertainment system was built around gatekeepers.
                STATIC is built around creators, fans, AI tools, digital ownership,
                and cultural momentum.
              </p>
            </SectionIntro>
            <blockquote>
              <p>The next major entertainment franchise may not start in Hollywood.</p>
              <div>
                <span>It may start as</span>
                <b>A SONG.</b>
                <b>A PROMPT.</b>
                <b>A CHARACTER.</b>
                <b>A GAME.</b>
                <b>A SIGNAL.</b>
              </div>
              <strong>And when it does, STATIC is where it can grow.</strong>
            </blockquote>
          </div>
        </section>

        <section className="waitlist section" id="waitlist">
          <div className="section-frame waitlist-layout">
            <div className="waitlist-copy">
              <p className="eyebrow"><span />EARLY ACCESS / TRANSMISSION 001</p>
              <h2>Join<br />The <em>Signal.</em></h2>
              <p>
                Be first to enter STATIC Network as we build the home of AI
                entertainment.
              </p>
              <div className="waitlist-stats" aria-label="Waitlist status">
                <span><b>01</b> EARLY ACCESS</span>
                <span><b>02</b> CREATOR DROPS</span>
                <span><b>03</b> PRIVATE SIGNALS</span>
              </div>
            </div>

            <form className="waitlist-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" autoComplete="name" placeholder="Your name" required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@email.com" required />
              </div>
              <fieldset>
                <legend>I am a</legend>
                <div className="role-options">
                  {['Creator', 'Fan', 'Both'].map((role) => (
                    <label key={role}>
                      <input type="radio" name="role" value={role.toLowerCase()} required />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="button button--primary button--submit" type="submit">
                Request Access <ArrowIcon />
              </button>
              <p className="form-note">No spam. Only transmissions that matter.</p>
              <p className="form-status" role="status" aria-live="polite">{formStatus}</p>
            </form>
          </div>
        </section>

        <section className="final-cta section">
          <div className="final-portal" aria-hidden="true" />
          <div className="section-frame final-content">
            <p className="eyebrow"><span />TRANSMISSION ACTIVE</p>
            <h2>The Signal<br /><em>Is Live.</em></h2>
            <p>STATIC Network is building the home of AI entertainment.</p>
            <div className="final-lines">
              <span>For creators ready to build.</span>
              <span>For fans ready to discover.</span>
              <span>For players ready to create.</span>
              <span>For storytellers ready to stop waiting.</span>
            </div>
            <strong>Watch it. Hear it. Play it. Create it. Own it.</strong>
            <div className="button-row">
              <a className="button button--primary" href="#waitlist">Join The Waitlist <ArrowIcon /></a>
              <a className="button button--ghost" href="#creators">Become A Creator</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <a className="wordmark wordmark--footer" href="#top">
              <SignalMark /><span>STATIC</span>
            </a>
            <p>The Home of AI Entertainment</p>
          </div>
          <div className="footer-links">
            <p>NETWORK</p>
            <a href="#network">About</a>
            <a href="#creators">Creators</a>
            <a href="#play-feature">STATIC PLAY</a>
            <a href="#marketplace">Marketplace</a>
          </div>
          <div className="footer-links">
            <p>INFO</p>
            <a href="mailto:hello@thestaticnetwork.com">Contact</a>
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
          </div>
          <div className="footer-links">
            <p>SOCIAL</p>
            <a href="#instagram">Instagram</a>
            <a href="#tiktok">TikTok</a>
            <a href="#youtube">YouTube</a>
            <a href="#x">X</a>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} STATIC Network</span>
          <span><i /> SIGNAL STATUS: LIVE</span>
          <span>thestaticnetwork.com</span>
        </div>
      </footer>
    </div>
  )
}

export default App
