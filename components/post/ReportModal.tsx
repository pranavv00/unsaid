'use client'
// components/post/ReportModal.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Flag, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const REASONS = [
  { value: 'ABUSE', label: 'Abuse or Harassment' },
  { value: 'FAKE_INFO', label: 'Fake Information' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'MISLEADING', label: 'Misleading content' },
]

interface ReportModalProps {
  postId: number
  onClose: () => void
}

export default function ReportModal({ postId, onClose }: ReportModalProps) {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason: selected }),
      })
      setDone(true)
      setTimeout(onClose, 1800)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm glass rounded-2xl p-5 shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
      >
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 size={36} className="text-emerald-400" />
            <p className="text-sm text-white/70 font-medium">Report submitted. Thank you.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag size={14} className="text-red-400/70" />
                <span className="font-display font-600 text-sm text-white">Report post</span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelected(r.value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all',
                    selected === r.value
                      ? 'bg-red-400/10 text-red-400 border border-red-400/20'
                      : 'text-white/60 hover:bg-white/[0.05] hover:text-white/80 border border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all',
                    selected === r.value ? 'border-red-400 bg-red-400' : 'border-white/20'
                  )} />
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected || loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all bg-red-500/80 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting…' : 'Submit report'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
