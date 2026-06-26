import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  cityHierarchyLevels,
  createPlayerRoadmap,
  districtCityScale,
  districtPropertyLayer,
  districtVenues,
} from '../../lib/worldEngine/districtManifest'
import { ArrowIcon } from '../UI'
import StaticCityLoopPrototype from './StaticCityLoopPrototype'
import StaticNavMapPreview from './StaticNavMapPreview'

const venueColors = {
  signals: '#e9bd74',
  live: '#ff7ee8',
  play: '#a364ff',
  studio: '#ffd88d',
  channels: '#c790ff',
  radio: '#a85cff',
  marketplace: '#ffb45e',
  sage: '#fff4cf',
}

const keyMap = {
  w: 'forward',
  arrowup: 'forward',
  s: 'back',
  arrowdown: 'back',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
}

export default function StaticWorldEngine({
  snapshot,
  activeVenueId = 'signals',
  onExit,
  onSelectVenue,
  onTravelToVenue,
  onSummonSage,
}) {
  const mountRef = useRef(null)
  const shellRef = useRef(null)
  const keysRef = useRef(new Set())
  const selectVenueRef = useRef(() => {})
  const initialActiveVenueIdRef = useRef(activeVenueId)
  const selectedVenueIdRef = useRef(activeVenueId)
  const reducedMotion = usePrefersReducedMotion()
  const [selectedVenueId, setSelectedVenueId] = useState(activeVenueId)
  const [nearestVenueId, setNearestVenueId] = useState(null)
  const [isBooted, setIsBooted] = useState(false)
  const [inputMode, setInputMode] = useState('keyboard')
  const selectedVenue = districtVenues.find((venue) => venue.id === selectedVenueId) || districtVenues[0]
  const nearestVenue = districtVenues.find((venue) => venue.id === nearestVenueId)
  const engineMode = snapshot?.status?.mode || 'web-preview'

  useEffect(() => {
    selectedVenueIdRef.current = activeVenueId
    setSelectedVenueId(activeVenueId)
  }, [activeVenueId])

  useEffect(() => {
    selectedVenueIdRef.current = selectedVenueId
  }, [selectedVenueId])

  useEffect(() => {
    selectVenueRef.current = (venueId) => {
      const venue = districtVenues.find((item) => item.id === venueId)
      if (!venue) return
      selectedVenueIdRef.current = venue.id
      setSelectedVenueId(venue.id)
      onSelectVenue?.(venue)
    }
  }, [onSelectVenue])

  useEffect(() => {
    shellRef.current?.focus()
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let disposed = false
    let animationId = 0
    let lastTime = 0
    let lastNearestId = ''
    const activeKeys = keysRef.current
    const disposables = []
    const clickable = []
    const venueVisuals = new Map()
    const crowd = []

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050207, 0.045)

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120)
    camera.position.set(0, 7.2, 11.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.className = 'world-engine__canvas'
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0x9d63ff, 0.55)
    const keyLight = new THREE.DirectionalLight(0xffe4ad, 1.35)
    keyLight.position.set(-5, 9, 6)
    const violetLight = new THREE.PointLight(0xa364ff, 22, 28)
    violetLight.position.set(5, 3.4, 1)
    const goldLight = new THREE.PointLight(0xffc978, 16, 24)
    goldLight.position.set(-4, 2.7, 3)
    scene.add(ambient, keyLight, violetLight, goldLight)

    const backdropMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    })
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(32, 18), backdropMaterial)
    backdrop.position.set(0, 7.2, -11.5)
    scene.add(backdrop)
    disposables.push(backdrop.geometry, backdropMaterial)

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load('/assets/static-arrival-district.png', (texture) => {
      if (disposed) {
        texture.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 4
      backdropMaterial.map = texture
      backdropMaterial.needsUpdate = true
      disposables.push(texture)
    })

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: '#09050a',
      metalness: 0.78,
      roughness: 0.28,
      emissive: '#130a19',
      emissiveIntensity: 0.8,
    })
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.05
    scene.add(ground)
    disposables.push(ground.geometry, groundMaterial)

    const grid = new THREE.GridHelper(26, 32, 0xd8ad68, 0x4e277a)
    grid.material.transparent = true
    grid.material.opacity = 0.26
    grid.position.y = 0.01
    scene.add(grid)
    disposables.push(grid.geometry, grid.material)

    const roadMaterial = new THREE.MeshBasicMaterial({
      color: '#d8ad68',
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    ;[
      [0, 0.018, 0, 22, 0.025, 0.7],
      [-3.8, 0.02, 0, 0.035, 0.025, 15],
      [4.2, 0.02, -0.8, 0.035, 0.025, 13],
      [0, 0.022, -3.8, 22, 0.025, 0.08],
    ].forEach(([x, y, z, width, height, depth]) => {
      const lane = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), roadMaterial.clone())
      lane.position.set(x, y, z)
      scene.add(lane)
      disposables.push(lane.geometry, lane.material)
    })
    disposables.push(roadMaterial)

    districtVenues.forEach((venue) => {
      const node = createVenueNode(venue)
      scene.add(node.group)
      clickable.push(...node.clickTargets)
      venueVisuals.set(venue.id, node)
      disposables.push(...node.disposables)
    })

    districtPropertyLayer.forEach((property) => {
      const node = createPropertyNode(property)
      scene.add(node.group)
      disposables.push(...node.disposables)
    })

    for (let index = 0; index < 46; index += 1) {
      const color = index % 4 === 0 ? '#d8ad68' : '#9d63ff'
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (index % 3) * 0.01, 8, 8), material)
      body.position.set(
        -9.6 + ((index * 37) % 190) / 10,
        0.16 + (index % 4) * 0.02,
        -6.4 + ((index * 23) % 128) / 10,
      )
      body.userData.phase = index * 0.51
      body.userData.origin = body.position.clone()
      scene.add(body)
      crowd.push(body)
      disposables.push(body.geometry, body.material)
    }

    const player = createPlayerMarker()
    const activeVenue = districtVenues.find((venue) => venue.id === initialActiveVenueIdRef.current) || districtVenues[0]
    player.position.copy(mapVenueToWorld(activeVenue).add(new THREE.Vector3(0.4, 0, 1.2)))
    scene.add(player)
    disposables.push(...player.userData.disposables)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const cameraTarget = new THREE.Vector3()
    const desiredCamera = new THREE.Vector3()
    const movement = new THREE.Vector3()

    function resize() {
      const bounds = mount.getBoundingClientRect()
      const width = Math.max(1, Math.floor(bounds.width))
      const height = Math.max(1, Math.floor(bounds.height))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    function handlePointerUp(event) {
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(clickable, true).find((item) => item.object.userData.venueId)
      if (hit) selectVenueRef.current(hit.object.userData.venueId)
    }

    function animate(time = 0) {
      const delta = Math.min(48, lastTime ? time - lastTime : 16.7)
      lastTime = time
      movement.set(0, 0, 0)

      if (activeKeys.has('forward')) movement.z -= 1
      if (activeKeys.has('back')) movement.z += 1
      if (activeKeys.has('left')) movement.x -= 1
      if (activeKeys.has('right')) movement.x += 1

      if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar((reducedMotion ? 0.052 : 0.078) * (delta / 16.7))
        player.position.add(movement)
        player.position.x = THREE.MathUtils.clamp(player.position.x, -10.8, 10.8)
        player.position.z = THREE.MathUtils.clamp(player.position.z, -7.8, 8.2)
        player.rotation.y = Math.atan2(movement.x, movement.z)
      }

      let nearestId = ''
      let nearestDistance = Infinity
      districtVenues.forEach((venue) => {
        const visual = venueVisuals.get(venue.id)
        if (!visual) return
        const venuePosition = visual.group.position
        const distance = player.position.distanceTo(venuePosition)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestId = venue.id
        }
        const isSelected = selectedVenueIdRef.current === venue.id
        const isNear = distance < 1.8
        const pulse = reducedMotion ? 0.9 : 0.8 + Math.sin(time * 0.003 + venuePosition.x) * 0.16
        visual.ring.material.opacity = isSelected || isNear ? 0.78 : 0.34 * pulse
        visual.beacon.material.opacity = isSelected || isNear ? 0.92 : 0.42 * pulse
        visual.group.scale.lerp(new THREE.Vector3(isSelected ? 1.12 : isNear ? 1.06 : 1, isSelected ? 1.12 : isNear ? 1.06 : 1, isSelected ? 1.12 : isNear ? 1.06 : 1), 0.08)
        visual.billboard.lookAt(camera.position)
      })

      if (nearestDistance > 1.9) nearestId = ''
      if (nearestId !== lastNearestId) {
        lastNearestId = nearestId
        setNearestVenueId(nearestId || null)
      }

      crowd.forEach((person) => {
        if (reducedMotion) return
        person.position.x = person.userData.origin.x + Math.sin(time * 0.0007 + person.userData.phase) * 0.22
        person.position.z = person.userData.origin.z + Math.cos(time * 0.0009 + person.userData.phase) * 0.18
        person.material.opacity = 0.25 + Math.sin(time * 0.002 + person.userData.phase) * 0.13
      })

      cameraTarget.copy(player.position).add(new THREE.Vector3(0, 1.1, -1.2))
      desiredCamera.copy(player.position).add(new THREE.Vector3(0, 6.4, 9.4))
      camera.position.lerp(desiredCamera, reducedMotion ? 0.18 : 0.075)
      camera.lookAt(cameraTarget)

      if (!reducedMotion) {
        violetLight.position.x = 5 + Math.sin(time * 0.0009) * 2.2
        goldLight.position.z = 3 + Math.cos(time * 0.0008) * 2.5
      }

      renderer.render(scene, camera)
      animationId = window.requestAnimationFrame(animate)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    renderer.domElement.addEventListener('pointerup', handlePointerUp)
    animationId = window.requestAnimationFrame(animate)
    setIsBooted(true)

    return () => {
      disposed = true
      setIsBooted(false)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerup', handlePointerUp)
      window.cancelAnimationFrame(animationId)
      renderer.dispose()
      renderer.domElement.remove()
      disposables.forEach((item) => item?.dispose?.())
      activeKeys.clear()
    }
  }, [reducedMotion])

  useEffect(() => {
    function setKey(event, pressed) {
      const direction = keyMap[event.key.toLowerCase()]
      if (!direction) return
      event.preventDefault()
      setInputMode('keyboard')
      if (pressed) keysRef.current.add(direction)
      else keysRef.current.delete(direction)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onExit?.()
        return
      }
      setKey(event, true)
    }

    function handleKeyUp(event) {
      setKey(event, false)
    }

    function handleBlur() {
      keysRef.current.clear()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [onExit])

  function setPadDirection(direction, pressed) {
    setInputMode('touch')
    if (pressed) keysRef.current.add(direction)
    else keysRef.current.delete(direction)
  }

  function travelToSelected() {
    if (selectedVenue.id === 'sage') {
      onSummonSage?.()
      return
    }
    onTravelToVenue?.(selectedVenue)
  }

  function selectVenue(venue) {
    selectedVenueIdRef.current = venue.id
    setSelectedVenueId(venue.id)
    onSelectVenue?.(venue)
  }

  return (
    <section
      className="world-engine"
      aria-label="STATIC Arrival District world prototype"
      data-engine-mode={engineMode}
      tabIndex={-1}
      ref={shellRef}
    >
      <div className="world-engine__backdrop" aria-hidden="true" />
      <div className="world-engine__mount" ref={mountRef} />
      <div className="world-engine__scan" aria-hidden="true" />

      <header className="world-engine__topbar">
        <div>
          <span>STATIC WORLD ENGINE // V0.1</span>
          <h2>World Prototype</h2>
        </div>
        <button type="button" onClick={onExit}>Exit to public district</button>
      </header>

      <aside className="world-engine__hud" aria-live="polite">
        <span>{isBooted ? 'ENGINE PREVIEW LIVE' : 'BOOTING ENGINE PREVIEW'}</span>
        <h3>{selectedVenue.name}</h3>
        <p>{selectedVenue.copy}</p>
        <div className="world-engine__chips">
          <small>{inputMode === 'touch' ? 'Prototype pad active' : 'WASD prototype'}</small>
          <small>Click venue towers</small>
          <small>{nearestVenue ? `${nearestVenue.name} nearby` : 'Open district floor'}</small>
        </div>
        <button type="button" onClick={travelToSelected}>
          {selectedVenue.id === 'sage' ? 'Talk to S.A.G.E.' : `Travel to ${selectedVenue.name}`} <ArrowIcon />
        </button>
      </aside>

      <nav className="world-engine__venue-list" aria-label="World engine venue selector">
        {districtVenues.map((venue) => (
          <button
            className={venue.id === selectedVenue.id ? 'is-active' : ''}
            type="button"
            onClick={() => selectVenue(venue)}
            key={venue.id}
          >
            <span>{venue.name}</span>
            <small>{venue.engine.zone}</small>
          </button>
        ))}
      </nav>

      <div className="world-engine__truth-panel">
        <b>No fake backend</b>
        <p>NPCs, multiplayer, property ownership, commerce, voice memory, generation, and persistent avatars remain planned systems until wired to real services.</p>
      </div>

      <StaticNavMapPreview variant="engine" />
      <StaticCityLoopPrototype />

      <aside className="world-engine__property-panel" aria-label="Planned district property layer">
        <span>{districtCityScale.name} // VERTICAL CITY PLAN</span>
        <p>{districtCityScale.designRule}</p>
        <div>
          {cityHierarchyLevels.map((level) => (
            <article className="world-engine__city-tier" key={level.id}>
              <b>{level.tier} / {level.name}</b>
              <small>{level.elevation}</small>
            </article>
          ))}
          {districtPropertyLayer.map((property) => (
            <article key={property.id}>
              <b>{property.name}</b>
              <small>{property.type}</small>
            </article>
          ))}
        </div>
      </aside>

      <aside className="world-engine__creator-panel" aria-label="Create-a-player roadmap">
        <span>CREATE-A-PLAYER // NEXT</span>
        <p>The current marker is a placeholder. True gameplay needs a real Entity creator before we call it avatar walking.</p>
        <div>
          {createPlayerRoadmap.slice(0, 3).map(([title, copy]) => (
            <article key={title}>
              <b>{title}</b>
              <small>{copy}</small>
            </article>
          ))}
        </div>
      </aside>

      <div className="world-engine__controls" aria-label="Touch movement controls">
        <button type="button" onPointerDown={() => setPadDirection('forward', true)} onPointerUp={() => setPadDirection('forward', false)} onPointerLeave={() => setPadDirection('forward', false)}>↑</button>
        <button type="button" onPointerDown={() => setPadDirection('left', true)} onPointerUp={() => setPadDirection('left', false)} onPointerLeave={() => setPadDirection('left', false)}>←</button>
        <button type="button" onPointerDown={() => setPadDirection('back', true)} onPointerUp={() => setPadDirection('back', false)} onPointerLeave={() => setPadDirection('back', false)}>↓</button>
        <button type="button" onPointerDown={() => setPadDirection('right', true)} onPointerUp={() => setPadDirection('right', false)} onPointerLeave={() => setPadDirection('right', false)}>→</button>
      </div>
    </section>
  )
}

function createVenueNode(venue) {
  const position = mapVenueToWorld(venue)
  const color = venueColors[venue.id] || '#d8ad68'
  const group = new THREE.Group()
  const clickTargets = []
  const disposables = []
  group.position.copy(position)

  const towerHeight = 0.85 + (venue.name.length % 5) * 0.18
  const towerGeometry = new THREE.BoxGeometry(0.62, towerHeight, 0.62)
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: '#0b0710',
    metalness: 0.76,
    roughness: 0.2,
    emissive: color,
    emissiveIntensity: 0.5,
  })
  const tower = new THREE.Mesh(towerGeometry, towerMaterial)
  tower.position.y = towerHeight / 2
  tower.userData.venueId = venue.id
  group.add(tower)
  clickTargets.push(tower)

  const ringMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.012, 8, 68), ringMaterial)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.035
  ring.userData.venueId = venue.id
  group.add(ring)
  clickTargets.push(ring)

  const beaconMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.12, 2.2, 14, 1, true), beaconMaterial)
  beacon.position.y = 1.25
  beacon.userData.venueId = venue.id
  group.add(beacon)
  clickTargets.push(beacon)

  const labelTexture = createLabelTexture(venue.name, venue.eyebrow, color)
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const billboard = new THREE.Mesh(new THREE.PlaneGeometry(1.74, 0.72), labelMaterial)
  billboard.position.y = towerHeight + 0.74
  billboard.userData.venueId = venue.id
  group.add(billboard)
  clickTargets.push(billboard)

  disposables.push(towerGeometry, towerMaterial, ring.geometry, ringMaterial, beacon.geometry, beaconMaterial, labelTexture, billboard.geometry, labelMaterial)
  return { group, ring, beacon, billboard, clickTargets, disposables }
}

function createPropertyNode(property) {
  const position = mapPropertyToWorld(property)
  const group = new THREE.Group()
  const disposables = []
  group.position.copy(position)

  const baseMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const height = property.engine.elevation || 1.6
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.72, 0.04, 6), baseMaterial)
  base.rotation.y = Math.PI / 6
  base.position.y = 0.045
  group.add(base)

  const towerMaterial = new THREE.MeshBasicMaterial({
    color: property.id === 'hilltop-casino-hotel' ? '#fff0ca' : '#9d63ff',
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const tower = new THREE.Mesh(new THREE.ConeGeometry(0.32, height, 4), towerMaterial)
  tower.position.y = height / 2
  tower.rotation.y = Math.PI / 4
  group.add(tower)

  const labelTexture = createLabelTexture(property.name, property.type, '#fff0ca')
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const billboard = new THREE.Mesh(new THREE.PlaneGeometry(1.54, 0.62), labelMaterial)
  billboard.position.y = height + 0.42
  group.add(billboard)

  disposables.push(base.geometry, baseMaterial, tower.geometry, towerMaterial, labelTexture, billboard.geometry, labelMaterial)
  return { group, disposables }
}

function createPlayerMarker() {
  const group = new THREE.Group()
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#fff4cf',
    emissive: '#d8ad68',
    emissiveIntensity: 0.72,
    metalness: 0.54,
    roughness: 0.22,
  })
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.72, 24), bodyMaterial)
  body.position.y = 0.52
  group.add(body)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), bodyMaterial.clone())
  head.position.y = 0.98
  group.add(head)

  const signalMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const signal = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.01, 8, 64), signalMaterial)
  signal.rotation.x = Math.PI / 2
  signal.position.y = 0.04
  group.add(signal)

  group.userData.disposables = [body.geometry, bodyMaterial, head.geometry, head.material, signal.geometry, signalMaterial]
  return group
}

function createLabelTexture(title, subtitle, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 256
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(5, 2, 7, 0.78)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = color
  context.lineWidth = 5
  context.strokeRect(14, 14, canvas.width - 28, canvas.height - 28)
  context.fillStyle = '#fff8ef'
  context.font = '900 54px Orbitron, Rajdhani, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(title.toUpperCase(), canvas.width / 2, 102, canvas.width - 70)
  context.fillStyle = color
  context.font = '800 28px Rajdhani, sans-serif'
  context.fillText(subtitle.toUpperCase(), canvas.width / 2, 166, canvas.width - 80)
  context.fillStyle = 'rgba(255, 248, 239, 0.34)'
  context.font = '700 18px Rajdhani, sans-serif'
  context.fillText('CLICK / SELECT / TRAVEL', canvas.width / 2, 208)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function mapVenueToWorld(venue) {
  return new THREE.Vector3(
    (venue.engine.spawn.x - 50) * 0.19,
    0,
    (venue.engine.spawn.y - 50) * 0.16,
  )
}

function mapPropertyToWorld(property) {
  return new THREE.Vector3(
    (property.engine.spawn.x - 50) * 0.19,
    0,
    (property.engine.spawn.y - 50) * 0.16,
  )
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)

    function handleChange(event) {
      setReducedMotion(event.matches)
    }

    if (media.addEventListener) {
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }
    media.addListener(handleChange)
    return () => media.removeListener(handleChange)
  }, [])

  return reducedMotion
}
