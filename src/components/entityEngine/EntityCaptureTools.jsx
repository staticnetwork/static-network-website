import { captureCanvas } from '../../lib/entityEngine/entityCapture'

export default function EntityCaptureTools({ canvas, onCapture }) {
  async function capture(type) {
    if (!canvas) return
    const file = await captureCanvas(canvas, `static-entity-${type}.png`)
    if (file) onCapture?.(file, type)
  }
  return <div className="entity-capture-tools">{['profile', 'full-body', 'post-pose', 'channel-banner'].map((type) => <button type="button" onClick={() => capture(type)} key={type}>Capture {type}</button>)}</div>
}
