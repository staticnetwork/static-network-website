export default function EntityRig({ children, animation = 'idle' }) {
  return <div data-entity-animation={animation}>{children}</div>
}

