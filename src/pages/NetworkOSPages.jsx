import { useEffect, useState } from 'react'
import { AvatarStudio } from '../components/AvatarSystem'
import { ChannelCustomizer } from '../components/ChannelCustomizer'
import { EntityFeed } from '../components/FeedSystem'
import { LiveSignalFeed } from '../components/NetworkDemos'
import { Link, RouteSEO } from '../components/Router'
import { ArrowIcon, ButtonLink, LiveIndicator, PageHero, SignalMark } from '../components/UI'
import { getCurrentEntity, getNetworkStats, subscribeToNetworkUpdates } from '../lib/staticStore'

export function FeedPage({ signalsMode = false, followedOnly = false }) {
  const [stats, setStats] = useState(() => getNetworkStats())
  useEffect(() => subscribeToNetworkUpdates(() => setStats(getNetworkStats())), [])
  const path = followedOnly ? '/my-signal' : signalsMode ? '/signals' : '/feed'
  const feedMode = followedOnly || signalsMode
  const heroImage = signalsMode
    ? '/assets/static-signals-boulevard.png'
    : followedOnly
      ? '/assets/static-discover-hub.png'
      : '/assets/static-channels-district.png'
  const heroClassName = signalsMode
    ? 'page-hero--signals-boulevard'
    : followedOnly
      ? 'page-hero--discover-hub'
      : 'page-hero--channels-district'

  return (
    <>
      <RouteSEO path={path} />
      <PageHero
        compact
        code={followedOnly ? 'DISTRICT//MY-SIGNAL' : signalsMode ? 'BOULEVARD//01' : 'DISTRICT//FEED'}
        eyebrow={followedOnly ? 'MY SIGNAL' : signalsMode ? 'STATIC SIGNALS' : 'ENTITY DISTRICT FEED'}
        title={followedOnly ? 'Your followed venues, one pulse.' : signalsMode ? 'Catch the signal before it hits the street.' : 'Entities are taking the floor.'}
        copy={followedOnly ? 'A personal feed built from the Channels, Entities, creators, and venues you choose to follow inside the district.' : 'Humans build backstage. Public posts, media, worlds, releases, and live announcements arrive through their Entities.'}
        status={followedOnly ? 'PERSONAL PULSE ONLINE' : 'BOULEVARD LIVE'}
        image={heroImage}
        imagePosition="center center"
        className={heroClassName}
      >
        <div className="button-row">
          <ButtonLink to={followedOnly ? '/discover' : '/studio'}>{followedOnly ? 'Discover Venues' : 'Open Studio'} <ArrowIcon /></ButtonLink>
          <ButtonLink to={followedOnly ? '/signals' : '/entities'} variant="glass">{followedOnly ? 'Public Signals' : 'Entity Atelier'}</ButtonLink>
        </div>
      </PageHero>
      <section className="section feed-page">
        <div className="page-frame">
          <div className="signal-pulse-panel">
            {[
              ['Public Signals', stats.publicSignals],
              ['Entities', stats.entities],
              ['Follows', stats.follows],
              ['Saved Projects', stats.projects],
              ['Worlds', stats.worlds],
            ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
          </div>
          {feedMode ? <LiveSignalFeed searchable followedOnly={followedOnly} /> : <EntityFeed />}
        </div>
      </section>
    </>
  )
}

export function AvatarPage() {
  const [entity, setEntity] = useState(() => getCurrentEntity())
  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  if (!entity) return <MissingWorkspace title="No Entity is ready for visual customization." />

  return (
    <>
      <RouteSEO path="/entities/avatar" />
      <section className="workspace-intro">
        <div className="broadcast-grid" />
        <div className="page-frame"><LiveIndicator label="VISUAL ATELIER ONLINE" /><span>ENTITY//AVATAR//CREATOR</span><h1>Build the face of the venue.</h1><p>Shape one reusable identity for profile cards, posts, Channels, live broadcasts, and future worlds.</p></div>
      </section>
      <section className="section avatar-page"><div className="page-frame"><AvatarStudio entity={entity} onSave={setEntity} /></div></section>
    </>
  )
}

export function ChannelCustomizePage() {
  const [entity, setEntity] = useState(() => getCurrentEntity())
  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  if (!entity) return <MissingWorkspace title="Create an Entity before designing its Channel." />

  return (
    <>
      <RouteSEO path="/channel/customize" />
      <section className="workspace-intro">
        <div className="broadcast-grid" />
        <div className="page-frame"><LiveIndicator label="VENUE DESIGN ONLINE" /><span>CHANNEL//IDENTITY//WORLD</span><h1>Turn the profile into a destination.</h1><p>Control the banner, identity, theme, layout, company presence, and public story behind {entity.name}.</p></div>
      </section>
      <section className="section channel-customize-page"><div className="page-frame"><ChannelCustomizer entity={entity} onSave={setEntity} /></div></section>
    </>
  )
}

function MissingWorkspace({ title }) {
  return (
    <section className="entity-missing">
      <div className="broadcast-grid" />
      <div><SignalMark animated /><LiveIndicator label="ENTITY CORE REQUIRED" /><h1>{title}</h1><p>The visual and social systems activate as soon as the first public identity is initialized.</p><Link className="button button--primary" to="/entities/create">Create Entity <ArrowIcon /></Link></div>
    </section>
  )
}
