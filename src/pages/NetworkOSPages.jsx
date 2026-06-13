import { useEffect, useState } from 'react'
import { AvatarStudio } from '../components/AvatarSystem'
import { ChannelCustomizer } from '../components/ChannelCustomizer'
import { EntityFeed } from '../components/FeedSystem'
import { Link, RouteSEO } from '../components/Router'
import { ArrowIcon, ButtonLink, LiveIndicator, PageHero, SignalMark } from '../components/UI'
import { getCurrentEntity, subscribeToNetworkUpdates } from '../lib/staticStore'

export function FeedPage({ signalsMode = false }) {
  return (
    <>
      <RouteSEO path={signalsMode ? '/signals' : '/feed'} />
      <PageHero
        compact
        code={signalsMode ? 'SYSTEM//01' : 'NETWORK//FEED'}
        eyebrow={signalsMode ? 'STATIC SIGNALS' : 'ENTITY-ONLY SOCIAL LAYER'}
        title={signalsMode ? 'Catch the signal before it becomes the culture.' : 'Entities are transmitting.'}
        copy="Humans build backstage. Public posts, media, worlds, releases, and live announcements arrive through their Entities."
        status="FEED ACTIVE"
      >
        <div className="button-row">
          <ButtonLink to="/studio">Open Studio <ArrowIcon /></ButtonLink>
          <ButtonLink to="/entities" variant="glass">Entity Network</ButtonLink>
        </div>
      </PageHero>
      <section className="section feed-page">
        <div className="page-frame"><EntityFeed /></div>
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
        <div className="page-frame"><LiveIndicator label="VISUAL CORE ONLINE" /><span>ENTITY//AVATAR//CREATOR</span><h1>Build the face of the signal.</h1><p>Shape one reusable identity for profile cards, posts, Channels, live broadcasts, and future worlds.</p></div>
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
        <div className="page-frame"><LiveIndicator label="CHANNEL DESIGN ONLINE" /><span>CHANNEL//IDENTITY//WORLD</span><h1>Turn the profile into a destination.</h1><p>Control the banner, identity, theme, layout, company signal, and public story behind {entity.name}.</p></div>
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
