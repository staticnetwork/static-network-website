export default function EntityAssetSlot({ slot, assetRef, children }) {
  return <div data-entity-slot={slot} data-asset-ref={assetRef || 'pending'}>{children}</div>
}

