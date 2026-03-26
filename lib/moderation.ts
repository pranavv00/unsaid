// lib/moderation.ts

// Multi-language bad words list (representative subset)
const BAD_WORDS: Record<string, string[]> = {
  english: [
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'prick',
    'motherfucker', 'bullshit', 'damn', 'hell', 'crap', 'slut', 'whore',
  ],
  hindi: [
    'madarchod', 'bhenchod', 'chutiya', 'bhosdike', 'gaand', 'lund',
    'randi', 'harami', 'kamina', 'kutte', 'saala', 'haramzada',
  ],
  marathi: [
    'aai zavli', 'bhen zavli', 'tuzya aai', 'ghanta', 'zavadya',
    'chakka', 'banda', 'hadya',
  ],
}

const ALL_BAD_WORDS = Object.values(BAD_WORDS).flat()

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // strip special chars
    .replace(/\s+/g, ' ')
    .trim()
}

function maskWord(word: string): string {
  if (word.length <= 2) return '*'.repeat(word.length)
  return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1]
}

export function moderateContent(content: string): {
  clean: string
  hasBadWords: boolean
  severity: 'none' | 'low' | 'high'
} {
  let clean = content
  let count = 0

  for (const word of ALL_BAD_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    if (regex.test(clean)) {
      count++
      clean = clean.replace(regex, (match) => maskWord(match))
    }
  }

  return {
    clean,
    hasBadWords: count > 0,
    severity: count === 0 ? 'none' : count <= 2 ? 'low' : 'high',
  }
}

export function isTooSevere(content: string): boolean {
  const { severity } = moderateContent(content)
  return severity === 'high'
}
