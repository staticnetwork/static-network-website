import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { entityMaterials } from '../../lib/entityEngine/entityMaterials'

export default function EntityViewport3D({ onReady, className = '' }) {
  const mountRef = useRef(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    let renderer
    let frame
    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
      camera.position.set(0, 1.3, 5.4)
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      mount.appendChild(renderer.domElement)

      const material = new THREE.MeshPhysicalMaterial(entityMaterials.hologram)
      const group = new THREE.Group()
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.56, 1.15, 8, 18), material)
      torso.position.y = 1.25
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 28), material)
      head.scale.set(0.82, 1.04, 0.82)
      head.position.y = 2.42
      group.add(torso, head)
      scene.add(group)
      scene.add(new THREE.AmbientLight(0x78e8ff, 1.2))
      const light = new THREE.PointLight(0xffffff, 9, 20)
      light.position.set(2, 4, 4)
      scene.add(light)
      onReady?.(renderer.domElement)

      const resize = () => {
        const width = mount.clientWidth
        const height = mount.clientHeight
        renderer.setSize(width, height)
        camera.aspect = width / Math.max(height, 1)
        camera.updateProjectionMatrix()
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(mount)
      const animate = (time) => {
        group.rotation.y = Math.sin(time * 0.00035) * 0.22
        group.position.y = Math.sin(time * 0.0012) * 0.04
        renderer.render(scene, camera)
        frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
      return () => {
        observer.disconnect()
        cancelAnimationFrame(frame)
        scene.traverse((object) => {
          object.geometry?.dispose()
          if (object.material?.dispose) object.material.dispose()
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    } catch {
      setFallback(true)
      return undefined
    }
  }, [onReady])

  return <div ref={mountRef} className={`entity-viewport-3d ${className}`}>{fallback && <p>3D preview unavailable on this device.</p>}</div>
}
