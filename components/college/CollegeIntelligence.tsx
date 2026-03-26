// components/college/CollegeIntelligence.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, Loader2, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IntelligenceData {
  headline: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  sentiment: string
  placementInsight: string
  satisfactionLevel: string
  updatedAt: string
}

export default function CollegeIntelligence({ slug }: { slug: string }) {
  const [data, setData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIntelligence = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/intelligence?slug=${slug}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch intelligence:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/intelligence?slug=${slug}`, { method: 'POST' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        const errData = await res.json()
        setError(errData.error || 'Check back after more posts are added.')
      }
    } catch (err) {
      setError('Failed to reach AI service.')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (slug && slug !== 'global') {
      fetchIntelligence()
    } else {
      setLoading(false)
    }
  }, [slug])

  if (loading) {
    return (
      <div className="glass-premium rounded-2xl p-8 border border-white/5 mb-8 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-3" />
        <span className="text-[10px] uppercase font-700 tracking-widest text-white/30">Analyzing Campus Data...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-2xl p-6 border border-white/5 mb-8 text-center bg-indigo-500/[0.02]"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-indigo-400 w-5 h-5" />
        </div>
        <h3 className="text-white font-800 text-lg mb-1">No AI Summary Yet</h3>
        <p className="text-white/40 text-sm mb-6 max-w-[400px] mx-auto">
          {error || "We'll analyze this college's vibes once students start sharing their experiences."}
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-700 uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
        >
          {generating ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...</>
          ) : (
            <><Wand2 className="w-3.5 h-3.5" /> Generate AI Insights</>
          )}
        </button>
      </motion.div>
    )
  }

  const sentimentColors: Record<string, string> = {
    Good: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Average: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Poor: 'text-red-400 bg-red-400/10 border-red-400/20',
  }

  const sentimentColor = sentimentColors[data.sentiment] || sentimentColors.Average

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      
      <div className="relative glass-premium rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                <Sparkles size={24} className="text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-800 text-white tracking-tight">College Intelligence</h2>
                  <span className="text-[10px] text-amber-500/60 font-800 uppercase tracking-tighter bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
                    ⚠️ User Content
                  </span>
                </div>
                <p className="text-[10px] text-white/30 font-700 uppercase tracking-[0.2em] mt-0.5">Gemini-Powered Analysis</p>
              </div>
            </div>
            <div className={cn('px-3 py-1 rounded-full text-[11px] font-700 uppercase tracking-tighter border', sentimentColor)}>
              {data.sentiment} Sentiment
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-800 text-white leading-tight mb-3">
            {data.headline}
          </h2>

          <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6">
            {data.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 size={14} />
                <span className="text-xs font-700 uppercase tracking-wider">Strengths</span>
              </div>
              <ul className="space-y-2">
                {data.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-white/70 flex gap-2">
                    <span className="text-emerald-400/50">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <AlertCircle size={14} />
                <span className="text-xs font-700 uppercase tracking-wider">Weaknesses</span>
              </div>
              <ul className="space-y-2">
                {data.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-white/70 flex gap-2">
                    <span className="text-red-400/50">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-white/5 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[11px] font-700 uppercase tracking-widest text-white/30 mb-2">Placement Insights</h4>
                    <p className="text-sm text-white/70 italic leading-relaxed">
                      "{data.placementInsight}"
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-700 uppercase tracking-widest text-white/30 mb-2">Student Satisfaction</h4>
                    <p className="text-sm text-white/70">
                      {data.satisfactionLevel}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[11px] font-700 uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
            >
              {expanded ? (
                <>Less Details <ChevronUp size={12} /></>
              ) : (
                <>Deep Insights <ChevronDown size={12} /></>
              )}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-white/20 italic">
              <Info size={10} />
              AI-generated from {slug.toUpperCase()} student data
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
