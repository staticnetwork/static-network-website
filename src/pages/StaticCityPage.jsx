import { useCallback, useMemo, useState, useEffect } from 'react'
import { Link, RouteSEO } from '../components/Router'
import { ArrowIcon, LiveIndicator, SignalMark } from '../components/UI'
import StaticCityEngineView from '../components/world/StaticCityEngineView'
import { staticCityAssetPipeline } from '../lib/worldEngine/staticCityAssetPipeline'
import { staticCityModelSlotList } from '../lib/worldEngine/staticCityModelAssets'
import {
  staticCityMacroDistricts,
  staticCityMarinePlan,
  staticCityScalePlan,
  staticCityScaleRules,
  staticCitySignatureLandmarks,
} from '../lib/worldEngine/staticCityScalePlan'
import { staticCitySportsAssets, staticCitySportsModes, staticCitySportsPlan, staticCitySportsRules } from '../lib/worldEngine/staticCitySportsPlan'
import {
  staticCityAnimationStylePrinciples,
  staticCityUnrealMilestones,
  staticCityUnrealPlan,
  staticCityVisualStylePrinciples,
} from '../lib/worldEngine/staticCityUnrealPlan'
import {
  mrStoneMissionBeats,
  mrStoneOpeningMission,
  staticCityDistrictBillboards,
  staticCityBackendContracts,
  staticCityDriveSequence,
  staticCityMarketSequence,
  staticCityOpeningSequence,
  staticCityExecutionPath,
  staticCityGuardianSquad,
  staticCityImageRead,
  staticCityPlatformDoors,
  staticCityRadioSequence,
  staticCityValetSequence,
  staticCityVibeSequence,
  staticCityRouteNodes,
  staticCitySceneModes,
  staticCitySystems,
  staticCityTiers,
  staticCityVisualTargets,
  staticCityWorld,
} from '../lib/worldEngine/staticCityWorld'

const movementKeys = {
  w: [0, -1],
  arrowup: [0, -1],
  s: [0, 1],
  arrowdown: [0, 1],
  a: [-1, 0],
  arrowleft: [-1, 0],
  d: [1, 0],
  arrowright: [1, 0],
}

const startNode = staticCityRouteNodes.find((node) => node.id === 'penthouse-spawn') || staticCityRouteNodes[0]
const citySequences = {
  opening: staticCityOpeningSequence,
  valet: staticCityValetSequence,
  drive: staticCityDriveSequence,
  market: staticCityMarketSequence,
  radio: staticCityRadioSequence,
  vibe: staticCityVibeSequence,
}

function clamp(value, min = 4, max = 96) {
  return Math.max(min, Math.min(max, value))
}

function distance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export default function StaticCityPage() {
  const [entityPosition, setEntityPosition] = useState({ x: startNode.x, y: startNode.y })
  const [playerMotion, setPlayerMotion] = useState({
    facing: Math.PI,
    mode: 'idle',
    speed: 0,
    step: 0,
  })
  const [activeSequence, setActiveSequence] = useState({
    type: 'opening',
    status: 'idle',
    stepIndex: 0,
  })
  const [activeBeatIndex, setActiveBeatIndex] = useState(0)
  const activeBeat = mrStoneMissionBeats[activeBeatIndex] || mrStoneMissionBeats[0]
  const activeBeatNode = staticCityRouteNodes.find((node) => node.id === activeBeat.nodeId) || startNode
  const activeScene = staticCitySceneModes[activeBeat.sceneZone] || staticCitySceneModes.city
  const sequenceSteps = citySequences[activeSequence.type] || staticCityOpeningSequence
  const activeSequenceStep = sequenceSteps[activeSequence.stepIndex] || sequenceSteps[0]
  const sequenceRunning = activeSequence.status === 'playing'
  const missionRoute = useMemo(() => (
    mrStoneMissionBeats
      .map((beat) => staticCityRouteNodes.find((node) => node.id === beat.nodeId))
      .filter(Boolean)
  ), [])

  const moveEntity = useCallback((dx, dy) => {
    if (sequenceRunning) return
    const step = activeScene.step || 3
    const bounds = activeScene.bounds || staticCitySceneModes.city.bounds
    const facing = Math.atan2(dx, dy)
    setEntityPosition((current) => ({
      x: clamp(current.x + dx * step, bounds.x[0], bounds.x[1]),
      y: clamp(current.y + dy * step, bounds.y[0], bounds.y[1]),
    }))
    setPlayerMotion((current) => ({
      facing,
      mode: 'walking',
      speed: Math.hypot(dx, dy) * step,
      step: current.step + 1,
    }))
  }, [activeScene, sequenceRunning])

  useEffect(() => {
    if (sequenceRunning) return undefined
    if (playerMotion.mode !== 'walking') return undefined
    const activeStep = playerMotion.step
    const timeout = window.setTimeout(() => {
      setPlayerMotion((current) => (
        current.step === activeStep
          ? { ...current, mode: 'idle', speed: 0 }
          : current
      ))
    }, 220)

    return () => window.clearTimeout(timeout)
  }, [playerMotion.mode, playerMotion.step, sequenceRunning])

  useEffect(() => {
    if (!sequenceRunning) return undefined

    const step = sequenceSteps[activeSequence.stepIndex]
    if (!step) return undefined

    const beatIndex = mrStoneMissionBeats.findIndex((beat) => beat.id === step.beatId)
    if (beatIndex >= 0) setActiveBeatIndex(beatIndex)

    setEntityPosition(step.position)
    setPlayerMotion((current) => ({
      facing: step.facing,
      mode: step.motion,
      speed: step.motion === 'walking' ? 1.8 : 0,
      step: current.step + 1,
    }))

    const timeout = window.setTimeout(() => {
      setActiveSequence((current) => {
        if (current.status !== 'playing') return current
        const nextIndex = current.stepIndex + 1
        const currentSteps = citySequences[current.type] || staticCityOpeningSequence
        if (nextIndex >= currentSteps.length) {
          return { ...current, status: 'complete', stepIndex: currentSteps.length - 1 }
        }
        return { ...current, status: 'playing', stepIndex: nextIndex }
      })
    }, step.duration)

    return () => window.clearTimeout(timeout)
  }, [activeSequence.stepIndex, sequenceRunning, sequenceSteps])

  useEffect(() => {
    function handleKeyDown(event) {
      const vector = movementKeys[event.key.toLowerCase()]
      if (!vector) return
      event.preventDefault()
      moveEntity(vector[0], vector[1])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveEntity])

  const nearestNode = useMemo(() => {
    return staticCityRouteNodes.reduce((nearest, node) => {
      const nodeDistance = distance(entityPosition, node)
      if (!nearest || nodeDistance < nearest.distance) return { ...node, distance: nodeDistance }
      return nearest
    }, null)
  }, [entityPosition])

  const activeTier = useMemo(() => {
    return staticCityTiers.find((tier) => entityPosition.y >= tier.range[0] && entityPosition.y <= tier.range[1]) || staticCityTiers.at(-1)
  }, [entityPosition])

  const missionDistance = distance(entityPosition, activeBeatNode)
  const canCompleteBeat = missionDistance < 9
  const routePoints = missionRoute.map((node) => `${node.x},${node.y}`).join(' ')
  const vibeHudActive = activeSequence.type === 'vibe'
    || activeBeat.id === 'vibe-mode'
    || activeBeat.id === 'return-tower'

  function jumpToNode(node) {
    setEntityPosition({ x: node.x, y: node.y })
    setPlayerMotion((current) => ({
      ...current,
      mode: 'idle',
      speed: 0,
    }))
  }

  function selectBeat(index) {
    const beat = mrStoneMissionBeats[index]
    const node = staticCityRouteNodes.find((item) => item.id === beat?.nodeId)
    setActiveSequence({ type: 'opening', status: 'idle', stepIndex: 0 })
    setActiveBeatIndex(index)
    if (node) jumpToNode(node)
  }

  function selectNodeFromEngine(node) {
    const beatIndex = mrStoneMissionBeats.findIndex((beat) => beat.nodeId === node.id)
    if (beatIndex >= 0) {
      selectBeat(beatIndex)
      return
    }
    jumpToNode(node)
  }

  function advanceBeat() {
    selectBeat((activeBeatIndex + 1) % mrStoneMissionBeats.length)
  }

  function startOpeningLoop() {
    setActiveSequence({ type: 'opening', status: 'playing', stepIndex: 0 })
  }

  function startValetPickup() {
    setActiveSequence({ type: 'valet', status: 'playing', stepIndex: 0 })
  }

  function startDriveToMarket() {
    setActiveSequence({ type: 'drive', status: 'playing', stepIndex: 0 })
  }

  function startMarketWalkBeat() {
    setActiveSequence({ type: 'market', status: 'playing', stepIndex: 0 })
  }

  function startRadioRooftopBeat() {
    setActiveSequence({ type: 'radio', status: 'playing', stepIndex: 0 })
  }

  function startVibeModeReturn() {
    setActiveSequence({ type: 'vibe', status: 'playing', stepIndex: 0 })
  }

  function resetOpeningLoop() {
    setActiveSequence({ type: 'opening', status: 'idle', stepIndex: 0 })
    selectBeat(0)
  }

  return (
    <div
      className="static-city-page"
      data-active-beat={activeBeat.id}
      data-camera-mode={activeBeat.camera}
      data-scene-zone={activeScene.id}
      data-active-sequence={activeSequence.type}
      data-sequence-status={activeSequence.status}
      data-opening-sequence={activeSequence.status}
    >
      <RouteSEO
        path="/city"
        title="STATIC City Owner Build | STATIC Network"
        description="Owner-only STATIC City vertical slice for the future game-world layer."
      />

      <header className="static-city-topbar">
        <Link className="static-city-wordmark" to="/" aria-label="Return to STATIC Arrival District">
          <SignalMark animated />
          <span>STATIC CITY</span>
        </Link>
        <div className="static-city-topbar__status">
          <LiveIndicator label="OWNER BUILD" />
          <span>NOT PUBLIC / NO FAKE BACKEND</span>
        </div>
        <nav aria-label="Owner city controls">
          <Link to="/">Arrival District</Link>
          <Link to="/studio">Studio</Link>
          <Link to="/entities/avatar">Entity Builder</Link>
        </nav>
      </header>

      <main className="static-city-shell">
        <section className="static-city-stage" aria-label="STATIC City owner playable slice">
          <div className="static-city-stage__skyline" aria-hidden="true" />
          <div
            className="static-city-map"
            style={{ '--entity-x': `${entityPosition.x}%`, '--entity-y': `${entityPosition.y}%` }}
            tabIndex={0}
            aria-label="Use W A S D or arrow keys to move the prototype Entity marker around STATIC City."
          >
            <img src="/assets/static-arrival-district.png" alt="" />
            <StaticCityEngineView
              nodes={staticCityRouteNodes}
              routeNodes={missionRoute}
              billboards={staticCityDistrictBillboards}
              entityPosition={entityPosition}
              activeNodeId={activeBeat.nodeId}
              activeBeat={activeBeat}
              playerMotion={playerMotion}
              sceneZone={activeScene.id}
              guardianSquad={staticCityGuardianSquad}
              sequenceState={{
                status: activeSequence.status,
                type: activeSequence.type,
                stepId: activeSequenceStep?.id,
                doorOpen: Boolean(activeSequenceStep?.doorOpen),
                vehicleApproach: Boolean(activeSequenceStep?.vehicleApproach),
                vehicleDoorOpen: Boolean(activeSequenceStep?.vehicleDoorOpen),
                radioBoot: Boolean(activeSequenceStep?.radioBoot),
                enteringVehicle: Boolean(activeSequenceStep?.enteringVehicle),
                vehicleDriving: Boolean(activeSequenceStep?.vehicleDriving),
                playerInVehicle: Boolean(activeSequenceStep?.playerInVehicle),
                routePulse: Boolean(activeSequenceStep?.routePulse),
                billboardSweep: Boolean(activeSequenceStep?.billboardSweep),
                marketArrival: Boolean(activeSequenceStep?.marketArrival),
                boutiqueLights: Boolean(activeSequenceStep?.boutiqueLights),
                marketInterior: Boolean(activeSequenceStep?.marketInterior),
                outfitUpgrade: Boolean(activeSequenceStep?.outfitUpgrade),
                jewelryUpgrade: Boolean(activeSequenceStep?.jewelryUpgrade),
                statusUpgrade: Boolean(activeSequenceStep?.statusUpgrade),
                radioArrival: Boolean(activeSequenceStep?.radioArrival),
                broadcastLights: Boolean(activeSequenceStep?.broadcastLights),
                securityClear: Boolean(activeSequenceStep?.securityClear),
                elevatorCue: Boolean(activeSequenceStep?.elevatorCue),
                rooftopReveal: Boolean(activeSequenceStep?.rooftopReveal),
                vipEscort: Boolean(activeSequenceStep?.vipEscort),
                crowdHeat: Boolean(activeSequenceStep?.crowdHeat),
                drinkProp: Boolean(activeSequenceStep?.drinkProp),
                cigarProp: Boolean(activeSequenceStep?.cigarProp),
                seatedVip: Boolean(activeSequenceStep?.seatedVip),
                vibeMode: Boolean(activeSequenceStep?.vibeMode),
                windowDown: Boolean(activeSequenceStep?.windowDown),
                firstPersonDrive: Boolean(activeSequenceStep?.firstPersonDrive),
                staticBlues: Boolean(activeSequenceStep?.staticBlues),
                cityWind: Boolean(activeSequenceStep?.cityWind),
                stripCruise: Boolean(activeSequenceStep?.stripCruise),
                returnDrive: Boolean(activeSequenceStep?.returnDrive),
                towerApproach: Boolean(activeSequenceStep?.towerApproach),
                valetTip: Boolean(activeSequenceStep?.valetTip),
                missionComplete: Boolean(activeSequenceStep?.missionComplete),
                vehicleOffset: activeSequenceStep?.vehicleOffset,
              }}
              onSelectNode={selectNodeFromEngine}
            />
            <div className="static-city-shot-overlay" aria-hidden="true">
              <span>{activeBeat.camera}</span>
              <b>{activeBeat.location}</b>
            </div>
            <div className={`static-city-vibe-hud ${vibeHudActive ? 'is-active' : ''}`} aria-hidden={!vibeHudActive}>
              <span>STATIC RADIO / OWNER PREVIEW</span>
              <b>{activeSequenceStep?.staticBlues ? 'STATIC Blues' : 'Vibe Mode standby'}</b>
              <small>{activeSequenceStep?.windowDown ? 'window down / first-person strip' : 'rights-safe audio placeholder'}</small>
              <div aria-hidden="true">
                {Array.from({ length: 18 }, (_, index) => <i style={{ '--bar': index }} key={index} />)}
              </div>
            </div>
            <div className="static-city-map__grade" aria-hidden="true">
              {staticCityTiers.map((tier) => (
                <span
                  className={`static-city-tier-line static-city-tier-line--${tier.tone}`}
                  style={{ '--tier-top': `${tier.range[0]}%`, '--tier-height': `${tier.range[1] - tier.range[0]}%` }}
                  key={tier.id}
                >
                  {tier.name}
                </span>
              ))}
            </div>
            <svg className="static-city-route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={routePoints} />
            </svg>
            {staticCityRouteNodes.map((node) => (
              <button
                className={`static-city-node static-city-node--${node.type} ${activeBeat.nodeId === node.id ? 'is-objective' : ''}`}
                style={{ '--node-x': `${node.x}%`, '--node-y': `${node.y}%` }}
                type="button"
                onClick={() => jumpToNode(node)}
                key={node.id}
              >
                <span>{node.label}</span>
                <small>{node.status}</small>
              </button>
            ))}
            <span className="static-city-entity" aria-label="Prototype Entity position">
              <i />
              <b>MR STONE</b>
            </span>
          </div>

          <div className="static-city-minimap" aria-label="STATIC City minimap">
            <div>
              <span>MAP</span>
              <b>{activeTier.name}</b>
            </div>
            <figure style={{ '--entity-x': `${entityPosition.x}%`, '--entity-y': `${entityPosition.y}%` }}>
              <i />
              {missionRoute.map((node) => <span style={{ '--node-x': `${node.x}%`, '--node-y': `${node.y}%` }} key={node.id} />)}
            </figure>
          </div>

          <div className="static-city-pad" aria-label="Touch movement controls">
            <button type="button" onClick={() => moveEntity(0, -1)}>↑</button>
            <button type="button" onClick={() => moveEntity(-1, 0)}>←</button>
            <button type="button" onClick={() => moveEntity(0, 1)}>↓</button>
            <button type="button" onClick={() => moveEntity(1, 0)}>→</button>
          </div>
        </section>

        <aside className="static-city-hud" aria-label="STATIC City mission HUD">
          <div className="static-city-hud__intro">
            <span>{staticCityWorld.access}</span>
            <h1>{mrStoneOpeningMission.title}</h1>
            <p>{mrStoneOpeningMission.lead}</p>
            <div className="static-city-character-card">
              <b>{mrStoneOpeningMission.character.name}</b>
              <span>{mrStoneOpeningMission.character.vehicle}</span>
              <span>{mrStoneOpeningMission.character.radio}</span>
            </div>
            <div className="static-city-asset-slots" aria-label="Production model replacement slots">
              {staticCityModelSlotList.map((slot) => (
                <section key={slot.id}>
                  <span>{slot.type}</span>
                  <b>{slot.label}</b>
                  <code>{slot.targetPath}</code>
                  <small>{slot.fallback}</small>
                </section>
              ))}
            </div>
            <div className="static-city-guardian-squad" aria-label="Mr. Stone guardian squad">
              <header>
                <span>GUARDIAN SQUAD</span>
                <b>Always with the Entity</b>
              </header>
              {staticCityGuardianSquad.map((guardian) => (
                <section key={guardian.id}>
                  <i style={{ '--guardian-color': guardian.color, '--guardian-accent': guardian.accent }} />
                  <div>
                    <b>{guardian.name}</b>
                    <span>{guardian.role}</span>
                    <small>{guardian.protectMode}</small>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <article className="static-city-controller-card">
            <span>THIRD-PERSON CONTROLLER / V0.1</span>
            <h2>{activeScene.label}</h2>
            <p>{activeScene.copy}</p>
            <div>
              <small>{activeScene.control}</small>
              <small>{playerMotion.mode}</small>
              <small>{activeScene.camera}</small>
            </div>
            <div className="static-city-sequence-controls">
              <button type="button" onClick={startOpeningLoop} disabled={sequenceRunning}>
                {sequenceRunning ? 'Sequence running' : 'Start Opening Loop'} <ArrowIcon />
              </button>
              <button type="button" onClick={startValetPickup} disabled={sequenceRunning}>
                {sequenceRunning ? 'Sequence running' : 'Start Valet Pickup'} <ArrowIcon />
              </button>
              <button type="button" onClick={startDriveToMarket} disabled={sequenceRunning}>
                {sequenceRunning ? 'Sequence running' : 'Drive To Market Walk'} <ArrowIcon />
              </button>
              <button type="button" onClick={startMarketWalkBeat} disabled={sequenceRunning}>
                {sequenceRunning ? 'Sequence running' : 'Market Walk Beat'} <ArrowIcon />
              </button>
              <button type="button" onClick={startRadioRooftopBeat} disabled={sequenceRunning}>
                {sequenceRunning ? 'Sequence running' : 'Radio Rooftop Beat'} <ArrowIcon />
              </button>
              <button type="button" onClick={startVibeModeReturn} disabled={sequenceRunning}>
                {sequenceRunning ? 'Sequence running' : 'Vibe Mode Return'} <ArrowIcon />
              </button>
              <button type="button" onClick={resetOpeningLoop}>
                Reset
              </button>
            </div>
            <p className="static-city-sequence-cue">
              <b>{activeSequenceStep?.label}</b>
              <span>{activeSequenceStep?.cue}</span>
            </p>
          </article>

          <article className="static-city-mission" aria-live="polite">
            <small>Current objective</small>
            <h2>{activeBeat.label}: {activeBeatNode.label}</h2>
            <p>{activeBeat.objective}</p>
            <div className="static-city-shot-meta">
              <span>{activeBeat.camera}</span>
              <span>{activeBeat.location}</span>
            </div>
            <p className="static-city-stage-direction">{activeBeat.stageDirection}</p>
            <div>
              <span>{canCompleteBeat ? 'At beat' : `${Math.round(missionDistance)}m away`}</span>
              <button type="button" onClick={advanceBeat}>
                {canCompleteBeat ? 'Complete beat' : 'Skip beat'} <ArrowIcon />
              </button>
            </div>
          </article>

          <div className="static-city-readout">
            <article>
              <span>Nearby</span>
              <b>{nearestNode?.label}</b>
              <p>{nearestNode?.objective}</p>
            </article>
            <article>
              <span>Tier</span>
              <b>{activeTier.name}</b>
              <p>{activeTier.copy}</p>
            </article>
          </div>

          <div className="static-city-loop-list" aria-label="Mission route">
            {mrStoneMissionBeats.map((beat, index) => (
              <button
                className={index === activeBeatIndex ? 'is-active' : ''}
                type="button"
                onClick={() => selectBeat(index)}
                key={beat.id}
              >
                <small>{String(index + 1).padStart(2, '0')}</small>
                <b>{beat.label}</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="static-city-interface-grid" aria-label="STATIC City interface systems">
          <article className="static-city-director">
            <span>MISSION DIRECTOR / OPENING NIGHT</span>
            <h2>{mrStoneOpeningMission.subtitle}</h2>
            <p>{mrStoneOpeningMission.lead}</p>
            <div className="static-city-director__needs">
              {activeBeat.systemNeeds.map((need) => <small key={need}>{need}</small>)}
            </div>
            <div className="static-city-director__flags">
              {mrStoneOpeningMission.flags.map((flag) => <small key={flag}>{flag}</small>)}
            </div>
          </article>

          <article className="static-city-platform-plan">
            <span>STATIC ID / MANY DOORS</span>
            <h2>Web gets them in. The real engine brings the city alive.</h2>
            <p>STATIC should not choose between social media and a game world. The same account has to travel from website to phone to future Unreal/console/VR clients.</p>
            <div>
              {staticCityPlatformDoors.map(([title, copy]) => (
                <section key={title}>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="static-city-visual-target">
            <span>VISUAL TARGET / NO WIREFRAME ENERGY</span>
            <h2>Everything should inherit the Arrival District world.</h2>
            <p>The owner build is now using the generated district art as in-world signage and reference panels. The final city still needs authored 3D assets, real character animation, vehicles, interiors, NPCs, and route cinematics, but this is the correct visual north star.</p>
            <div className="static-city-reference-wall">
              {staticCityVisualTargets.map((target) => (
                <figure key={target.id}>
                  <img src={target.image} alt="" loading="lazy" />
                  <figcaption>
                    <b>{target.title}</b>
                    <small>{target.copy}</small>
                  </figcaption>
                </figure>
              ))}
            </div>
          </article>

          <article className="static-city-image-read">
            <span>ARRIVAL IMAGE CANON</span>
            <h2>The picture is the district brief.</h2>
            <p>This is the product read: arena nights, Club STATIC, VIP tables, strip movement, billboards, creator ads, fan heat, and status architecture all need to become systems.</p>
            <div>
              {staticCityImageRead.map(([title, copy]) => (
                <section key={title}>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="static-city-sports">
            <span>{staticCitySportsPlan.name} / {staticCitySportsPlan.currentMode}</span>
            <h2>Basketball first. Sports as city gravity.</h2>
            <p>{staticCitySportsPlan.principle} Publicly, this stays honest as “{staticCitySportsPlan.publicClaim}” until the real engine can handle play.</p>
            <div className="static-city-sports__modes">
              {staticCitySportsModes.map((mode) => (
                <section key={mode.id}>
                  <small>{mode.status}</small>
                  <b>{mode.title}</b>
                  <p>{mode.copy}</p>
                </section>
              ))}
            </div>
            <div className="static-city-sports__rules">
              {staticCitySportsRules.map((rule) => <small key={rule}>{rule}</small>)}
            </div>
            <div className="static-city-sports__assets">
              {staticCitySportsAssets.map((asset) => (
                <code key={asset.id}>{asset.targetPath}</code>
              ))}
            </div>
          </article>

          <article className="static-city-unreal-plan">
            <span>{staticCityUnrealPlan.engine} / {staticCityUnrealPlan.target}</span>
            <h2>GTA-level polish is the floor, not the ceiling.</h2>
            <p>{staticCityUnrealPlan.warning} The target is a near-real premium entertainment city that still has the unmistakable STATIC strip, broadcast, sports, club, music, fashion, and signal language.</p>
            <div className="static-city-unreal-plan__principles">
              {staticCityVisualStylePrinciples.map(([title, copy]) => (
                <section key={title}>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
            <div className="static-city-unreal-plan__animation">
              {staticCityAnimationStylePrinciples.map(([title, copy]) => (
                <section key={title}>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
            <div className="static-city-unreal-plan__milestones">
              {staticCityUnrealMilestones.map(([code, title, copy]) => (
                <section key={code}>
                  <code>{code}</code>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="static-city-scale-plan">
            <span>{staticCityScalePlan.engineTarget} / FULL-SCALE WORLD</span>
            <h2>STATIC becomes a city, island, coast, suburbs, and districts.</h2>
            <p>{staticCityScalePlan.cityBlend} The browser map stays a control-room prototype; the Unreal build becomes the real world.</p>
            <div className="static-city-scale-plan__districts">
              {staticCityMacroDistricts.map((district) => (
                <section key={district.id}>
                  <small>{district.biome}</small>
                  <b>{district.name}</b>
                  <p>{district.role}</p>
                </section>
              ))}
            </div>
            <div className="static-city-scale-plan__landmarks">
              {staticCitySignatureLandmarks.map(([title, copy]) => (
                <section key={title}>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
            <div className="static-city-scale-plan__marine">
              {staticCityMarinePlan.map(([title, copy]) => (
                <section key={title}>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
            <div className="static-city-scale-plan__rules">
              {staticCityScaleRules.map((rule) => <small key={rule}>{rule}</small>)}
            </div>
          </article>

          <article className="static-city-execution-path">
            <span>NO-FLUFF EXECUTION PATH</span>
            <h2>The ten moves to get from access layer to real city.</h2>
            <div>
              {staticCityExecutionPath.map(([code, title, copy]) => (
                <section key={code}>
                  <code>{code}</code>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="static-city-console static-city-console--entity">
            <span>ENTITY / CREATE-A-PLAYER</span>
            <h2>Mr. Stone needs a real rig.</h2>
            <p>This mission starts with Mr. Stone as the authored lead. We still need a real body, wardrobe, walk cycle, car-entry animation, VIP-seat animation, props, and persistence before this is true gameplay.</p>
            <div>
              <small>top-floor spawn</small>
              <small>luxury wardrobe</small>
              <small>walk / sit / car entry</small>
            </div>
          </article>

          <article className="static-city-console">
            <span>PROPERTY / SPAWN</span>
            <h2>Top floor of STATIC Tower.</h2>
            <p>Mr. Stone’s penthouse is the summit spawn. The first interior route is penthouse room, hallway, private elevator, valet floor, then city exterior.</p>
          </article>

          <article className="static-city-console">
            <span>VEHICLE / TRAVEL</span>
            <h2>Black luxury SUV route.</h2>
            <p>First pass should be authored vehicle paths: valet pickup, Market Walk stop, Radio arrival, Vibe Mode cruise, and third-person return up the mountain.</p>
          </article>

          <article className="static-city-console">
            <span>SOCIAL MEDIA INSIDE WORLD</span>
            <h2>Signals become the city pulse.</h2>
            <p>The feed should feel like billboards, phones, venue walls, creator drops, aftershow clips, and My Signal memory inside the world.</p>
          </article>

          <article className="static-city-console">
            <span>MALL / STATUS FLEX</span>
            <h2>Fit and jewelry before VIP.</h2>
            <p>The Market Walk stop proves wardrobe, jewelry, inventory, status, and visual identity before Mr. Stone walks into the rooftop party.</p>
          </article>

          <article className="static-city-radio">
            <span>STATIC RADIO ROOFTOP</span>
            <h2>STATIC Blues / vibe mode.</h2>
            <p>The first song cue is STATIC Blues. Until we own or generate a rights-safe track, this remains a named cue and waveform, not public autoplay audio.</p>
            <div className="static-city-wave" aria-hidden="true">
              {Array.from({ length: 28 }, (_, index) => <i style={{ '--bar': index }} key={index} />)}
            </div>
          </article>

          <article className="static-city-systems">
            <span>WORLD SYSTEM STACK</span>
            <div>
              {staticCitySystems.map(([title, copy]) => (
                <section key={title}>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="static-city-backend">
            <span>REAL ASSET PIPELINE / REPLACES PROXIES</span>
            <p>This owner route is a storyboard. These are the production assets that must replace the current procedural stand-ins before STATIC City feels like the actual open world.</p>
            <div>
              {staticCityAssetPipeline.map((asset) => (
                <section key={asset.id}>
                  <code>{asset.priority} / {asset.status}</code>
                  <b>{asset.name}</b>
                  <small>{asset.sourceStatus} / {asset.licenseStatus}</small>
                  <p>{asset.replaces}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="static-city-backend">
            <span>BACKEND CONTRACTS / TODO</span>
            <p>These are the tables/services we need before this becomes real multiplayer or commerce. The UI is allowed to preview state. It is not allowed to fake ownership.</p>
            <div>
              {staticCityBackendContracts.map(([table, contract]) => (
                <section key={table}>
                  <code>{table}</code>
                  <p>{contract}</p>
                </section>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
