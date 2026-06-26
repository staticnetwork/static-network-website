export default function EntityMaterialSystem({ material = 'hologram', children }) {
  return <div data-entity-material={material}>{children}</div>
}
