import { BetaRequestForm } from '../components/Forms'
import { Link, RouteSEO } from '../components/Router'
import { SignalMark } from '../components/UI'

export default function BetaGatePage({ requestedPath = '' }) {
  return (
    <div className="beta-gate">
      <RouteSEO path="/" title="STATIC Network | Private Beta" description="Request private beta access to the future of AI entertainment." />
      <header className="beta-gate__header">
        <Link className="wordmark" to="/" aria-label="STATIC Network private beta">
          <SignalMark animated />
          <span>STATIC</span>
          <small>NETWORK</small>
        </Link>
        <div><i /><span>PRIVATE BETA</span></div>
        <Link to="/login">Operator Login</Link>
      </header>

      <main>
        <section className="beta-gate__hero">
          <div className="beta-gate__image" role="img" aria-label="A gateway into interconnected entertainment worlds" />
          <div className="beta-gate__overlay" />
          <div className="scanlines" />
          <div className="page-frame beta-gate__hero-copy">
            <span>ACCESS//CONTROLLED · BUILD IN PROGRESS</span>
            <h1>The Home of<br /><em>AI Entertainment</em></h1>
            <p className="beta-gate__tagline">Watch it. Hear it. Play it. Create it. Own it.</p>
            <p>STATIC is currently in private beta. We are building a new entertainment network where generated identities, media, worlds, broadcasts, and intelligent creative systems connect.</p>
            <a className="button button--signal" href="#request-beta">Request Beta Access</a>
          </div>
          <div className="beta-gate__status"><span>SIGNAL LOCKED</span><span>FOUNDING ACCESS ONLY</span><span>thestaticnetwork.com</span></div>
        </section>

        <section className="beta-gate__promise">
          <div className="page-frame">
            <div className="beta-gate__section-heading">
              <span>WHAT STATIC IS BECOMING</span>
              <h2>One network.<br />Every format.</h2>
              <p>We are concentrating development on the experiences that make STATIC distinct, and keeping unfinished systems backstage until they are worthy of the public vision.</p>
            </div>
            <div className="beta-gate__pillars">
              <article><span>01 / ENTITIES</span><h3>Identity becomes media.</h3><p>Generated performers, hosts, artists, founders, and characters designed to move across profiles, Channels, Signals, shows, games, and worlds.</p></article>
              <article><span>02 / S.A.G.E.</span><h3>The network talks back.</h3><p>STATIC’s future AI concierge: a believable visual identity, premium voice, guided intelligence, and eventually a live conversational presence.</p></article>
              <article><span>03 / THE NETWORK</span><h3>Entertainment connects.</h3><p>Discovery, creator-owned Channels, Radio, PLAY, Live, Originals, Marketplace, and Studio operating as one system.</p></article>
            </div>
          </div>
        </section>

        <section className="beta-gate__request" id="request-beta">
          <div className="page-frame beta-gate__request-grid">
            <div>
              <span>PRIVATE BETA / REQUEST ACCESS</span>
              <h2>Enter before<br />the signal opens.</h2>
              <p>Request access to the future of AI entertainment. We are prioritizing creators, studios, builders, performers, and early believers who want to shape what STATIC becomes.</p>
              {requestedPath && requestedPath !== '/' && <small>The route you requested is currently restricted to authenticated beta operators.</small>}
            </div>
            <BetaRequestForm />
          </div>
        </section>
      </main>

      <footer className="beta-gate__footer">
        <span>© {new Date().getFullYear()} STATIC Network</span>
        <nav><Link to="/contact">Contact</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link></nav>
        <span>LOS ANGELES / EVERYWHERE</span>
      </footer>
    </div>
  )
}

