'use client'
// components/post/CreatePostModal.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, ChevronDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy', color: 'text-emerald-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-400' },
  { value: 'HARD', label: 'Hard', color: 'text-orange-400' },
  { value: 'VERY_HARD', label: 'Very Hard', color: 'text-red-400' },
]

const RESULTS = [
  { value: 'SELECTED', label: '✓ Selected', color: 'text-emerald-400' },
  { value: 'REJECTED', label: '✗ Rejected', color: 'text-red-400' },
  { value: 'PENDING', label: '⏳ Pending', color: 'text-zinc-400' },
  { value: 'WAITLISTED', label: '⏸ Waitlisted', color: 'text-amber-400' },
]

const POST_TYPES = [
  { value: 'REVIEW', label: 'Review', icon: '⭐' },
  { value: 'INTERVIEW', label: 'Interview', icon: '📝' },
  { value: 'CONFESSION', label: 'Confession', icon: '🎭' },
]


interface CreatePostModalProps {
  onClose: () => void
  onSuccess: (post: unknown) => void
}

export default function CreatePostModal({ onClose, onSuccess }: CreatePostModalProps) {
  const [form, setForm] = useState({
    companyName: '',
    role: '',
    content: '',
    difficulty: 'MEDIUM',
    result: 'PENDING',
    collegeSlug: '',
    newCollegeName: '',
    type: 'REVIEW',
    isGlobal: true,
  })
  const [colleges, setColleges] = useState<{name: string, slug: string}[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        setColleges(data.colleges || [])
      })
      .catch(console.error)
  }, [])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const charCount = form.content.length
  const maxChars = 5000

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (form.type === 'INTERVIEW') {
      if (!form.companyName?.trim()) return setError('Company name is required.')
      if (!form.role?.trim()) return setError('Role is required.')
    }
    if (form.content.trim().length < 10) return setError('Please write at least 10 characters.')

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setLoading(false)
        return
      }

      setSuccess(true)
      
      // Dispatch custom event for real-time feed update
      window.dispatchEvent(new CustomEvent('new-post', { detail: data }))

      setTimeout(() => {
        onSuccess(data)
        onClose()
      }, 1500)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg glass rounded-t-3xl sm:rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto"
      >
        {success ? (
          <div className="flex flex-col items-center gap-4 py-16 px-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 size={48} className="text-emerald-400" />
            </motion.div>
            <div>
              <h3 className="font-display font-700 text-lg text-white mb-1">Posted anonymously</h3>
              <p className="text-sm text-white/40">Your experience is now live on the feed.</p>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-white/10 mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-700 text-[18px] text-white">Share your experience</h2>
                <p className="text-xs text-white/30 mt-0.5">Posted anonymously — always.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Post Type Selector */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {POST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    className={cn(
                      'px-3 py-3 rounded-xl text-[11px] font-800 transition-all border flex flex-col items-center gap-1.5 uppercase tracking-tighter',
                      form.type === t.value
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.1)]'
                        : 'bg-white/[0.03] border-white/[0.05] text-white/30 hover:bg-white/[0.05] hover:border-white/[0.1]'
                    )}
                  >
                    <span className="text-xl">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Company + Role (Only for Interviews) */}
              {form.type === 'INTERVIEW' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/40 mb-1.5 block font-700 uppercase tracking-[0.15em]">Company (Optional)</label>
                    <div className="relative">
                      <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        value={form.companyName}
                        onChange={(e) => set('companyName', e.target.value)}
                        placeholder="e.g. Google"
                        className="input-field w-full pl-9 pr-3.5 py-3 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-1.5 block font-700 uppercase tracking-[0.15em]">Role (Optional)</label>
                    <input
                      value={form.role}
                      onChange={(e) => set('role', e.target.value)}
                      placeholder="e.g. SDE Intern"
                      className="input-field w-full px-3.5 py-3 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* College */}
              <div>
                <label className="text-[10px] text-white/40 mb-1.5 block font-700 uppercase tracking-[0.15em]">College</label>
                <div className="relative">
                  <select
                    value={form.collegeSlug}
                    onChange={(e) => set('collegeSlug', e.target.value)}
                    className="input-field w-full px-3.5 py-3 text-sm appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">Select college</option>
                    {colleges.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                    <option value="other">+ Add your college...</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* New College Input */}
              {form.collegeSlug === 'other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] text-white/40 mb-1.5 block font-700 uppercase tracking-[0.15em]">College Name</label>
                  <input
                    value={form.newCollegeName}
                    onChange={(e) => set('newCollegeName', e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="input-field w-full px-3.5 py-3 text-sm"
                    autoFocus
                  />
                </motion.div>
              )}

              {/* Difficulty + Result (Only for Interviews) */}
              {form.type === 'INTERVIEW' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div>
                    <label className="text-[9px] text-white/30 mb-2.5 block font-800 uppercase tracking-[0.2em]">Difficulty</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => set('difficulty', d.value)}
                          className={cn(
                            'px-2 py-1.5 rounded-lg text-[10px] font-800 border transition-all uppercase tracking-tighter',
                            form.difficulty === d.value
                              ? `${d.color} bg-white/5 border-white/10`
                              : 'text-white/20 border-white/[0.03] hover:border-white/[0.08] hover:text-white/40'
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-white/30 mb-2.5 block font-800 uppercase tracking-[0.2em]">Outcome</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {RESULTS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => set('result', r.value)}
                          className={cn(
                            'px-2 py-1.5 rounded-lg text-[10px] font-800 border transition-all uppercase tracking-tighter',
                            form.result === r.value
                              ? `${r.color} bg-white/5 border-white/10`
                              : 'text-white/20 border-white/[0.03] hover:border-white/[0.08] hover:text-white/40'
                          )}
                        >
                          {r.label.split(' ')[1] || r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-white/40 font-700 uppercase tracking-[0.15em]">
                    {form.type === 'INTERVIEW' ? 'The Experience' : form.type === 'REVIEW' ? 'Your Review' : 'The Confession'}
                  </label>
                  <span className={cn('text-[10px] font-700', charCount > maxChars * 0.9 ? 'text-red-400' : 'text-white/20')}>
                    {charCount}/{maxChars}
                  </span>
                </div>
                <textarea
                  value={form.content}
                  onChange={(e) => set('content', e.target.value.slice(0, maxChars))}
                  placeholder={
                    form.type === 'INTERVIEW'
                      ? "Describe the rounds, specific questions, and tips…"
                      : form.type === 'REVIEW'
                      ? "Pros, cons, and campus life experience…"
                      : "Speak your truth anonymously…"
                  }
                  rows={6}
                  className="input-field w-full px-4 py-3.5 text-sm resize-none leading-relaxed min-h-[160px]"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center border transition-colors",
                    form.isGlobal ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-white/5 border-white/10 text-white/30"
                  )}>
                    {form.isGlobal ? '🌍' : '🎓'}
                  </div>
                  <div>
                    <p className="text-[11px] font-800 text-white/90 uppercase tracking-wider">
                      {form.isGlobal ? 'Public Feed' : 'College Only'}
                    </p>
                    <p className="text-[9px] text-white/30 font-medium tracking-tight">
                      {form.isGlobal ? 'Visible to all students on Unsaid' : 'Only visible to students from your college'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, isGlobal: !f.isGlobal }))}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative p-1",
                    form.isGlobal ? "bg-indigo-500/30" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: form.isGlobal ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                      "w-4 h-4 rounded-full shadow-lg transition-colors",
                      form.isGlobal ? "bg-indigo-400" : "bg-white/40"
                    )} 
                  />
                </button>
              </div>


              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5"
                >
                  <AlertCircle size={12} />
                  {error}
                </motion.div>
              )}

              {/* Anonymity notice */}
              <div className="relative group/badge">
                <motion.div 
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-md" 
                />
                <div className="relative px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center gap-3">
                  <motion.span 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="text-xl"
                  >
                    🔒
                  </motion.span>
                  <p className="text-[11px] text-white/50 font-700 leading-tight">
                    Your identity is <span className="text-white underline decoration-indigo-500/40 underline-offset-2">never</span> revealed. <br />
                    You appear as a random <span className="text-indigo-400">anonymous name</span>.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Posting…
                  </>
                ) : (
                  'Post anonymously'
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
