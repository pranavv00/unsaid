// lib/scoring.ts

const UPVOTE_WEIGHT = 3
const COMMENT_WEIGHT = 2
const RECENCY_HALFLIFE_HOURS = 24 // score halves every 24h

export function calculateScore(
  upvotes: number,
  comments: number,
  createdAt: Date
): number {
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  const recencyFactor = Math.pow(0.5, ageHours / RECENCY_HALFLIFE_HOURS)

  return (upvotes * UPVOTE_WEIGHT + comments * COMMENT_WEIGHT) * recencyFactor
}

export function generateAnonName(): string {
  const adjectives = [
    'Silent', 'Hidden', 'Masked', 'Unknown', 'Veiled',
    'Covert', 'Secret', 'Shadow', 'Phantom', 'Cryptic',
  ]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${adj}_${num}`
}
