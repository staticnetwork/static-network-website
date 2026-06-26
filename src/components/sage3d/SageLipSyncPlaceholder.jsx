export default function SageLipSyncPlaceholder({ speaking = false }) {
  return <span data-sage-lip-sync={speaking ? 'amplitude-placeholder-active' : 'idle'} />
}
