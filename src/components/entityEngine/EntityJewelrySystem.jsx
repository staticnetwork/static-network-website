export default function EntityJewelrySystem({ jewelry = [] }) {
  return <div data-entity-layer="jewelry" data-count={jewelry.length} />
}

