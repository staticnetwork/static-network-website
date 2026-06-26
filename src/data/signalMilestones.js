export const signalMilestones = [
  {
    id: 'signal-1m',
    threshold: 1_000_000,
    score: '1M',
    label: 'Million Signal',
    title: 'Signal Millionaire',
    description: 'First major proof that the network is reacting.',
    tier: 'million',
  },
  {
    id: 'signal-1b',
    threshold: 1_000_000_000,
    score: '1B',
    label: 'Billion Signal',
    title: 'Broadcast Royalty',
    description: 'A billion-point creator whose work bends the feed.',
    tier: 'billion',
  },
  {
    id: 'signal-1t',
    threshold: 1_000_000_000_000,
    score: '1T',
    label: 'Trillion Signal',
    title: 'Mythic Founder Tier',
    description: 'The rarest launch-era badge. A living landmark.',
    tier: 'trillion',
  },
]

export function parseSignalScore(value) {
  const raw = String(value || '').trim().toUpperCase()
  if (!raw || raw === 'LOCAL' || raw === 'PENDING') return 0
  if (raw.endsWith('T')) return Number(raw.replace('T', '')) * 1_000_000_000_000
  if (raw.endsWith('B')) return Number(raw.replace('B', '')) * 1_000_000_000
  if (raw.endsWith('M')) return Number(raw.replace('M', '')) * 1_000_000
  if (raw.endsWith('K')) return Number(raw.replace('K', '')) * 1_000
  return Number(raw.replace(/,/g, '')) || 0
}

export function unlockedSignalMilestones(score) {
  const numericScore = parseSignalScore(score)
  return signalMilestones.filter((milestone) => numericScore >= milestone.threshold)
}

export function signalBarsForScore(score) {
  const numericScore = parseSignalScore(score)
  if (numericScore >= 1_000_000_000_000) return 5
  if (numericScore >= 1_000_000_000) return 4
  if (numericScore >= 1_000_000) return 3
  if (numericScore >= 100_000) return 2
  if (numericScore > 0) return 1
  return 0
}

export function signalBarLabel(score) {
  const bars = signalBarsForScore(score)
  if (bars === 5) return 'Legendary 5-bar Signal'
  if (bars === 4) return 'Elite 4-bar Signal'
  if (bars === 3) return 'Strong 3-bar Signal'
  if (bars === 2) return 'Rising 2-bar Signal'
  if (bars === 1) return 'First-bar Signal'
  return 'No Signal yet'
}
