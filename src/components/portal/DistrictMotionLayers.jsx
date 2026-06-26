import { useEffect, useRef } from 'react'

const motionSlots = [
  ['video-billboard-left', 'Future video ad / creator drop slot'],
  ['video-billboard-right', 'Future live premiere trailer slot'],
  ['lottie-signage', 'Future lightweight vector signage slot'],
  ['rive-interactive-map', 'Future interactive venue map slot'],
]

export default function DistrictMotionLayers() {
  return (
    <>
      <DistrictCanvasLayer />
      <DistrictWebGLLayer />
      <div className="district-motion-slots" aria-hidden="true">
        {motionSlots.map(([id, label]) => (
          <span data-motion-slot={id} data-label={label} key={id} />
        ))}
      </div>
    </>
  )
}

function DistrictCanvasLayer() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return undefined

    let frame = 0
    let animationId = 0
    let width = 0
    let height = 0
    let ratio = 1

    const motes = Array.from({ length: 42 }, (_, index) => ({
      x: 0.12 + ((index * 37) % 76) / 100,
      y: 0.12 + ((index * 19) % 72) / 100,
      speed: 0.00014 + (index % 6) * 0.000035,
      size: 0.7 + (index % 5) * 0.28,
      phase: index * 0.53,
    }))

    const crowd = Array.from({ length: 70 }, (_, index) => ({
      x: 0.06 + ((index * 17) % 89) / 100,
      y: 0.58 + ((index * 23) % 31) / 100,
      phase: index * 0.41,
      size: 0.8 + (index % 4) * 0.35,
    }))

    const traffic = Array.from({ length: 9 }, (_, index) => ({
      x: -0.2 + index * 0.16,
      y: 0.61 + (index % 4) * 0.035,
      speed: 0.0016 + (index % 3) * 0.00045,
      length: 0.08 + (index % 4) * 0.028,
      hue: index % 2 ? '157, 99, 255' : '255, 240, 202',
    }))

    function resize() {
      const bounds = canvas.getBoundingClientRect()
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.floor(bounds.width))
      height = Math.max(1, Math.floor(bounds.height))
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function drawBillboards(time) {
      const panels = [
        [0.255, 0.13, 0.085, 0.17, 'LIVE'],
        [0.42, 0.15, 0.09, 0.13, 'DROP'],
        [0.73, 0.22, 0.14, 0.09, 'PLAY'],
      ]
      panels.forEach(([x, y, panelWidth, panelHeight, label], index) => {
        const pulse = 0.34 + Math.sin(time * 0.004 + index * 1.7) * 0.16
        const px = x * width
        const py = y * height
        const pw = panelWidth * width
        const ph = panelHeight * height
        const gradient = context.createLinearGradient(px, py, px + pw, py + ph)
        gradient.addColorStop(0, `rgba(255, 240, 202, ${0.1 + pulse * 0.16})`)
        gradient.addColorStop(0.48, `rgba(157, 99, 255, ${0.08 + pulse * 0.22})`)
        gradient.addColorStop(1, `rgba(229, 108, 255, ${0.04 + pulse * 0.18})`)
        context.fillStyle = gradient
        context.fillRect(px, py, pw, ph)
        context.strokeStyle = `rgba(255, 240, 202, ${0.12 + pulse * 0.24})`
        context.strokeRect(px, py, pw, ph)
        context.font = `900 ${Math.max(8, Math.min(15, width * 0.008))}px Orbitron, sans-serif`
        context.textAlign = 'center'
        context.fillStyle = `rgba(255, 248, 239, ${0.22 + pulse * 0.32})`
        context.fillText(label, px + pw / 2, py + ph * 0.58)
      })
    }

    function draw(time) {
      frame += 1
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'screen'
      drawBillboards(time)

      traffic.forEach((trail) => {
        trail.x += trail.speed
        if (trail.x > 1.18) trail.x = -0.24
        const x = trail.x * width
        const y = (trail.y + Math.sin(time * 0.0014 + trail.x * 10) * 0.008) * height
        const length = trail.length * width
        const gradient = context.createLinearGradient(x - length, y, x + length, y - height * 0.015)
        gradient.addColorStop(0, 'rgba(0,0,0,0)')
        gradient.addColorStop(0.5, `rgba(${trail.hue}, .5)`)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        context.strokeStyle = gradient
        context.lineWidth = 1.2 + (frame % 5) * 0.18
        context.beginPath()
        context.moveTo(x - length, y)
        context.lineTo(x + length, y - height * 0.018)
        context.stroke()
      })

      crowd.forEach((person, index) => {
        const shimmer = 0.22 + Math.sin(time * 0.002 + person.phase) * 0.17
        context.fillStyle = index % 3 === 0
          ? `rgba(216, 173, 104, ${shimmer})`
          : `rgba(157, 99, 255, ${shimmer * 0.9})`
        context.beginPath()
        context.arc(
          person.x * width + Math.sin(time * 0.0012 + person.phase) * 2.4,
          person.y * height + Math.cos(time * 0.0016 + person.phase) * 1.8,
          person.size,
          0,
          Math.PI * 2,
        )
        context.fill()
      })

      motes.forEach((mote, index) => {
        const x = ((mote.x + time * mote.speed) % 1) * width
        const y = (mote.y + Math.sin(time * 0.001 + mote.phase) * 0.012) * height
        const alpha = 0.08 + Math.sin(time * 0.0024 + mote.phase) * 0.05
        context.fillStyle = index % 2 ? `rgba(255, 240, 202, ${alpha})` : `rgba(157, 99, 255, ${alpha})`
        context.beginPath()
        context.arc(x, y, mote.size, 0, Math.PI * 2)
        context.fill()
      })

      context.globalCompositeOperation = 'source-over'
      animationId = window.requestAnimationFrame(draw)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    animationId = window.requestAnimationFrame(draw)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas className="district-canvas-layer" ref={canvasRef} aria-hidden="true" />
}

function DistrictWebGLLayer() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let disposed = false
    let cleanup = () => {}

    async function boot() {
      const THREE = await import('three')
      if (disposed || !mount) return

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
      camera.position.set(0, 0, 7)

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
      mount.appendChild(renderer.domElement)

      const geometry = new THREE.BufferGeometry()
      const positions = []
      const colors = []
      const colorA = new THREE.Color('#d8ad68')
      const colorB = new THREE.Color('#9d63ff')
      for (let index = 0; index < 110; index += 1) {
        const lane = index % 11
        const depth = Math.floor(index / 11)
        positions.push((lane - 5) * 0.48, -1.9 + depth * 0.28, -depth * 0.12)
        const color = index % 3 === 0 ? colorA : colorB
        colors.push(color.r, color.g, color.b)
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.045,
        transparent: true,
        opacity: 0.72,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const points = new THREE.Points(geometry, material)
      points.position.set(0.8, -0.2, 0)
      points.rotation.z = -0.08
      scene.add(points)

      const ringGeometry = new THREE.TorusGeometry(1.65, 0.006, 8, 96)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: '#d8ad68',
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.set(1.65, -1.15, -0.8)
      ring.scale.y = 0.16
      scene.add(ring)

      function resize() {
        const bounds = mount.getBoundingClientRect()
        const width = Math.max(1, Math.floor(bounds.width))
        const height = Math.max(1, Math.floor(bounds.height))
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }

      let animationId = 0
      function render(time = 0) {
        points.rotation.y = Math.sin(time * 0.00035) * 0.08
        points.position.y = -0.2 + Math.sin(time * 0.0007) * 0.05
        ring.rotation.z = time * 0.00022
        ringMaterial.opacity = 0.16 + Math.sin(time * 0.0011) * 0.06
        renderer.render(scene, camera)
        animationId = window.requestAnimationFrame(render)
      }

      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(mount)
      animationId = window.requestAnimationFrame(render)

      cleanup = () => {
        window.cancelAnimationFrame(animationId)
        observer.disconnect()
        geometry.dispose()
        material.dispose()
        ringGeometry.dispose()
        ringMaterial.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    boot()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return <div className="district-webgl-layer" ref={mountRef} aria-hidden="true" />
}
