import { lazy, Suspense } from 'react'

const Sage3DArrival = lazy(() => import('../sage3d/Sage3DArrival'))

export default function SageHologramIntro({ gesture }) {
  return <Suspense fallback={<div className="sage-3d-arrival sage-3d-loading">INITIALIZING HOLOGRAM...</div>}><Sage3DArrival gesture={gesture} /></Suspense>
}
