export default function EntityWeaponSystem({ items = [] }) {
  return <div data-entity-layer="visual-props" data-count={items.length} data-safety="non-operational-visual-props-only" />
}

