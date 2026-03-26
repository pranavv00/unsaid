'use client'
// app/page.tsx
import { useState, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Feed from '@/components/feed/Feed'
import { useGuestMode } from '@/hooks/useGuestMode'
import { cn } from '@/lib/utils'
import type { PostWithRelations } from '@/types'

const CreatePostModal = dynamic(() => import('@/components/post/CreatePostModal'), { ssr: false })
const GuestModal = dynamic(() => import('@/components/auth/GuestModal'), { ssr: false })

export default function HomePage() {
  const [feed, setFeed] = useState('global')
  const [postType, setPostType] = useState<string | undefined>(undefined)
  const [showCreate, setShowCreate] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const { isSignedIn } = useUser()
  const { showGuestModal, dismissGuestModal } = useGuestMode()

  const handleCreatePost = () => {
    if (!isSignedIn) {
      setShowAuthPrompt(true)
      return
    }
    setShowCreate(true)
  }

  const handleRequireAuth = () => {
    setShowAuthPrompt(true)
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient background orbs */}
      <div
        className="gradient-orb w-[500px] h-[500px] top-[-200px] left-[-100px]"
        style={{ background: 'radial-gradient(circle, #7c6aff 0%, transparent 70%)' }}
      />
      <div
        className="gradient-orb w-[400px] h-[400px] top-[30%] right-[-150px]"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
      />
      <div
        className="gradient-orb w-[300px] h-[300px] bottom-[10%] left-[20%]"
        style={{ background: 'radial-gradient(circle, #3b3a8c 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        <Navbar
          feed={feed}
          onFeedChange={setFeed}
          onCreatePost={handleCreatePost}
        />

        <main className="pt-[76px] pb-20 px-4">
          <div className="max-w-[680px] mx-auto">
            {/* Page header */}
            <div className="mb-7 mt-4 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-[clamp(2.5rem,7vw,4rem)] font-display font-800 leading-[1.1] tracking-tight mb-2">
                  <span className="text-white">Unsaid. </span>
                  <span className="text-white/40">Unfiltered.</span>
                  <br />
                  <span className="bg-gradient-to-r from-accent to-indigo-400 bg-clip-text text-transparent">
                    All in one place.
                  </span>
                </h1>
                <p className="text-sm text-white/30 font-medium">Anonymous placement stories from across the globe.</p>
              </div>

              {/* Toggle */}
              <div className="flex bg-white/[0.03] border border-white/[0.05] p-1 rounded-xl">
                {[
                  { id: undefined, label: 'All' },
                  { id: 'REVIEW', label: 'Reviews' },
                  { id: 'CONFESSION', label: 'Confessions' },
                  { id: 'INTERVIEW', label: 'Interviews' },
                ].map((t) => (
                  <button
                    key={String(t.id)}
                    onClick={() => setPostType(t.id)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-[11px] font-700 uppercase tracking-wider transition-all',
                      postType === t.id
                        ? 'bg-white/[0.07] text-white shadow-sm'
                        : 'text-white/30 hover:text-white/50'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Feed
              feedSlug={feed}
              postType={postType}
              onRequireAuth={handleRequireAuth}
              onCreatePost={handleCreatePost}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreatePostModal
            onClose={() => setShowCreate(false)}
            onSuccess={() => setShowCreate(false)}
          />
        )}
        {(showGuestModal || showAuthPrompt) && (
          <GuestModal
            onClose={() => {
              dismissGuestModal()
              setShowAuthPrompt(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
