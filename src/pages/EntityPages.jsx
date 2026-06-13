import { useEffect, useState } from 'react'
import { directoryData } from '../data/network'
import {
  EntityBuilder,
  EntityCard,
  EntityProfile,
} from '../components/EntitySystem'
import { Link, RouteSEO } from '../components/Router'
import { ArrowIcon, ButtonLink, LiveIndicator, PageHero, Reveal, SectionHeading, SignalMark } from '../components/UI'
import {
  getCurrentEntity,
  getEntities,
  getEntityByHandle,
  subscribeToNetworkUpdates,
} from '../lib/staticStore'

export function EntitiesPage() {
  const [entities, setEntities] = useState(() => getEntities())

  useEffect(() => subscribeToNetworkUpdates(() => setEntities(getEntities())), [])

  return (
    <>
      <RouteSEO path="/entities" />
      <PageHero
        code="CORE//ENTITY"
        eyebrow="ENTITY-FIRST SOCIAL ENTERTAINMENT"
        title="Humans build backstage. Entities become the signal."
        copy="Create a digital performer, host, artist, gamer, influencer, founder, narrator, or character that can own a Channel and move across every STATIC system."
        status={entities.length ? `${entities.length} LOCAL ENTITIES` : 'ORIGIN SLOT OPEN'}
      >
        <div className="button-row">
          <ButtonLink to="/entities/generate">Generate An Entity <ArrowIcon /></ButtonLink>
          <ButtonLink to="/entities/create" variant="glass">Manual Builder</ButtonLink>
          {entities.length > 0 && <ButtonLink to="/entities/profile" variant="glass">View Your Entity</ButtonLink>}
        </div>
      </PageHero>

      {entities.length > 0 && (
        <section className="section local-entity-section">
          <div className="page-frame">
            <div className="section-row">
              <SectionHeading eyebrow="YOUR ENTITY NETWORK" title="Local identities, live in this browser." copy="Every Entity below has a connected Channel and can publish Signals, Worlds, Drops, and live status." />
              <LiveIndicator label="LOCAL NETWORK ACTIVE" />
            </div>
            <div className="local-entity-grid">
              {entities.map((entity) => (
                <Link to={`/channels/${entity.handle.replace('@', '')}`} key={entity.id}>
                  <EntityCard entity={entity} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section entity-network-examples">
        <div className="page-frame">
          <div className="section-row">
            <SectionHeading eyebrow="NETWORK ENTITIES" title="One identity. Every format." copy="These network examples demonstrate how Entities can perform, host, narrate, compete, release, and evolve across entertainment worlds." />
            <ButtonLink to="/entities/generate" variant="glass">{entities.length ? 'Generate Another Entity' : 'Claim Rank #001'} <ArrowIcon /></ButtonLink>
          </div>
          <div className="network-entity-grid">
            {directoryData.entities.map((entity, index) => (
              <Reveal as="article" className="network-entity-card" delay={(index % 3) * 60} key={entity.name}>
                <div className={`network-entity-card__visual ${entity.className}`}><SignalMark animated={index === 0} /><b>{entity.name.slice(0, 2)}</b></div>
                <span>{entity.role}</span><h3>{entity.name}</h3><p>{entity.specialty}</p><footer>{entity.stat}<ArrowIcon /></footer>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function EntityCreatePage() {
  return (
    <>
      <RouteSEO path="/entities/create" />
      <section className="entity-create-intro">
        <div className="broadcast-grid" />
        <div className="scanlines" />
        <div className="page-frame">
          <div><LiveIndicator label="ENTITY CORE ONLINE" /><span>CREATE//IDENTITY//WORLD</span></div>
          <h1>Create the Entity.<br /><em>Build the world.</em></h1>
          <p>Your public identity begins here. The Entity becomes the performer, creator, host, artist, gamer, influencer, founder, or character audiences meet across STATIC.</p>
          <Link className="button button--primary" to="/entities/generate">Use the Visual Entity Generator <ArrowIcon /></Link>
        </div>
      </section>
      <section className="section entity-create-page">
        <div className="page-frame"><EntityBuilder /></div>
      </section>
    </>
  )
}

export function EntityProfilePage() {
  const [entity, setEntity] = useState(() => getCurrentEntity())
  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  if (!entity) return <EntityMissing mode="profile" />
  return (
    <>
      <RouteSEO path="/entities/profile" title={`${entity.name} | STATIC Entity`} description={`${entity.name} is a public-facing digital Entity on STATIC Network.`} />
      <main className="entity-page-frame"><EntityProfile initialEntity={entity} /></main>
    </>
  )
}

export function EntityChannelPage({ handle }) {
  const [entity, setEntity] = useState(() => handle ? getEntityByHandle(handle) : getCurrentEntity())

  useEffect(() => subscribeToNetworkUpdates(() => setEntity(handle ? getEntityByHandle(handle) : getCurrentEntity())), [handle])

  if (!entity) return <EntityMissing mode="channel" />
  return (
    <>
      <RouteSEO path={`/channels/${handle || entity.handle.replace('@', '')}`} title={`${entity.channelName || entity.name} | STATIC Channel`} description={`${entity.channelTagline || entity.bio}`} />
      <main className="entity-page-frame entity-channel-page"><EntityProfile initialEntity={entity} channelMode /></main>
    </>
  )
}

function EntityMissing({ mode }) {
  return (
    <>
      <RouteSEO path={mode === 'channel' ? '/channel' : '/entities/profile'} />
      <section className="entity-missing">
        <div className="broadcast-grid" />
        <div><SignalMark animated /><LiveIndicator label="ORIGIN SLOT OPEN" /><h1>No Entity is transmitting yet.</h1><p>Create the first public identity and STATIC will initialize its Channel automatically.</p><ButtonLink to="/entities/generate">Generate The First Entity <ArrowIcon /></ButtonLink></div>
      </section>
    </>
  )
}
