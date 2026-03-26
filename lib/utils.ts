// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export const DIFFICULTY_COLORS = {
  EASY: 'text-emerald-400 bg-emerald-400/10',
  MEDIUM: 'text-amber-400 bg-amber-400/10',
  HARD: 'text-orange-400 bg-orange-400/10',
  VERY_HARD: 'text-red-400 bg-red-400/10',
} as const

export const RESULT_COLORS = {
  SELECTED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  REJECTED: 'text-red-400 bg-red-400/10 border-red-400/20',
  PENDING: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
  WAITLISTED: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
} as const

export const RESULT_LABELS = {
  SELECTED: '✓ Selected',
  REJECTED: '✗ Rejected',
  PENDING: '⏳ Pending',
  WAITLISTED: '⏸ Waitlisted',
} as const

export const DIFFICULTY_LABELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  VERY_HARD: 'Very Hard',
} as const

export function getAuthorColors(name: string) {
  const colors = [
    { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { text: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { text: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
    { text: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
    { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { text: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
