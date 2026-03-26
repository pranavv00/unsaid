'use client'
// components/layout/FeedSelector.tsx
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe, GraduationCap, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATIC_FEEDS = [
  { label: 'Global Feed', value: 'global', icon: Globe },
]

interface FeedSelectorProps {
  value: string
  onChange: (v: string) => void
}

export default function FeedSelector({ value, onChange }: FeedSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [colleges, setColleges] = useState<{name: string, slug: string}[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => setColleges(data.colleges || []))
      .catch(console.error)
  }, [])

  const allFeeds = useMemo(() => {
    const dbFeeds = colleges.map(c => ({
      label: c.name,
      value: c.slug,
      icon: GraduationCap
    }))
    return [...STATIC_FEEDS, ...dbFeeds]
  }, [colleges])

  const filteredFeeds = useMemo(() => {
    if (!search.trim()) return allFeeds
    return allFeeds.filter(f => 
      f.label.toLowerCase().includes(search.toLowerCase()) ||
      f.value.toLowerCase().includes(search.toLowerCase())
    )
  }, [allFeeds, search])

  const selected = allFeeds.find((f) => f.value === value) || STATIC_FEEDS[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl font-display font-600 text-sm transition-all duration-200',
          'border border-white/[0.07] hover:border-white/[0.14]',
          open
            ? 'bg-white/[0.08] text-white shadow-glow'
            : 'bg-white/[0.04] text-white/80 hover:bg-white/[0.07] hover:text-white'
        )}
      >
        <selected.icon size={14} className="opacity-70" />
        <span>{selected.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} className="opacity-60" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 min-w-[160px]"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)] w-[240px]">
              {/* Search */}
              <div className="p-2 border-b border-white/[0.05]">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search college..."
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30 transition-all font-dm"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {filteredFeeds.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <p className="text-xs text-white/20">No colleges found</p>
                  </div>
                ) : (
                  filteredFeeds.map((feed) => {
                    const Icon = feed.icon
                    const isActive = feed.value === value
                    return (
                      <button
                        key={feed.value}
                        onClick={() => {
                          onChange(feed.value)
                          setOpen(false)
                          setSearch('')
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left',
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                            : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
                        )}
                      >
                        <Icon size={13} className={isActive ? 'opacity-100' : 'opacity-50'} />
                        <span className="font-dm truncate">{feed.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="feed-indicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                          />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
