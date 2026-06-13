const sageModelSlots = {
  hologram: '/assets/sage/sage-hologram.glb',
  idle: '/assets/sage/sage-idle.glb',
  point: '/assets/sage/sage-point.glb',
  talk: '/assets/sage/sage-talk.glb',
}

export default function SageHologramModel({ assetAvailable = false }) {
  return <span data-sage-model={assetAvailable ? sageModelSlots.hologram : 'procedural-development-stand-in'} />
}
