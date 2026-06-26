export default function EntityPoseSystem({ pose = 'idle', children }) {
  return <div data-entity-pose={pose}>{children}</div>
}
