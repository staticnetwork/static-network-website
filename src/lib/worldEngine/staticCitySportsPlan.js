export const staticCitySportsPlan = {
  id: 'static-sports',
  name: 'STATIC SPORTS',
  principle: 'Sports are venue gravity inside STATIC City, not a detached minigame menu.',
  firstPlayableTarget: 'basketball',
  currentMode: 'owner-only design spine',
  publicClaim: 'Basketball first. More sports later.',
}

export const staticCitySportsModes = [
  {
    id: 'arena-basketball',
    title: 'STATIC Arena Basketball',
    status: 'first sport target',
    copy: 'Start with a premium basketball venue: 1v1 and shootaround as the smallest proof, then 3v3, 5v5, leagues, and spectator events after real physics/netcode exist.',
  },
  {
    id: 'vip-watch-party',
    title: 'VIP Watch Parties',
    status: 'city gravity',
    copy: 'The strip, Club STATIC, rooftop lounges, and VIP tables can react to arena nights before sports gameplay is real.',
  },
  {
    id: 'creator-leagues',
    title: 'Creator Leagues',
    status: 'future',
    copy: 'Creators, studios, crews, and celebrity Entities can host teams, tournaments, halftime drops, and Signal aftershow clips.',
  },
  {
    id: 'street-courts',
    title: 'Street Pulse Courts',
    status: 'future',
    copy: 'Lower-city pickup games, park courts, street tournaments, and local reputation make sports feel native to the city.',
  },
  {
    id: 'future-sports',
    title: 'More Sports Coming',
    status: 'future',
    copy: 'Football, soccer, boxing, racing crossovers, stunt sports, and original STATIC sports should arrive only after the basketball loop proves control, animation, and moderation.',
  },
]

export const staticCitySportsRules = [
  'Do not use NBA, NCAA, team logos, player likenesses, real league names, or broadcast marks unless licensed.',
  'Do not present live sports stats, betting, wagering, odds, fantasy sports, or cash prizes until legal/payment systems exist.',
  'Start with owner-authored venue shell, crowd heat, and non-cash reputation intent.',
  'Add multiplayer only after auth, moderation, anti-cheat, latency, and replay/reporting are real.',
  'Keep sports connected to Signals, Radio, venues, properties, vehicles, and creator events.',
]

export const staticCitySportsAssets = [
  {
    id: 'static-arena',
    targetPath: '/assets/world/city/venues/static-arena.glb',
    need: 'Exterior/interior arena chunk with court, tunnel, VIP boxes, fan wall, plaza, and skyline signage.',
  },
  {
    id: 'basketball-court-kit',
    targetPath: '/assets/world/city/sports/basketball-court-kit.glb',
    need: 'Original basketball court kit: hoop, rim, backboard, floor, ball, shot markers, benches, and non-branded scoreboard.',
  },
  {
    id: 'fan-crowd-kit',
    targetPath: '/assets/world/city/props/sports-fan-crowd-kit.glb',
    need: 'Optimized modular crowd shells and light-card silhouettes for arena nights and strip watch parties.',
  },
  {
    id: 'vip-watch-party-kit',
    targetPath: '/assets/world/city/sports/vip-watch-party-kit.glb',
    need: 'VIP table, bottle-service lighting, sports screen wall, crowd ropes, and lounge props for Club STATIC / strip sports nights.',
  },
]
