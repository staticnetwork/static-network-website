import { useState } from 'react'
import EntityCaptureTools from './EntityCaptureTools'
import EntityPipelineStatus from './EntityPipelineStatus'
import EntityViewport3D from './EntityViewport3D'

export default function EntityEngine() {
  const [canvas, setCanvas] = useState(null)
  return <div className="entity-engine"><EntityPipelineStatus /><EntityViewport3D onReady={setCanvas} /><EntityCaptureTools canvas={canvas} /></div>
}
