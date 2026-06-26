export default function EntityIdentityPreview({ entity }) {
  return <div className="entity-identity-preview"><span>ENTITY DNA</span><strong>{entity?.name || 'Pending identity'}</strong><small>GLB slot ready</small></div>
}
