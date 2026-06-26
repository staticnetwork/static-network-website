import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { staticCityModelSlots } from '../../lib/worldEngine/staticCityModelAssets'

const nodeColors = {
  property: '#fff0ca',
  landmark: '#fff0ca',
  travel: '#d8ad68',
  route: '#d8ad68',
  venue: '#9d63ff',
  event: '#e56cff',
  market: '#ffb45e',
  social: '#e56cff',
  vehicle: '#d8ad68',
  race: '#ff4f9a',
  sport: '#ff7a2f',
  nightlife: '#e56cff',
  crew: '#55ddff',
  conflict: '#ff6f3d',
  companion: '#72ffba',
}

const vehicleBeats = new Set(['valet', 'drive-to-radio', 'mall-stop', 'radio-arrival', 'vibe-mode', 'return-tower'])
const penthouseNodeIds = new Set(['penthouse-spawn', 'penthouse-elevator', 'static-tower'])

function mapPercentToWorld(point) {
  return new THREE.Vector3((point.x - 50) / 3.9, 0, (point.y - 50) / 4.35)
}

function dampAngle(current, target, alpha) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + delta * alpha
}

export default function StaticCityEngineView({
  nodes,
  routeNodes,
  billboards = [],
  entityPosition,
  activeNodeId,
  activeBeat,
  playerMotion,
  sceneZone = 'city',
  guardianSquad = [],
  sequenceState,
  onSelectNode,
}) {
  const mountRef = useRef(null)
  const stateRef = useRef({
    entityPosition,
    activeNodeId,
    activeBeat,
    playerMotion,
    sceneZone,
    guardianSquad,
    sequenceState,
    onSelectNode,
  })

  useEffect(() => {
    stateRef.current = { entityPosition, activeNodeId, activeBeat, playerMotion, sceneZone, guardianSquad, sequenceState, onSelectNode }
  }, [activeBeat, activeNodeId, entityPosition, guardianSquad, onSelectNode, playerMotion, sceneZone, sequenceState])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let disposed = false
    let animationId = 0
    let lastTime = 0
    const disposables = []
    const clickable = []
    const nodeVisuals = new Map()
    const billboardPanels = []
    const puddleLights = []
    const roadSegments = []
    const crowd = []

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050207, 0.032)

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120)
    camera.position.set(0, 10.5, 14.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.className = 'static-city-engine__canvas'
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xd7b57f, 0.7)
    const keyLight = new THREE.DirectionalLight(0xffe4ad, 1.4)
    keyLight.position.set(-6, 10, 7)
    const violetLight = new THREE.PointLight(0x9d63ff, 34, 34)
    violetLight.position.set(5.4, 4, -1.6)
    const goldLight = new THREE.PointLight(0xd8ad68, 26, 30)
    goldLight.position.set(-5.8, 4, 3.2)
    scene.add(ambient, keyLight, violetLight, goldLight)

    const backdropMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    })
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(34, 18), backdropMaterial)
    backdrop.position.set(0, 8, -13.5)
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

    const penthouseInterior = createPenthouseInterior()
    scene.add(penthouseInterior.group)
    disposables.push(...penthouseInterior.disposables)
    textureLoader.load('/assets/static-arrival-district.png', (texture) => {
      if (disposed) {
        texture.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 4
      penthouseInterior.skylineScreen.material.map = texture
      penthouseInterior.skylineScreen.material.needsUpdate = true
      disposables.push(texture)
    })

    const skyline = createCinematicSkyline()
    scene.add(skyline.group)
    disposables.push(...skyline.disposables)

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: '#090509',
      metalness: 0.72,
      roughness: 0.22,
      emissive: '#130814',
      emissiveIntensity: 0.74,
    })
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(25, 22), groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.08
    scene.add(ground)
    disposables.push(ground.geometry, groundMaterial)

    const grid = new THREE.GridHelper(25, 36, 0xd8ad68, 0x432560)
    grid.material.transparent = true
    grid.material.opacity = 0.22
    grid.position.y = 0.01
    scene.add(grid)
    disposables.push(grid.geometry, grid.material)

    const puddleGeometry = new THREE.CircleGeometry(0.36, 32)
    const puddleMaterial = new THREE.MeshBasicMaterial({
      color: '#d8ad68',
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    routeNodes.forEach((node, index) => {
      const point = mapPercentToWorld(node)
      const puddle = new THREE.Mesh(puddleGeometry, puddleMaterial.clone())
      puddle.rotation.x = -Math.PI / 2
      puddle.position.set(point.x, 0.018, point.z)
      puddle.scale.setScalar(0.74 + (index % 4) * 0.16)
      puddle.userData.phase = index * 0.52
      scene.add(puddle)
      puddleLights.push(puddle)
      disposables.push(puddle.material)
    })
    disposables.push(puddleGeometry, puddleMaterial)

    const mountainMaterial = new THREE.MeshBasicMaterial({
      color: '#d8ad68',
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    ;[
      [0, 0.03, -7.2, 8.2, 0.05, 1.6],
      [0, 0.045, -4.6, 13.8, 0.05, 2.2],
      [0, 0.06, -1.4, 18.6, 0.05, 3.4],
      [0, 0.075, 3.2, 22, 0.05, 5.2],
    ].forEach(([x, y, z, width, height, depth], index) => {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mountainMaterial.clone())
      tier.position.set(x, y, z)
      tier.userData.phase = index
      scene.add(tier)
      disposables.push(tier.geometry, tier.material)
    })
    disposables.push(mountainMaterial)

    const roadMaterial = new THREE.MeshBasicMaterial({
      color: '#d8ad68',
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    routeNodes.forEach((node, index) => {
      if (index === 0) return
      const previous = mapPercentToWorld(routeNodes[index - 1])
      const current = mapPercentToWorld(node)
      const midpoint = previous.clone().add(current).multiplyScalar(0.5)
      const length = previous.distanceTo(current)
      const angle = Math.atan2(current.x - previous.x, current.z - previous.z)
      const segment = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, length), roadMaterial.clone())
      segment.position.set(midpoint.x, 0.05, midpoint.z)
      segment.rotation.y = angle
      scene.add(segment)
      roadSegments.push(segment)
      disposables.push(segment.geometry, segment.material)
    })
    disposables.push(roadMaterial)

    const routeGeometry = new THREE.BufferGeometry().setFromPoints(routeNodes.map((node) => {
      const point = mapPercentToWorld(node)
      point.y = 0.15
      return point
    }))
    const routeMaterial = new THREE.LineBasicMaterial({
      color: '#fff0ca',
      transparent: true,
      opacity: 0.68,
    })
    const routeLine = new THREE.Line(routeGeometry, routeMaterial)
    scene.add(routeLine)
    disposables.push(routeGeometry, routeMaterial)

    billboards.forEach((billboard) => {
      const visual = createDistrictBillboard(billboard)
      scene.add(visual.group)
      billboardPanels.push(visual)
      disposables.push(...visual.disposables)

      textureLoader.load(billboard.src, (texture) => {
        if (disposed) {
          texture.dispose()
          return
        }
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 4
        visual.screen.material.map = texture
        visual.screen.material.needsUpdate = true
        disposables.push(texture)
      })
    })

    nodes.forEach((node) => {
      const visual = createCityNode(node)
      scene.add(visual.group)
      clickable.push(...visual.clickTargets)
      nodeVisuals.set(node.id, visual)
      disposables.push(...visual.disposables)
    })

    for (let index = 0; index < 72; index += 1) {
      const cluster = index % 3
      const center = cluster === 0
        ? mapPercentToWorld({ x: 58, y: 61 })
        : cluster === 1
          ? mapPercentToWorld({ x: 43, y: 66 })
          : mapPercentToWorld({ x: 32, y: 82 })
      const material = new THREE.MeshBasicMaterial({
        color: cluster === 0 ? '#e56cff' : cluster === 1 ? '#d8ad68' : '#9d63ff',
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (index % 4) * 0.008, 8, 8), material)
      body.position.set(
        center.x + Math.sin(index * 12.989) * (0.45 + (index % 6) * 0.16),
        0.18 + (index % 5) * 0.025,
        center.z + Math.cos(index * 7.31) * (0.45 + (index % 7) * 0.12),
      )
      body.userData.origin = body.position.clone()
      body.userData.phase = index * 0.43
      scene.add(body)
      crowd.push(body)
      disposables.push(body.geometry, body.material)
    }

    const player = createMrStoneMarker()
    scene.add(player)
    disposables.push(...player.userData.disposables)

    const vehicle = createVehicleShell()
    scene.add(vehicle)
    disposables.push(...vehicle.userData.disposables)

    const guardians = createGuardianSquad(guardianSquad)
    scene.add(guardians.group)
    disposables.push(...guardians.disposables)

    const marketWalkSet = createMarketWalkSet()
    scene.add(marketWalkSet.group)
    disposables.push(...marketWalkSet.disposables)

    const radioRooftopSet = createRadioRooftopSet()
    scene.add(radioRooftopSet.group)
    disposables.push(...radioRooftopSet.disposables)

    const vibeModeSet = createVibeModeSet()
    scene.add(vibeModeSet.group)
    disposables.push(...vibeModeSet.disposables)

    const towerReturnSet = createTowerReturnSet()
    scene.add(towerReturnSet.group)
    disposables.push(...towerReturnSet.disposables)

    const gltfLoader = new GLTFLoader()
    const replacementModels = {
      mrStone: { root: new THREE.Group(), loaded: false },
      stoneSuv: { root: new THREE.Group(), loaded: false },
    }
    replacementModels.mrStone.root.name = 'mr-stone-glb-slot'
    replacementModels.stoneSuv.root.name = 'stone-suv-glb-slot'
    replacementModels.mrStone.root.visible = false
    replacementModels.stoneSuv.root.visible = false
    scene.add(replacementModels.mrStone.root, replacementModels.stoneSuv.root)

    loadStaticCityModelSlot(staticCityModelSlots.mrStone, gltfLoader, replacementModels.mrStone, disposables, () => disposed)
    loadStaticCityModelSlot(staticCityModelSlots.stoneSuv, gltfLoader, replacementModels.stoneSuv, disposables, () => disposed)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const playerTarget = new THREE.Vector3()
    const cameraTarget = new THREE.Vector3()
    const desiredCamera = new THREE.Vector3()

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
      const hit = raycaster.intersectObjects(clickable, true).find((item) => item.object.userData.nodeId)
      const nodeId = hit?.object?.userData?.nodeId
      const node = nodes.find((item) => item.id === nodeId)
      if (node) stateRef.current.onSelectNode?.(node)
    }

    function animate(time = 0) {
      const delta = Math.min(48, lastTime ? time - lastTime : 16.7)
      lastTime = time
      const {
        entityPosition: currentPosition,
        activeNodeId: currentNodeId,
        activeBeat: currentBeat,
        playerMotion: currentMotion,
        sceneZone: currentSceneZone,
        guardianSquad: currentGuardianSquad,
        sequenceState: currentSequence,
      } = stateRef.current
      const inPenthouse = currentSceneZone === 'penthouse'
      const walking = (currentMotion?.speed || 0) > 0.1
      const marketActive = !inPenthouse && (currentSceneZone === 'market' || currentSequence?.marketArrival || currentSequence?.marketInterior)
      const radioActive = !inPenthouse && (currentSequence?.radioArrival || currentSequence?.rooftopReveal || currentSequence?.vipEscort || currentBeat?.id === 'vip')
      const vibeActive = !inPenthouse && (currentSequence?.vibeMode || currentSequence?.stripCruise || currentSequence?.firstPersonDrive || currentBeat?.id === 'vibe-mode')
      const returnActive = !inPenthouse && (currentSequence?.returnDrive || currentSequence?.towerApproach || currentSequence?.valetTip || currentBeat?.id === 'return-tower')

      penthouseInterior.group.visible = inPenthouse
      skyline.group.visible = !inPenthouse
      grid.visible = !inPenthouse
      routeLine.visible = !inPenthouse
      ground.visible = !inPenthouse
      roadSegments.forEach((segment) => {
        segment.visible = !inPenthouse
        segment.material.opacity = currentSequence?.routePulse
          ? 0.36 + Math.sin(time * 0.006 + segment.position.z) * 0.14
          : 0.18
      })

      playerTarget.copy(mapPercentToWorld(currentPosition))
      playerTarget.y = inPenthouse ? 0.2 : 0.16
      const playerHiddenInVehicle = Boolean(currentSequence?.playerInVehicle)
      const useMrStoneModel = replacementModels.mrStone.loaded && !playerHiddenInVehicle
      player.visible = !useMrStoneModel && !playerHiddenInVehicle
      player.position.lerp(playerTarget, Math.min(1, 0.11 * (delta / 16.7)))
      player.position.y = playerTarget.y + (walking ? Math.abs(Math.sin(time * 0.009)) * 0.035 : Math.sin(time * 0.0018) * 0.01)
      player.rotation.y = dampAngle(player.rotation.y, currentMotion?.facing ?? player.rotation.y, 0.18)
      replacementModels.mrStone.root.visible = useMrStoneModel
      if (useMrStoneModel) {
        replacementModels.mrStone.root.position.copy(player.position)
        replacementModels.mrStone.root.rotation.y = player.rotation.y
        replacementModels.mrStone.root.scale.setScalar(1 + (walking ? Math.sin(time * 0.012) * 0.012 : Math.sin(time * 0.0015) * 0.006))
      }

      const parts = player.userData.parts || {}
      const stride = walking ? Math.sin(time * 0.011) : 0
      if (parts.leftLeg && parts.rightLeg && parts.leftArm && parts.rightArm) {
        parts.leftLeg.rotation.x = stride * 0.42
        parts.rightLeg.rotation.x = -stride * 0.42
        parts.leftArm.rotation.x = -stride * 0.34
        parts.rightArm.rotation.x = stride * 0.34
        parts.torso.rotation.z = walking ? Math.sin(time * 0.01) * 0.025 : Math.sin(time * 0.0015) * 0.015
      }
      if (parts.fitTrim) {
        parts.fitTrim.visible = Boolean(currentSequence?.outfitUpgrade || currentSequence?.jewelryUpgrade || currentSequence?.statusUpgrade)
        parts.fitTrim.material.opacity = currentSequence?.outfitUpgrade ? 0.72 + Math.sin(time * 0.01) * 0.12 : 0.22
      }
      if (parts.watch) {
        parts.watch.visible = Boolean(currentSequence?.jewelryUpgrade || currentSequence?.statusUpgrade)
        parts.watch.material.opacity = currentSequence?.jewelryUpgrade ? 0.84 + Math.sin(time * 0.012) * 0.1 : 0.28
      }
      if (parts.statusPass) {
        parts.statusPass.visible = Boolean(currentSequence?.statusUpgrade)
        parts.statusPass.material.opacity = currentSequence?.statusUpgrade ? 0.82 + Math.sin(time * 0.008) * 0.1 : 0.22
      }
      if (parts.drink) {
        parts.drink.visible = Boolean(currentSequence?.drinkProp || currentSequence?.seatedVip)
        parts.drink.material.opacity = currentSequence?.drinkProp ? 0.82 + Math.sin(time * 0.01) * 0.08 : 0.32
      }
      if (parts.cigar) {
        parts.cigar.visible = Boolean(currentSequence?.cigarProp || currentSequence?.seatedVip)
        parts.cigar.material.opacity = currentSequence?.cigarProp ? 0.76 + Math.sin(time * 0.012) * 0.1 : 0.28
      }

      penthouseInterior.elevatorGlow.material.opacity = inPenthouse ? 0.36 + Math.sin(time * 0.003) * 0.16 : 0
      const elevatorOpen = inPenthouse && Boolean(currentSequence?.doorOpen)
      penthouseInterior.leftDoor.position.x += ((elevatorOpen ? 0.72 : 1.02) - penthouseInterior.leftDoor.position.x) * 0.13
      penthouseInterior.rightDoor.position.x += ((elevatorOpen ? 1.76 : 1.46) - penthouseInterior.rightDoor.position.x) * 0.13
      penthouseInterior.elevatorPortal.material.opacity = elevatorOpen ? 0.42 + Math.sin(time * 0.006) * 0.16 : 0.08
      penthouseInterior.pathLights.forEach((light, index) => {
        light.material.opacity = inPenthouse ? 0.22 + Math.sin(time * 0.004 + index) * 0.11 : 0
      })

      const vehicleVisible = vehicleBeats.has(currentBeat?.id) && !inPenthouse
      vehicle.visible = vehicleVisible && !replacementModels.stoneSuv.loaded
      replacementModels.stoneSuv.root.visible = vehicleVisible && replacementModels.stoneSuv.loaded
      if (vehicleVisible) {
        const sequenceOffset = currentSequence?.vehicleOffset
        const vehicleOffset = sequenceOffset
          ? new THREE.Vector3(sequenceOffset.x || 0, 0.08, sequenceOffset.z || 0)
          : new THREE.Vector3(0.42, 0.08, 0.42)
        const vehicleAlpha = currentSequence?.vehicleDriving ? 0.16 : currentSequence?.vehicleApproach ? 0.08 : 0.12
        vehicle.position.lerp(playerTarget.clone().add(vehicleOffset), vehicleAlpha)
        const vehicleHeading = currentSequence?.vehicleDriving
          ? (currentMotion?.facing ?? -0.35)
          : currentBeat?.id === 'return-tower' ? -0.7 : currentBeat?.id === 'vibe-mode' ? -1.1 : -0.35
        vehicle.rotation.y = dampAngle(vehicle.rotation.y, vehicleHeading, currentSequence?.vehicleDriving ? 0.12 : 0.2)
        if (replacementModels.stoneSuv.loaded) {
          replacementModels.stoneSuv.root.position.copy(vehicle.position)
          replacementModels.stoneSuv.root.rotation.y = vehicle.rotation.y
        }
        const vehicleParts = vehicle.userData.parts || {}
        const vehicleDoorOpen = Boolean(currentSequence?.vehicleDoorOpen || currentSequence?.enteringVehicle)
        const radioBoot = Boolean(currentSequence?.radioBoot)
        if (vehicleParts.leftDoorPivot) {
          vehicleParts.leftDoorPivot.rotation.y = dampAngle(vehicleParts.leftDoorPivot.rotation.y, vehicleDoorOpen ? -0.92 : 0, 0.14)
        }
        if (vehicleParts.cabin) {
          vehicleParts.cabin.material.opacity += ((radioBoot ? 0.52 : 0.34) - vehicleParts.cabin.material.opacity) * 0.08
        }
        if (vehicleParts.radioGlow) {
          vehicleParts.radioGlow.material.opacity = radioBoot ? 0.56 + Math.sin(time * 0.009) * 0.18 : 0.08
        }
        if (vehicleParts.radioHud) {
          vehicleParts.radioHud.visible = Boolean(radioBoot || currentSequence?.staticBlues)
          vehicleParts.radioHud.material.opacity = currentSequence?.staticBlues ? 0.9 + Math.sin(time * 0.012) * 0.08 : radioBoot ? 0.62 : 0.18
        }
        if (vehicleParts.windowGlass) {
          const windowDown = Boolean(currentSequence?.windowDown)
          vehicleParts.windowGlass.material.opacity += ((windowDown ? 0.06 : 0.28) - vehicleParts.windowGlass.material.opacity) * 0.12
          vehicleParts.windowGlass.position.y += ((windowDown ? 0.22 : 0.42) - vehicleParts.windowGlass.position.y) * 0.12
        }
        if (vehicleParts.windowFrame) {
          vehicleParts.windowFrame.material.opacity = currentSequence?.firstPersonDrive ? 0.72 + Math.sin(time * 0.006) * 0.06 : 0.34
        }
        if (vehicleParts.underGlow) {
          vehicleParts.underGlow.material.opacity = currentSequence?.vehicleApproach || currentSequence?.vehicleDriving ? 0.34 + Math.sin(time * 0.006) * 0.12 : 0.16
        }
        if (vehicleParts.wheels) {
          vehicleParts.wheels.forEach((wheel) => {
            wheel.rotation.x += currentSequence?.vehicleDriving ? 0.34 : 0.04
          })
        }
      } else {
        const vehicleParts = vehicle.userData.parts || {}
        if (vehicleParts.leftDoorPivot) vehicleParts.leftDoorPivot.rotation.y = dampAngle(vehicleParts.leftDoorPivot.rotation.y, 0, 0.14)
      }

      const guardianSubject = playerHiddenInVehicle && vehicleVisible ? vehicle.position : player.position
      guardians.members.forEach((guardian, index) => {
        const config = currentGuardianSquad?.find((item) => item.id === guardian.config.id) || guardian.config
        const offset = config.offset || guardian.config.offset || { x: 0.8 + index * 0.4, y: 0.1, z: 0.8 }
        const target = new THREE.Vector3(offset.x || 0, offset.y || 0, offset.z || 0)
        target.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y)
        target.add(guardianSubject)
        const hiddenIndoorPerimeter = inPenthouse && config.indoorMode === 'perimeter'
        guardian.group.visible = !hiddenIndoorPerimeter
        guardian.group.position.lerp(target, Math.min(1, (0.055 + index * 0.012) * (delta / 16.7)))
        guardian.group.position.y = target.y + Math.sin(time * (0.0018 + index * 0.0004) + index) * (config.scaleClass === 'small' ? 0.09 : 0.035)
        guardian.group.rotation.y = dampAngle(guardian.group.rotation.y, currentMotion?.facing ?? guardian.group.rotation.y, 0.11)
        guardian.aura.rotation.z += 0.01 + index * 0.003
        guardian.aura.material.opacity = 0.24 + Math.sin(time * 0.004 + index) * 0.08
        if (guardian.parts.wingLeft && guardian.parts.wingRight) {
          const flap = Math.sin(time * 0.006 + index) * 0.28
          guardian.parts.wingLeft.rotation.z = 0.52 + flap
          guardian.parts.wingRight.rotation.z = -0.52 - flap
        }
        if (guardian.parts.staffGlow) {
          guardian.parts.staffGlow.material.opacity = 0.36 + Math.sin(time * 0.01) * 0.18
        }
        if (guardian.label) guardian.label.lookAt(camera.position)
      })

      nodeVisuals.forEach((visual, nodeId) => {
        const active = nodeId === currentNodeId || (currentSequence?.marketArrival && nodeId === 'market-walk')
        visual.group.visible = !inPenthouse || penthouseNodeIds.has(nodeId)
        const pulse = 0.72 + Math.sin(time * 0.003 + visual.group.position.x) * 0.2
        visual.ring.material.opacity = active ? 0.9 : 0.28 + pulse * 0.18
        visual.beacon.material.opacity = active ? 0.82 : 0.28 + pulse * 0.16
        visual.group.scale.lerp(new THREE.Vector3(active ? 1.14 : 1, active ? 1.14 : 1, active ? 1.14 : 1), 0.08)
        visual.label.lookAt(camera.position)
      })

      crowd.forEach((person) => {
        person.visible = !inPenthouse
        const heat = currentSequence?.crowdHeat ? 1.8 : 1
        person.position.x = person.userData.origin.x + Math.sin(time * 0.001 * heat + person.userData.phase) * 0.16 * heat
        person.position.z = person.userData.origin.z + Math.cos(time * 0.0013 * heat + person.userData.phase) * 0.13 * heat
        person.material.opacity = 0.23 + Math.sin(time * 0.002 * heat + person.userData.phase) * (currentSequence?.crowdHeat ? 0.22 : 0.12)
      })

      puddleLights.forEach((puddle) => {
        puddle.visible = !inPenthouse
        puddle.material.opacity = 0.09 + Math.sin(time * 0.0016 + puddle.userData.phase) * 0.045
      })

      marketWalkSet.group.visible = marketActive
      if (marketActive) {
        marketWalkSet.boutiqueGlow.material.opacity = currentSequence?.boutiqueLights ? 0.32 + Math.sin(time * 0.006) * 0.1 : 0.12
        marketWalkSet.statusMirror.material.opacity = currentSequence?.statusUpgrade ? 0.88 + Math.sin(time * 0.008) * 0.08 : currentSequence?.marketInterior ? 0.56 : 0.24
        marketWalkSet.wardrobeWall.material.opacity = currentSequence?.outfitUpgrade ? 0.82 + Math.sin(time * 0.009) * 0.1 : currentSequence?.marketInterior ? 0.46 : 0.2
        marketWalkSet.jewelryCase.material.opacity = currentSequence?.jewelryUpgrade ? 0.86 + Math.sin(time * 0.012) * 0.1 : currentSequence?.marketInterior ? 0.42 : 0.18
        marketWalkSet.floor.material.opacity = currentSequence?.marketInterior ? 0.24 : 0.12
        marketWalkSet.lights.forEach((light, index) => {
          light.material.opacity = currentSequence?.boutiqueLights ? 0.24 + Math.sin(time * 0.006 + index) * 0.11 : 0.08
        })
      }

      radioRooftopSet.group.visible = radioActive
      if (radioActive) {
        radioRooftopSet.entranceSign.material.opacity = currentSequence?.radioArrival ? 0.84 + Math.sin(time * 0.009) * 0.1 : 0.28
        radioRooftopSet.rooftopFloor.material.opacity = currentSequence?.rooftopReveal ? 0.28 + Math.sin(time * 0.004) * 0.08 : 0.12
        radioRooftopSet.djBooth.material.opacity = currentSequence?.rooftopReveal ? 0.82 + Math.sin(time * 0.011) * 0.12 : 0.26
        radioRooftopSet.vipCouch.material.opacity = currentSequence?.vipEscort || currentSequence?.seatedVip ? 0.76 + Math.sin(time * 0.007) * 0.08 : 0.24
        radioRooftopSet.bottleService.material.opacity = currentSequence?.drinkProp || currentSequence?.cigarProp ? 0.84 + Math.sin(time * 0.012) * 0.1 : 0.2
        radioRooftopSet.elevatorGlow.material.opacity = currentSequence?.elevatorCue ? 0.68 + Math.sin(time * 0.01) * 0.12 : 0.16
        radioRooftopSet.lights.forEach((light, index) => {
          light.material.opacity = currentSequence?.broadcastLights || currentSequence?.rooftopReveal
            ? 0.24 + Math.sin(time * 0.007 + index) * 0.13
            : 0.08
        })
      }

      vibeModeSet.group.visible = vibeActive
      if (vibeActive) {
        vibeModeSet.road.material.opacity = currentSequence?.stripCruise ? 0.28 + Math.sin(time * 0.005) * 0.08 : 0.14
        vibeModeSet.windowFrame.material.opacity = currentSequence?.windowDown ? 0.72 + Math.sin(time * 0.004) * 0.06 : 0.28
        vibeModeSet.radioPanel.material.opacity = currentSequence?.staticBlues ? 0.92 + Math.sin(time * 0.011) * 0.06 : 0.34
        vibeModeSet.windLines.forEach((line, index) => {
          line.material.opacity = currentSequence?.cityWind ? 0.18 + Math.sin(time * 0.018 + index) * 0.1 : 0.03
          line.position.x = line.userData.originX + Math.sin(time * 0.003 + index) * 0.32
        })
        vibeModeSet.lightStreaks.forEach((streak, index) => {
          streak.position.z = streak.userData.originZ + ((time * 0.0022 + index * 0.74) % 3.8) - 1.9
          streak.material.opacity = currentSequence?.stripCruise ? 0.24 + Math.sin(time * 0.01 + index) * 0.12 : 0.08
        })
        vibeModeSet.billboards.forEach((board, index) => {
          board.material.opacity = currentSequence?.billboardSweep ? 0.82 + Math.sin(time * 0.008 + index) * 0.12 : 0.3
          board.position.y = board.userData.baseY + Math.sin(time * 0.003 + index) * 0.08
        })
      }

      towerReturnSet.group.visible = returnActive
      if (returnActive) {
        towerReturnSet.road.material.opacity = currentSequence?.returnDrive ? 0.28 + Math.sin(time * 0.004) * 0.08 : 0.12
        towerReturnSet.tower.material.emissiveIntensity = currentSequence?.towerApproach ? 1.15 + Math.sin(time * 0.005) * 0.18 : 0.58
        towerReturnSet.valetRing.material.opacity = currentSequence?.valetTip ? 0.86 + Math.sin(time * 0.012) * 0.08 : currentSequence?.towerApproach ? 0.46 : 0.14
        towerReturnSet.tipFlash.material.opacity = currentSequence?.valetTip ? 0.72 + Math.sin(time * 0.018) * 0.14 : 0
        towerReturnSet.completionGate.material.opacity = currentSequence?.missionComplete ? 0.88 + Math.sin(time * 0.008) * 0.08 : 0.18
      }

      billboardPanels.forEach((panel) => {
        panel.group.visible = !inPenthouse
        const active = panel.billboard.nodeId === currentNodeId
          || panel.billboard.nodeId === currentBeat?.nodeId
          || Boolean(currentSequence?.billboardSweep)
          || (currentSequence?.marketArrival && panel.billboard.nodeId === 'market-walk')
        const pulse = Math.sin(time * 0.0024 + panel.group.position.x) * 0.08
        panel.group.position.y = panel.baseY + pulse
        panel.screen.material.opacity = active ? 0.9 : 0.62 + pulse
        panel.frame.material.opacity = active ? 0.86 : 0.44 + pulse
        panel.halo.material.opacity = active ? 0.42 : 0.2 + pulse * 0.7
        panel.label.lookAt(camera.position)
      })

      const mode = currentBeat?.camera
      const cameraSubject = currentSequence?.playerInVehicle && vehicleVisible ? vehicle.position : player.position
      if (inPenthouse) {
        const behind = new THREE.Vector3(
          -Math.sin(player.rotation.y) * 2.15,
          1.55,
          -Math.cos(player.rotation.y) * 2.15,
        )
        desiredCamera.copy(player.position).add(behind)
        cameraTarget.copy(player.position).add(new THREE.Vector3(0, 0.86, 0))
      } else if (mode === 'first-person-window') {
        desiredCamera.copy(cameraSubject).add(new THREE.Vector3(-0.55, 1.2, 1.2))
        cameraTarget.copy(cameraSubject).add(new THREE.Vector3(-4.6, 1.1, 4.8))
      } else if (mode === 'far-third-person') {
        desiredCamera.copy(cameraSubject).add(new THREE.Vector3(0, 11.2, 15.5))
        cameraTarget.copy(cameraSubject).add(new THREE.Vector3(0, 0.8, -1.2))
      } else if (mode === 'vehicle-chase') {
        desiredCamera.copy(cameraSubject).add(new THREE.Vector3(0, 4.8, 7.8))
        cameraTarget.copy(cameraSubject).add(new THREE.Vector3(0, 0.7, -1.2))
      } else if (mode === 'shopping-third-person' || mode === 'social-third-person') {
        desiredCamera.copy(cameraSubject).add(new THREE.Vector3(1.8, 4.2, 5.6))
        cameraTarget.copy(cameraSubject).add(new THREE.Vector3(0, 0.95, 0))
      } else {
        desiredCamera.copy(cameraSubject).add(new THREE.Vector3(0, 6.2, 8.6))
        cameraTarget.copy(cameraSubject).add(new THREE.Vector3(0, 1, 0))
      }

      camera.position.lerp(desiredCamera, 0.075)
      camera.lookAt(cameraTarget)

      violetLight.position.x = 5.4 + Math.sin(time * 0.0009) * 2.6
      goldLight.position.z = 3.2 + Math.cos(time * 0.0008) * 2.8

      renderer.render(scene, camera)
      animationId = window.requestAnimationFrame(animate)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    renderer.domElement.addEventListener('pointerup', handlePointerUp)
    animationId = window.requestAnimationFrame(animate)

    return () => {
      disposed = true
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerup', handlePointerUp)
      window.cancelAnimationFrame(animationId)
      renderer.dispose()
      renderer.domElement.remove()
      disposables.forEach((item) => item?.dispose?.())
    }
  }, [billboards, guardianSquad, nodes, routeNodes])

  return <div className="static-city-engine" ref={mountRef} aria-hidden="true" />
}

function createPenthouseInterior() {
  const group = new THREE.Group()
  const disposables = []
  const pathLights = []
  group.position.copy(mapPercentToWorld({ x: 56, y: 10.2 }))
  group.visible = false

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#0b0708',
    metalness: 0.88,
    roughness: 0.16,
    emissive: '#170b12',
    emissiveIntensity: 0.64,
  })
  const floor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.08, 3.55), floorMaterial)
  floor.position.y = 0.02
  group.add(floor)

  const rugMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.1), rugMaterial)
  rug.rotation.x = -Math.PI / 2
  rug.position.set(-0.92, 0.07, 0.32)
  group.add(rug)

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#070407',
    metalness: 0.62,
    roughness: 0.22,
    emissive: '#180d1d',
    emissiveIntensity: 0.5,
  })
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.3, 2.35, 0.08), wallMaterial)
  backWall.position.set(0, 1.2, 1.82)
  group.add(backWall)

  const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 3.6), wallMaterial.clone())
  sideWall.position.set(-2.64, 1.08, 0)
  group.add(sideWall)

  const skylineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  })
  const skylineScreen = new THREE.Mesh(new THREE.PlaneGeometry(4.45, 1.78), skylineMaterial)
  skylineScreen.position.set(0.26, 1.32, -1.82)
  group.add(skylineScreen)

  const glassMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.65, 1.95), glassMaterial)
  glass.position.set(0.26, 1.32, -1.8)
  group.add(glass)

  const elevatorMaterial = new THREE.MeshStandardMaterial({
    color: '#100a0f',
    metalness: 0.86,
    roughness: 0.18,
    emissive: '#26153a',
    emissiveIntensity: 0.72,
  })
  const elevator = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.82, 0.12), elevatorMaterial)
  elevator.position.set(1.24, 0.96, 1.74)
  group.add(elevator)

  const doorMaterial = new THREE.MeshStandardMaterial({
    color: '#050306',
    metalness: 0.92,
    roughness: 0.14,
    emissive: '#1e1028',
    emissiveIntensity: 0.5,
  })
  const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(0.43, 1.78, 0.05), doorMaterial)
  leftDoor.position.set(1.02, 0.96, 1.62)
  group.add(leftDoor)

  const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(0.43, 1.78, 0.05), doorMaterial.clone())
  rightDoor.position.set(1.46, 0.96, 1.62)
  group.add(rightDoor)

  const portalMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const elevatorPortal = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.6), portalMaterial)
  elevatorPortal.position.set(1.24, 0.96, 1.59)
  group.add(elevatorPortal)

  const elevatorGlowMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const elevatorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.94), elevatorGlowMaterial)
  elevatorGlow.position.set(1.24, 0.98, 1.66)
  group.add(elevatorGlow)

  const bedMaterial = new THREE.MeshStandardMaterial({
    color: '#111016',
    metalness: 0.44,
    roughness: 0.34,
    emissive: '#1e1227',
    emissiveIntensity: 0.42,
  })
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.26, 0.86), bedMaterial)
  bed.position.set(-1.42, 0.2, 0.92)
  group.add(bed)

  const wardrobeMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
  })
  const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.18, 0.12), wardrobeMaterial)
  wardrobe.position.set(-1.92, 0.72, 1.68)
  group.add(wardrobe)

  const statusPanelTexture = createLabelTexture('MR. STONE', 'fit / keys / tower', '#d8ad68')
  const statusPanelMaterial = new THREE.MeshBasicMaterial({
    map: statusPanelTexture,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const statusPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.46), statusPanelMaterial)
  statusPanel.position.set(-0.86, 1.52, 1.73)
  group.add(statusPanel)

  const pathMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  ;[
    [-0.9, 0.14, 0.44],
    [-0.32, 0.14, 0.62],
    [0.28, 0.14, 0.82],
    [0.82, 0.14, 1.08],
  ].forEach(([x, y, z], index) => {
    const light = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), pathMaterial.clone())
    light.rotation.x = -Math.PI / 2
    light.position.set(x, y, z)
    light.userData.phase = index * 0.52
    group.add(light)
    pathLights.push(light)
    disposables.push(light.geometry, light.material)
  })

  disposables.push(
    floor.geometry,
    floorMaterial,
    rug.geometry,
    rugMaterial,
    backWall.geometry,
    wallMaterial,
    sideWall.geometry,
    sideWall.material,
    skylineScreen.geometry,
    skylineMaterial,
    glass.geometry,
    glassMaterial,
    elevator.geometry,
    elevatorMaterial,
    leftDoor.geometry,
    doorMaterial,
    rightDoor.geometry,
    rightDoor.material,
    elevatorPortal.geometry,
    portalMaterial,
    elevatorGlow.geometry,
    elevatorGlowMaterial,
    bed.geometry,
    bedMaterial,
    wardrobe.geometry,
    wardrobeMaterial,
    statusPanelTexture,
    statusPanel.geometry,
    statusPanelMaterial,
    pathMaterial,
  )

  return { group, skylineScreen, elevatorGlow, leftDoor, rightDoor, elevatorPortal, pathLights, disposables }
}

function createCinematicSkyline() {
  const group = new THREE.Group()
  const disposables = []
  const towerGeometry = new THREE.BoxGeometry(1, 1, 1)
  const stripGeometry = new THREE.BoxGeometry(0.035, 1, 0.035)
  const crownGeometry = new THREE.BoxGeometry(1.05, 0.05, 1.05)
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: '#070408',
    metalness: 0.82,
    roughness: 0.2,
    emissive: '#170b20',
    emissiveIntensity: 0.72,
  })
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: '#0c0811',
    metalness: 0.9,
    roughness: 0.12,
    emissive: '#2b1642',
    emissiveIntensity: 0.54,
  })
  const goldStripMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
  })
  const violetStripMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
  })

  for (let index = 0; index < 34; index += 1) {
    const side = index % 2 === 0 ? -1 : 1
    const lane = Math.floor(index / 2)
    const height = 1.8 + (index % 7) * 0.55 + (lane % 4) * 0.2
    const width = 0.52 + (index % 5) * 0.11
    const depth = 0.42 + (index % 4) * 0.13
    const x = side * (6.2 + (index % 6) * 0.78)
    const z = -8.8 + (lane % 13) * 0.72
    const tower = new THREE.Mesh(towerGeometry, index % 5 === 0 ? glassMaterial : towerMaterial)
    tower.position.set(x, height / 2, z)
    tower.scale.set(width, height, depth)
    group.add(tower)

    const stripA = new THREE.Mesh(stripGeometry, index % 3 === 0 ? violetStripMaterial : goldStripMaterial)
    stripA.position.set(x - (width * 0.5 + 0.01), height * 0.55, z + depth * 0.5 + 0.02)
    stripA.scale.set(1, height * 0.74, 1)
    group.add(stripA)

    const stripB = new THREE.Mesh(stripGeometry, index % 4 === 0 ? goldStripMaterial : violetStripMaterial)
    stripB.position.set(x + (width * 0.5 + 0.01), height * 0.5, z + depth * 0.5 + 0.02)
    stripB.scale.set(1, height * 0.58, 1)
    group.add(stripB)

    if (index % 4 === 0) {
      const crown = new THREE.Mesh(crownGeometry, index % 8 === 0 ? goldStripMaterial : violetStripMaterial)
      crown.position.set(x, height + 0.05, z)
      crown.scale.set(width * 1.18, 1, depth * 1.18)
      group.add(crown)
    }
  }

  disposables.push(towerGeometry, stripGeometry, crownGeometry, towerMaterial, glassMaterial, goldStripMaterial, violetStripMaterial)
  return { group, disposables }
}

function createDistrictBillboard(billboard) {
  const color = billboard.tone || '#d8ad68'
  const group = new THREE.Group()
  const disposables = []
  const position = mapPercentToWorld(billboard)
  group.position.set(position.x, billboard.elevation || 2.4, position.z)
  group.rotation.y = billboard.rotation || 0

  const frameMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.54,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const frame = new THREE.Mesh(new THREE.PlaneGeometry((billboard.width || 3.6) + 0.16, (billboard.height || 2) + 0.16), frameMaterial)
  frame.position.z = -0.02
  group.add(frame)

  const screenMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.64,
    depthWrite: false,
  })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(billboard.width || 3.6, billboard.height || 2), screenMaterial)
  group.add(screen)

  const haloMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const halo = new THREE.Mesh(new THREE.PlaneGeometry((billboard.width || 3.6) + 0.6, (billboard.height || 2) + 0.55), haloMaterial)
  halo.position.z = -0.04
  group.add(halo)

  const labelTexture = createLabelTexture(billboard.title, 'district visual target', color)
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.48), labelMaterial)
  label.position.set(0, -(billboard.height || 2) * 0.62, 0.06)
  group.add(label)

  disposables.push(
    frame.geometry,
    frameMaterial,
    screen.geometry,
    screenMaterial,
    halo.geometry,
    haloMaterial,
    labelTexture,
    label.geometry,
    labelMaterial,
  )

  return { billboard, group, screen, frame, halo, label, baseY: group.position.y, disposables }
}

function createCityNode(node) {
  const color = nodeColors[node.type] || '#d8ad68'
  const position = mapPercentToWorld(node)
  const group = new THREE.Group()
  const disposables = []
  const clickTargets = []
  group.position.copy(position)

  const height = node.type === 'landmark' ? 2.4 : node.type === 'property' ? 1.65 : node.type === 'event' ? 1.35 : 1.05
  const towerGeometry = node.type === 'landmark'
    ? new THREE.CylinderGeometry(0.32, 0.5, height, 6)
    : new THREE.BoxGeometry(0.5, height, 0.5)
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: '#090509',
    metalness: 0.74,
    roughness: 0.2,
    emissive: color,
    emissiveIntensity: node.type === 'landmark' ? 0.78 : 0.48,
  })
  const tower = new THREE.Mesh(towerGeometry, towerMaterial)
  tower.position.y = height / 2
  tower.userData.nodeId = node.id
  group.add(tower)
  clickTargets.push(tower)

  const ringMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.012, 8, 68), ringMaterial)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.04
  ring.userData.nodeId = node.id
  group.add(ring)
  clickTargets.push(ring)

  const beaconMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.1, 2.4, 14, 1, true), beaconMaterial)
  beacon.position.y = height + 0.9
  beacon.userData.nodeId = node.id
  group.add(beacon)
  clickTargets.push(beacon)

  const labelTexture = createLabelTexture(node.label, node.status, color)
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.62), labelMaterial)
  label.position.y = height + 0.58
  label.userData.nodeId = node.id
  group.add(label)
  clickTargets.push(label)

  disposables.push(towerGeometry, towerMaterial, ring.geometry, ringMaterial, beacon.geometry, beaconMaterial, labelTexture, label.geometry, labelMaterial)
  return { group, ring, beacon, label, clickTargets, disposables }
}

function createMarketWalkSet() {
  const group = new THREE.Group()
  const disposables = []
  const lights = []
  const position = mapPercentToWorld({ x: 43, y: 66 })
  group.position.set(position.x, 0.04, position.z)
  group.rotation.y = -0.38
  group.visible = false

  const floorMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.7), floorMaterial)
  floor.rotation.x = -Math.PI / 2
  group.add(floor)

  const boutiqueGlowMaterial = new THREE.MeshBasicMaterial({
    color: '#ffb45e',
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const boutiqueGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.55), boutiqueGlowMaterial)
  boutiqueGlow.position.set(0, 0.88, -0.82)
  group.add(boutiqueGlow)

  const wardrobeTexture = createLabelTexture('WARDROBE', 'fit preview', '#fff0ca')
  const wardrobeMaterial = new THREE.MeshBasicMaterial({
    map: wardrobeTexture,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const wardrobeWall = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.54), wardrobeMaterial)
  wardrobeWall.position.set(-0.82, 1.04, -0.78)
  group.add(wardrobeWall)

  const jewelryTexture = createLabelTexture('JEWELRY', 'chain / watch', '#d8ad68')
  const jewelryMaterial = new THREE.MeshBasicMaterial({
    map: jewelryTexture,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const jewelryCase = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.46), jewelryMaterial)
  jewelryCase.position.set(0.7, 0.7, -0.76)
  group.add(jewelryCase)

  const mirrorTexture = createLabelTexture('STATUS', 'vip route clear', '#9d63ff')
  const mirrorMaterial = new THREE.MeshBasicMaterial({
    map: mirrorTexture,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const statusMirror = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.52), mirrorMaterial)
  statusMirror.position.set(0, 1.38, -0.79)
  group.add(statusMirror)

  const lightMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  ;[-1.12, -0.38, 0.38, 1.12].forEach((x, index) => {
    const light = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), lightMaterial.clone())
    light.position.set(x, 1.72, -0.7)
    light.userData.phase = index * 0.44
    group.add(light)
    lights.push(light)
    disposables.push(light.geometry, light.material)
  })

  disposables.push(
    floor.geometry,
    floorMaterial,
    boutiqueGlow.geometry,
    boutiqueGlowMaterial,
    wardrobeTexture,
    wardrobeWall.geometry,
    wardrobeMaterial,
    jewelryTexture,
    jewelryCase.geometry,
    jewelryMaterial,
    mirrorTexture,
    statusMirror.geometry,
    mirrorMaterial,
    lightMaterial,
  )

  return { group, floor, boutiqueGlow, wardrobeWall, jewelryCase, statusMirror, lights, disposables }
}

function createRadioRooftopSet() {
  const group = new THREE.Group()
  const disposables = []
  const lights = []
  const position = mapPercentToWorld({ x: 58, y: 61 })
  group.position.set(position.x, 0.05, position.z)
  group.rotation.y = 0.42
  group.visible = false

  const floorMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const rooftopFloor = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.05), floorMaterial)
  rooftopFloor.rotation.x = -Math.PI / 2
  group.add(rooftopFloor)

  const signTexture = createLabelTexture('STATIC RADIO', 'private rooftop', '#d8ad68')
  const signMaterial = new THREE.MeshBasicMaterial({
    map: signTexture,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const entranceSign = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.56), signMaterial)
  entranceSign.position.set(-0.92, 1.1, -0.9)
  group.add(entranceSign)

  const elevatorMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const elevatorGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.2), elevatorMaterial)
  elevatorGlow.position.set(-1.34, 0.86, -0.82)
  group.add(elevatorGlow)

  const djTexture = createLabelTexture('ON AIR', 'static blues', '#9d63ff')
  const djMaterial = new THREE.MeshBasicMaterial({
    map: djTexture,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const djBooth = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.54), djMaterial)
  djBooth.position.set(0.76, 0.72, -0.78)
  group.add(djBooth)

  const couchMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const vipCouch = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.24, 0.42), couchMaterial)
  vipCouch.position.set(0.12, 0.24, 0.54)
  group.add(vipCouch)

  const bottleMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
  })
  const bottleService = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.46, 16), bottleMaterial)
  bottleService.position.set(0.72, 0.34, 0.45)
  group.add(bottleService)

  const lightMaterial = new THREE.MeshBasicMaterial({
    color: '#e56cff',
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  ;[
    [-1.15, 1.52, -0.55],
    [-0.38, 1.68, -0.72],
    [0.38, 1.64, -0.72],
    [1.14, 1.52, -0.55],
    [-0.68, 0.34, 0.82],
    [0.92, 0.34, 0.72],
  ].forEach(([x, y, z], index) => {
    const light = new THREE.Mesh(new THREE.CircleGeometry(index > 3 ? 0.09 : 0.13, 24), lightMaterial.clone())
    light.position.set(x, y, z)
    light.userData.phase = index * 0.36
    group.add(light)
    lights.push(light)
    disposables.push(light.geometry, light.material)
  })

  disposables.push(
    rooftopFloor.geometry,
    floorMaterial,
    signTexture,
    entranceSign.geometry,
    signMaterial,
    elevatorGlow.geometry,
    elevatorMaterial,
    djTexture,
    djBooth.geometry,
    djMaterial,
    vipCouch.geometry,
    couchMaterial,
    bottleService.geometry,
    bottleMaterial,
    lightMaterial,
  )

  return { group, rooftopFloor, entranceSign, elevatorGlow, djBooth, vipCouch, bottleService, lights, disposables }
}

function createVibeModeSet() {
  const group = new THREE.Group()
  const disposables = []
  const windLines = []
  const lightStreaks = []
  const billboards = []
  const position = mapPercentToWorld({ x: 36, y: 80 })
  group.position.set(position.x, 0.06, position.z)
  group.rotation.y = -0.82
  group.visible = false

  const roadMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const road = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 2.35), roadMaterial)
  road.rotation.x = -Math.PI / 2
  group.add(road)

  const frameMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const windowFrame = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.012, 8, 92), frameMaterial)
  windowFrame.scale.set(1.36, 0.58, 1)
  windowFrame.rotation.x = Math.PI / 2
  windowFrame.position.set(-0.62, 0.88, 0.42)
  group.add(windowFrame)

  const radioTexture = createLabelTexture('STATIC BLUES', 'vibe mode / placeholder', '#d8ad68')
  const radioMaterial = new THREE.MeshBasicMaterial({
    map: radioTexture,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const radioPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.5), radioMaterial)
  radioPanel.position.set(0.82, 0.62, -0.78)
  group.add(radioPanel)

  const windMaterial = new THREE.MeshBasicMaterial({
    color: '#fff8ef',
    transparent: true,
    opacity: 0.03,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  for (let index = 0; index < 12; index += 1) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.72 + (index % 4) * 0.18, 0.018), windMaterial.clone())
    line.position.set(-2.5 + (index % 6) * 0.8, 0.55 + (index % 3) * 0.23, -0.45 + Math.floor(index / 6) * 0.52)
    line.rotation.z = -0.14
    line.userData.originX = line.position.x
    group.add(line)
    windLines.push(line)
    disposables.push(line.geometry, line.material)
  }

  const streakMaterial = new THREE.MeshBasicMaterial({
    color: '#e56cff',
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  for (let index = 0; index < 14; index += 1) {
    const streak = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.2 + (index % 5) * 0.28), streakMaterial.clone())
    streak.position.set(-2.8 + (index % 7) * 0.9, 0.82 + (index % 4) * 0.18, -1.4 + Math.floor(index / 7) * 1.5)
    streak.rotation.z = index % 2 === 0 ? 0.08 : -0.08
    streak.userData.originZ = streak.position.z
    group.add(streak)
    lightStreaks.push(streak)
    disposables.push(streak.geometry, streak.material)
  }

  const boardMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  ;[
    ['SIGNALS', -2.1, 1.62, -0.92, '#e56cff'],
    ['PLAY', -0.62, 1.86, -1.1, '#9d63ff'],
    ['RADIO', 1.05, 1.72, -0.96, '#d8ad68'],
    ['OWN IT', 2.52, 1.48, -0.8, '#fff0ca'],
  ].forEach(([label, x, y, z, color], index) => {
    const texture = createLabelTexture(label, 'strip live', color)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.42), material)
    board.position.set(x, y, z)
    board.userData.baseY = y
    group.add(board)
    billboards.push(board)
    disposables.push(texture, board.geometry, material)
    if (index === 0) disposables.push(boardMaterial)
  })

  disposables.push(road.geometry, roadMaterial, windowFrame.geometry, frameMaterial, radioTexture, radioPanel.geometry, radioMaterial, windMaterial, streakMaterial)
  return { group, road, windowFrame, radioPanel, windLines, lightStreaks, billboards, disposables }
}

function createTowerReturnSet() {
  const group = new THREE.Group()
  const disposables = []
  const position = mapPercentToWorld({ x: 57, y: 34 })
  group.position.set(position.x, 0.05, position.z)
  group.rotation.y = -0.48
  group.visible = false

  const roadMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const road = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.25), roadMaterial)
  road.rotation.x = -Math.PI / 2
  group.add(road)

  const towerMaterial = new THREE.MeshStandardMaterial({
    color: '#070407',
    metalness: 0.88,
    roughness: 0.16,
    emissive: '#d8ad68',
    emissiveIntensity: 0.58,
  })
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.52, 3.25, 7), towerMaterial)
  tower.position.set(1.65, 1.64, -0.58)
  group.add(tower)

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const valetRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.014, 8, 80), ringMaterial)
  valetRing.rotation.x = Math.PI / 2
  valetRing.position.set(0.4, 0.08, 0.28)
  group.add(valetRing)

  const tipMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const tipFlash = new THREE.Mesh(new THREE.CircleGeometry(0.22, 28), tipMaterial)
  tipFlash.position.set(0.16, 0.58, 0.24)
  group.add(tipFlash)

  const completionTexture = createLabelTexture('ROUTE COMPLETE', 'tower return', '#fff0ca')
  const completionMaterial = new THREE.MeshBasicMaterial({
    map: completionTexture,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const completionGate = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.54), completionMaterial)
  completionGate.position.set(1.65, 2.95, -0.48)
  group.add(completionGate)

  disposables.push(
    road.geometry,
    roadMaterial,
    tower.geometry,
    towerMaterial,
    valetRing.geometry,
    ringMaterial,
    tipFlash.geometry,
    tipMaterial,
    completionTexture,
    completionGate.geometry,
    completionMaterial,
  )

  return { group, road, tower, valetRing, tipFlash, completionGate, disposables }
}

function createMrStoneMarker() {
  const group = new THREE.Group()
  const disposables = []
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: '#fff4cf',
    emissive: '#d8ad68',
    emissiveIntensity: 0.48,
    metalness: 0.62,
    roughness: 0.22,
  })
  const suitMaterial = new THREE.MeshStandardMaterial({
    color: '#060407',
    metalness: 0.84,
    roughness: 0.18,
    emissive: '#1f1029',
    emissiveIntensity: 0.48,
  })
  const goldMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
  })
  const torsoGeometry = new THREE.CylinderGeometry(0.18, 0.24, 0.72, 18)
  const limbGeometry = new THREE.CylinderGeometry(0.045, 0.055, 0.46, 12)
  const headGeometry = new THREE.SphereGeometry(0.16, 24, 16)
  const shoulderGeometry = new THREE.BoxGeometry(0.56, 0.12, 0.18)
  const coatGeometry = new THREE.ConeGeometry(0.34, 0.72, 5)

  const torso = new THREE.Mesh(torsoGeometry, suitMaterial)
  torso.position.y = 0.72
  group.add(torso)

  const shoulders = new THREE.Mesh(shoulderGeometry, suitMaterial)
  shoulders.position.y = 1.04
  group.add(shoulders)

  const head = new THREE.Mesh(headGeometry, skinMaterial)
  head.position.y = 1.28
  group.add(head)

  const coat = new THREE.Mesh(coatGeometry, suitMaterial.clone())
  coat.position.y = 0.56
  coat.rotation.y = Math.PI / 5
  group.add(coat)

  const leftArm = new THREE.Mesh(limbGeometry, suitMaterial)
  leftArm.position.set(-0.34, 0.78, 0)
  leftArm.rotation.z = 0.16
  group.add(leftArm)

  const rightArm = new THREE.Mesh(limbGeometry, suitMaterial)
  rightArm.position.set(0.34, 0.78, 0)
  rightArm.rotation.z = -0.16
  group.add(rightArm)

  const leftLeg = new THREE.Mesh(limbGeometry, suitMaterial)
  leftLeg.position.set(-0.1, 0.25, 0)
  group.add(leftLeg)

  const rightLeg = new THREE.Mesh(limbGeometry, suitMaterial)
  rightLeg.position.set(0.1, 0.25, 0)
  group.add(rightLeg)

  const chain = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 8, 36), goldMaterial)
  chain.position.set(0, 1.02, 0.08)
  chain.rotation.x = Math.PI / 2.6
  group.add(chain)

  const auraMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const aura = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.012, 8, 74), auraMaterial)
  aura.rotation.x = Math.PI / 2
  aura.position.y = 0.05
  group.add(aura)

  const fitTrimMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  })
  const fitTrim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.01, 8, 44), fitTrimMaterial)
  fitTrim.position.set(0, 0.92, 0.02)
  fitTrim.rotation.x = Math.PI / 2
  fitTrim.visible = false
  group.add(fitTrim)

  const watchMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
  })
  const watch = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 8, 28), watchMaterial)
  watch.position.set(0.36, 0.66, 0.02)
  watch.rotation.x = Math.PI / 2
  watch.visible = false
  group.add(watch)

  const statusPassMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const statusPass = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.24), statusPassMaterial)
  statusPass.position.set(0.13, 0.92, 0.22)
  statusPass.visible = false
  group.add(statusPass)

  const drinkMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
  })
  const drink = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 12), drinkMaterial)
  drink.position.set(-0.39, 0.58, 0.08)
  drink.visible = false
  group.add(drink)

  const cigarMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
  })
  const cigar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 10), cigarMaterial)
  cigar.position.set(0.4, 0.6, 0.08)
  cigar.rotation.z = Math.PI / 2
  cigar.visible = false
  group.add(cigar)

  group.userData.parts = { torso, leftArm, rightArm, leftLeg, rightLeg, fitTrim, watch, statusPass, drink, cigar }
  disposables.push(
    torsoGeometry,
    limbGeometry,
    headGeometry,
    shoulderGeometry,
    coatGeometry,
    skinMaterial,
    suitMaterial,
    coat.material,
    goldMaterial,
    chain.geometry,
    aura.geometry,
    auraMaterial,
    fitTrim.geometry,
    fitTrimMaterial,
    watch.geometry,
    watchMaterial,
    statusPass.geometry,
    statusPassMaterial,
    drink.geometry,
    drinkMaterial,
    cigar.geometry,
    cigarMaterial,
  )
  group.userData.disposables = disposables
  return group
}

function createGuardianSquad(squad = []) {
  const group = new THREE.Group()
  const members = []
  const disposables = []

  squad.forEach((config, index) => {
    const companion = createGuardianCompanion(config, index)
    group.add(companion.group)
    members.push(companion)
    disposables.push(...companion.disposables)
  })

  return { group, members, disposables }
}

function createGuardianCompanion(config, index) {
  const group = new THREE.Group()
  const disposables = []
  const parts = {}
  const color = config.color || '#72ffba'
  const accent = config.accent || '#fff8ef'
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: '#060407',
    metalness: 0.78,
    roughness: 0.2,
    emissive: color,
    emissiveIntensity: 0.54,
  })
  const glowMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const accentMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  if (config.scaleClass === 'colossal') {
    const bodyGeometry = new THREE.SphereGeometry(0.32, 24, 16)
    const headGeometry = new THREE.SphereGeometry(0.18, 18, 14)
    const wingGeometry = new THREE.ConeGeometry(0.34, 0.82, 3)
    const tailGeometry = new THREE.CylinderGeometry(0.035, 0.07, 0.92, 10)

    const body = new THREE.Mesh(bodyGeometry, baseMaterial)
    body.scale.set(1.42, 0.56, 0.72)
    body.position.y = 0.8
    group.add(body)

    const head = new THREE.Mesh(headGeometry, baseMaterial.clone())
    head.position.set(0, 0.92, -0.42)
    group.add(head)
    disposables.push(head.material)

    const wingLeft = new THREE.Mesh(wingGeometry, glowMaterial.clone())
    wingLeft.position.set(-0.38, 0.88, 0.02)
    wingLeft.rotation.set(Math.PI / 2, 0.18, 0.52)
    group.add(wingLeft)
    parts.wingLeft = wingLeft

    const wingRight = new THREE.Mesh(wingGeometry, glowMaterial.clone())
    wingRight.position.set(0.38, 0.88, 0.02)
    wingRight.rotation.set(Math.PI / 2, -0.18, -0.52)
    group.add(wingRight)
    parts.wingRight = wingRight

    const tail = new THREE.Mesh(tailGeometry, accentMaterial.clone())
    tail.position.set(0, 0.66, 0.58)
    tail.rotation.x = Math.PI / 2.6
    group.add(tail)

    disposables.push(
      bodyGeometry,
      headGeometry,
      wingGeometry,
      tailGeometry,
      wingLeft.material,
      wingRight.material,
      tail.material,
    )
  } else if (config.type?.includes('robot')) {
    const torsoGeometry = new THREE.BoxGeometry(0.32, 0.62, 0.22)
    const headGeometry = new THREE.BoxGeometry(0.24, 0.2, 0.2)
    const limbGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.42, 10)
    const coreGeometry = new THREE.SphereGeometry(0.075, 16, 12)

    const torso = new THREE.Mesh(torsoGeometry, baseMaterial)
    torso.position.y = 0.66
    group.add(torso)

    const head = new THREE.Mesh(headGeometry, baseMaterial.clone())
    head.position.y = 1.08
    group.add(head)
    disposables.push(head.material)

    ;[
      [-0.24, 0.66, 0, 0.12],
      [0.24, 0.66, 0, -0.12],
      [-0.1, 0.22, 0, 0],
      [0.1, 0.22, 0, 0],
    ].forEach(([x, y, z, rot]) => {
      const limb = new THREE.Mesh(limbGeometry, baseMaterial.clone())
      limb.position.set(x, y, z)
      limb.rotation.z = rot
      group.add(limb)
      disposables.push(limb.material)
    })

    const core = new THREE.Mesh(coreGeometry, glowMaterial.clone())
    core.position.set(0, 0.72, -0.13)
    group.add(core)
    parts.staffGlow = core

    disposables.push(torsoGeometry, headGeometry, limbGeometry, coreGeometry, core.material)
  } else {
    const robeGeometry = new THREE.ConeGeometry(0.18, 0.48, 18)
    const headGeometry = new THREE.SphereGeometry(0.105, 18, 14)
    const hatGeometry = new THREE.ConeGeometry(0.14, 0.28, 18)
    const staffGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.52, 8)
    const orbGeometry = new THREE.SphereGeometry(0.045, 14, 10)

    const robe = new THREE.Mesh(robeGeometry, baseMaterial)
    robe.position.y = 0.38
    group.add(robe)

    const head = new THREE.Mesh(headGeometry, accentMaterial.clone())
    head.position.y = 0.72
    group.add(head)

    const hat = new THREE.Mesh(hatGeometry, glowMaterial.clone())
    hat.position.y = 0.92
    group.add(hat)

    const staff = new THREE.Mesh(staffGeometry, accentMaterial.clone())
    staff.position.set(0.2, 0.52, 0)
    staff.rotation.z = -0.18
    group.add(staff)

    const orb = new THREE.Mesh(orbGeometry, glowMaterial.clone())
    orb.position.set(0.24, 0.8, 0)
    group.add(orb)
    parts.staffGlow = orb

    disposables.push(
      robeGeometry,
      headGeometry,
      hatGeometry,
      staffGeometry,
      orbGeometry,
      head.material,
      hat.material,
      staff.material,
      orb.material,
    )
  }

  const aura = new THREE.Mesh(new THREE.TorusGeometry(config.scaleClass === 'colossal' ? 0.72 : config.scaleClass === 'large' ? 0.42 : 0.26, 0.01, 8, 64), glowMaterial.clone())
  aura.rotation.x = Math.PI / 2
  aura.position.y = 0.04
  group.add(aura)

  const labelTexture = createLabelTexture(config.name || `Guardian ${index + 1}`, config.slot || 'companion', color)
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const label = new THREE.Mesh(new THREE.PlaneGeometry(config.scaleClass === 'colossal' ? 1.75 : 1.35, 0.44), labelMaterial)
  label.position.y = config.scaleClass === 'colossal' ? 1.45 : config.scaleClass === 'large' ? 1.35 : 1.12
  group.add(label)

  group.scale.setScalar(config.scaleClass === 'colossal' ? 1.2 : config.scaleClass === 'large' ? 1.04 : 0.78)
  disposables.push(baseMaterial, glowMaterial, accentMaterial, aura.geometry, aura.material, labelTexture, label.geometry, labelMaterial)

  return { config, group, aura, label, parts, disposables }
}

function createVehicleShell() {
  const group = new THREE.Group()
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#050306',
    metalness: 0.86,
    roughness: 0.18,
    emissive: '#2a163a',
    emissiveIntensity: 0.46,
  })
  const cabinMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
  })
  const trimMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
  })
  const doorMaterial = new THREE.MeshBasicMaterial({
    color: '#fff0ca',
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  })
  const radioMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const underGlowMaterial = new THREE.MeshBasicMaterial({
    color: '#9d63ff',
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: '#fff8ef',
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const windowFrameMaterial = new THREE.MeshBasicMaterial({
    color: '#d8ad68',
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const radioHudTexture = createLabelTexture('STATIC BLUES', 'vibe mode', '#d8ad68')
  const radioHudMaterial = new THREE.MeshBasicMaterial({
    map: radioHudTexture,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 1.55), bodyMaterial)
  base.position.y = 0.22
  group.add(base)

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.28, 0.76), cabinMaterial)
  cabin.position.y = 0.48
  cabin.position.z = -0.08
  group.add(cabin)

  const leftDoorPivot = new THREE.Group()
  leftDoorPivot.position.set(-0.47, 0.36, -0.38)
  const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.62), doorMaterial)
  leftDoor.position.z = 0.31
  leftDoorPivot.add(leftDoor)
  group.add(leftDoorPivot)

  const radioGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.18), radioMaterial)
  radioGlow.position.set(0, 0.56, -0.52)
  radioGlow.rotation.x = -0.18
  group.add(radioGlow)

  const radioHud = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.22), radioHudMaterial)
  radioHud.position.set(0, 0.63, -0.58)
  radioHud.rotation.x = -0.2
  radioHud.visible = false
  group.add(radioHud)

  const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.24), windowMaterial)
  windowGlass.position.set(-0.5, 0.42, -0.06)
  windowGlass.rotation.y = Math.PI / 2
  group.add(windowGlass)

  const windowFrame = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.009, 8, 52), windowFrameMaterial)
  windowFrame.position.set(-0.51, 0.43, -0.06)
  windowFrame.rotation.y = Math.PI / 2
  windowFrame.scale.set(1, 0.54, 1)
  group.add(windowFrame)

  const underGlow = new THREE.Mesh(new THREE.CircleGeometry(0.72, 40), underGlowMaterial)
  underGlow.rotation.x = -Math.PI / 2
  underGlow.position.y = 0.025
  group.add(underGlow)

  const wheels = []
  ;[-0.36, 0.36].forEach((x) => {
    ;[-0.48, 0.48].forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 16), trimMaterial.clone())
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, 0.06, z)
      group.add(wheel)
      wheels.push(wheel)
      group.userData.disposables = [...(group.userData.disposables || []), wheel.geometry, wheel.material]
    })
  })

  group.visible = false
  group.userData.parts = { cabin, leftDoorPivot, radioGlow, radioHud, windowGlass, windowFrame, underGlow, wheels }
  group.userData.disposables = [
    ...(group.userData.disposables || []),
    base.geometry,
    bodyMaterial,
    cabin.geometry,
    cabinMaterial,
    trimMaterial,
    leftDoor.geometry,
    doorMaterial,
    radioGlow.geometry,
    radioMaterial,
    radioHudTexture,
    radioHud.geometry,
    radioHudMaterial,
    windowGlass.geometry,
    windowMaterial,
    windowFrame.geometry,
    windowFrameMaterial,
    underGlow.geometry,
    underGlowMaterial,
  ]
  return group
}

async function loadStaticCityModelSlot(slotConfig, loader, modelSlot, disposables, isDisposed) {
  try {
    const buffer = await fetchGlbBuffer(slotConfig.targetPath)
    if (!buffer || isDisposed()) return

    const gltf = await parseGltfBuffer(loader, buffer, slotConfig.targetPath)
    const model = gltf.scene || gltf.scenes?.[0]
    if (!model) return

    normalizeModelForSlot(model, slotConfig)
    const modelDisposables = []
    collectObjectResources(model, modelDisposables)

    if (isDisposed()) {
      modelDisposables.forEach((item) => item?.dispose?.())
      return
    }

    modelSlot.root.add(model)
    modelSlot.loaded = true
    disposables.push(...modelDisposables)
  } catch {
    modelSlot.loaded = false
  }
}

async function fetchGlbBuffer(path) {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) return null

  const contentType = response.headers.get('content-type') || ''
  const buffer = await response.arrayBuffer()
  if (buffer.byteLength < 4) return null

  const signature = new TextDecoder().decode(new Uint8Array(buffer, 0, 4))
  const looksLikeGlb = signature === 'glTF'
  const looksLikeGltf = contentType.includes('model/gltf') || contentType.includes('application/octet-stream')
  if (!looksLikeGlb && !looksLikeGltf) return null

  return buffer
}

function parseGltfBuffer(loader, buffer, path) {
  const resourcePath = path.slice(0, path.lastIndexOf('/') + 1)
  return new Promise((resolve, reject) => {
    loader.parse(buffer, resourcePath, resolve, reject)
  })
}

function normalizeModelForSlot(model, slotConfig) {
  model.traverse((child) => {
    if (!child.isMesh) return
    child.frustumCulled = true
    child.castShadow = false
    child.receiveShadow = false
  })

  const box = new THREE.Box3().setFromObject(model)
  if (box.isEmpty()) return

  const size = new THREE.Vector3()
  box.getSize(size)
  const heightScale = slotConfig.targetHeight ? slotConfig.targetHeight / Math.max(size.y, 0.001) : 1
  const radiusScale = slotConfig.targetRadius
    ? slotConfig.targetRadius / Math.max(size.x, size.z, 0.001)
    : heightScale
  const scale = Math.min(heightScale, radiusScale)
  model.scale.multiplyScalar(scale)

  const normalizedBox = new THREE.Box3().setFromObject(model)
  const center = new THREE.Vector3()
  normalizedBox.getCenter(center)
  model.position.x -= center.x
  model.position.z -= center.z
  model.position.y -= normalizedBox.min.y
}

function collectObjectResources(object, resources) {
  object.traverse((child) => {
    if (child.geometry) resources.push(child.geometry)
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => collectMaterialResources(material, resources))
    } else if (child.material) {
      collectMaterialResources(child.material, resources)
    }
  })
}

function collectMaterialResources(material, resources) {
  Object.values(material).forEach((value) => {
    if (value?.isTexture) resources.push(value)
  })
  resources.push(material)
}

function createLabelTexture(title, subtitle, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 192
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(3, 2, 4, 0.68)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = color
  context.lineWidth = 3
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)
  context.fillStyle = '#fff8ef'
  context.font = '900 34px Arial'
  context.textAlign = 'center'
  context.fillText(title.toUpperCase(), canvas.width / 2, 82)
  context.fillStyle = color
  context.font = '900 20px Arial'
  context.fillText(subtitle.toUpperCase(), canvas.width / 2, 124)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
