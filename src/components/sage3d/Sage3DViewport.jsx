import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Sage3DPerformanceFallback from './Sage3DPerformanceFallback'
import { normalizeSageGesture } from './SageGestureSystem'

function mesh(geometry, material, position, scale) {
  const object = new THREE.Mesh(geometry, material)
  object.position.set(...position)
  if (scale) object.scale.set(...scale)
  return object
}

export default function Sage3DViewport({ gesture = 'idle', compact = false, className = '', onReady }) {
  const mountRef = useRef(null)
  const gestureRef = useRef(gesture)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    gestureRef.current = normalizeSageGesture(gesture)
  }, [gesture])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer
    let frame
    try {
      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x030709, 0.075)
      const camera = new THREE.PerspectiveCamera(compact ? 36 : 31, 1, 0.1, 100)
      camera.position.set(0, compact ? 1.7 : 2.1, compact ? 7.2 : 8.5)
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.4 : 1.8))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mount.appendChild(renderer.domElement)

      const holo = new THREE.MeshPhysicalMaterial({
        color: 0x7eefff,
        emissive: 0x143f56,
        emissiveIntensity: 1.6,
        transparent: true,
        opacity: 0.48,
        roughness: 0.2,
        metalness: 0.38,
        wireframe: true,
        side: THREE.DoubleSide,
      })
      const suit = new THREE.MeshPhysicalMaterial({
        color: 0x09141a,
        emissive: 0x0b3743,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.78,
        roughness: 0.24,
        metalness: 0.82,
      })
      const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x8ff4ff, transparent: true, opacity: 0.75 })
      const sage = new THREE.Group()
      sage.position.y = reduced ? 0 : -4.5

      const skirt = mesh(new THREE.CylinderGeometry(0.48, 0.74, 1.35, 10), suit, [0, 0.72, 0])
      const torso = mesh(new THREE.CapsuleGeometry(0.44, 0.92, 8, 18), suit, [0, 2.03, 0], [0.92, 1, 0.72])
      const collar = mesh(new THREE.TorusGeometry(0.28, 0.035, 8, 30), lightMaterial, [0, 2.55, 0], [1, 0.55, 1])
      const neck = mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.28, 16), holo, [0, 2.72, 0])
      const head = mesh(new THREE.SphereGeometry(0.38, 28, 28), holo, [0, 3.16, 0], [0.82, 1.08, 0.84])
      const hair = mesh(new THREE.SphereGeometry(0.43, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.72), suit, [0, 3.27, -0.02], [0.92, 1.16, 0.92])
      hair.rotation.x = -0.12
      const bun = mesh(new THREE.SphereGeometry(0.19, 18, 18), suit, [0.25, 3.53, -0.09], [1, 1.2, 1])
      const leftLeg = mesh(new THREE.CapsuleGeometry(0.13, 1.05, 6, 12), suit, [-0.24, -0.35, 0])
      const rightLeg = mesh(new THREE.CapsuleGeometry(0.13, 1.05, 6, 12), suit, [0.24, -0.35, 0])
      const leftArm = mesh(new THREE.CapsuleGeometry(0.11, 1.08, 6, 12), holo, [-0.62, 1.93, 0])
      const rightArm = mesh(new THREE.CapsuleGeometry(0.11, 1.08, 6, 12), holo, [0.62, 1.93, 0])
      leftArm.rotation.z = -0.14
      rightArm.rotation.z = 0.14
      sage.add(skirt, torso, collar, neck, head, hair, bun, leftLeg, rightLeg, leftArm, rightArm)
      scene.add(sage)

      const platform = new THREE.Group()
      const base = mesh(new THREE.CylinderGeometry(1.38, 1.62, 0.32, 48), new THREE.MeshPhysicalMaterial({ color: 0x071013, metalness: 0.95, roughness: 0.18 }), [0, -1.2, 0])
      platform.add(base)
      for (let index = 0; index < 4; index += 1) {
        const ring = mesh(new THREE.TorusGeometry(0.72 + index * 0.25, 0.025, 8, 72), lightMaterial.clone(), [0, -0.99 + index * 0.025, 0])
        ring.rotation.x = Math.PI / 2
        ring.material.opacity = 0.65 - index * 0.1
        platform.add(ring)
      }
      scene.add(platform)

      const particleCount = compact ? 260 : 520
      const positions = new Float32Array(particleCount * 3)
      for (let index = 0; index < particleCount; index += 1) {
        positions[index * 3] = (Math.random() - 0.5) * 4.8
        positions[index * 3 + 1] = Math.random() * 6 - 1
        positions[index * 3 + 2] = (Math.random() - 0.5) * 2.6
      }
      const particleGeometry = new THREE.BufferGeometry()
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x78e8ff, size: 0.022, transparent: true, opacity: 0.6 }))
      scene.add(particles)

      scene.add(new THREE.AmbientLight(0x6bdff4, 1.6))
      const key = new THREE.PointLight(0xc5f9ff, 22, 22)
      key.position.set(2.5, 5.5, 4)
      scene.add(key)
      const rim = new THREE.PointLight(0x4968ff, 16, 18)
      rim.position.set(-3, 2, -2)
      scene.add(rim)

      const resize = () => {
        const width = mount.clientWidth || 1
        const height = mount.clientHeight || 1
        renderer.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(mount)
      onReady?.()

      const started = performance.now()
      const animate = (time) => {
        const elapsed = (time - started) / 1000
        if (!reduced) sage.position.y = THREE.MathUtils.lerp(sage.position.y, 0, Math.min(0.055, elapsed * 0.004 + 0.02))
        sage.rotation.y = Math.sin(time * 0.00034) * 0.1
        sage.position.x = Math.sin(time * 0.0007) * 0.03
        const activeGesture = gestureRef.current
        const pointTarget = activeGesture === 'point' ? -1.08 : activeGesture === 'talk' ? -0.36 : 0.14
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, pointTarget, 0.08)
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, activeGesture === 'point' ? -0.72 : 0, 0.08)
        collar.rotation.z += 0.006
        platform.rotation.y -= 0.002
        particles.rotation.y += 0.0007
        particles.position.y = ((time * 0.0001) % 1.4) - 0.7
        renderer.render(scene, camera)
        frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
      return () => {
        observer.disconnect()
        cancelAnimationFrame(frame)
        scene.traverse((object) => {
          object.geometry?.dispose()
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose())
          else object.material?.dispose?.()
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    } catch {
      setFailed(true)
      return undefined
    }
  }, [compact, onReady])

  return <div className={`sage-3d-viewport ${className}`} ref={mountRef}>{failed && <Sage3DPerformanceFallback />}</div>
}
