export default function EntityTattooSystem({ tattoos = [] }) {
  return <div data-entity-layer="tattoos" data-count={tattoos.length} />
}
