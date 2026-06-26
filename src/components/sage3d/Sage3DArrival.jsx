import Sage3DViewport from './Sage3DViewport'

export default function Sage3DArrival({ gesture = 'arrival' }) {
  return <div className="sage-3d-arrival"><Sage3DViewport gesture={gesture} /><div className="sage-3d-arrival__beam" /><div className="sage-3d-arrival__telemetry"><span>HOLOGRAPHIC CONCIERGE</span><small>PROCEDURAL 3D BRIDGE / GLB PIPELINE READY</small></div></div>
}

