'use client'
// app/feed/[slug]/page.tsx
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Feed from '@/components/feed/Feed'
import { useGuestMode } from '@/hooks/useGuestMode'
import CollegeIntelligence from '@/components/college/CollegeIntelligence'
import BackButton from '@/components/ui/BackButton'
import { cn } from '@/lib/utils'

const CreatePostModal = dynamic(() => import('@/components/post/CreatePostModal'), { ssr: false })
const GuestModal = dynamic(() => import('@/components/auth/GuestModal'), { ssr: false })

export default function CollegeFeedPage() {
  const params = useParams()
  const slug = params?.slug as string || 'global'
  const [feed, setFeed] = useState(slug)
  const [postType, setPostType] = useState<string | undefined>(undefined)
  const [showCreate, setShowCreate] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [collegeName, setCollegeName] = useState('')
  const { isSignedIn } = useUser()
  const { showGuestModal, dismissGuestModal } = useGuestMode()

  const handleCreate = () => {
    if (!isSignedIn) { setShowAuth(true); return }
    setShowCreate(true)
  }

  useEffect(() => {
    if (slug !== 'global') {
      fetch('/api/colleges')
        .then(res => res.json())
        .then(data => {
          const c = data.colleges?.find((c: any) => c.slug === slug)
          if (c) setCollegeName(c.name)
        })
    }
  }, [slug])

  return (
    <div className="min-h-screen relative">
      <div
        className="gradient-orb w-[500px] h-[500px] top-[-200px] right-[-100px]"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
      />
      <div className="relative z-10">
        <Navbar feed={feed} onFeedChange={setFeed} onCreatePost={handleCreate} />
        <main className="pt-[76px] pb-20 px-4">
          <div className="max-w-[680px] mx-auto">
            <div className="mb-7 mt-4 flex items-end justify-between gap-4 flex-wrap">
              <div className="space-y-3">
                <BackButton />
                <div>
                  <h1 className="font-display font-700 text-[22px] text-white/90 mb-1 leading-tight">
                    {collegeName || slug.toUpperCase()} Experiences
                  </h1>
                  <p className="text-sm text-white/30 font-medium">Anonymous student-reported insights and reviews.</p>
                </div>
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
                      'px-3.5 py-1.5 rounded-lg text-[10px] font-800 uppercase tracking-tighter transition-all',
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

            {slug !== 'global' && <CollegeIntelligence slug={slug} />}

            <Feed
              feedSlug={feed}
              postType={postType}
              onRequireAuth={() => setShowAuth(true)}
              onCreatePost={handleCreate}
            />
          </div>
        </main>
      </div>
      <AnimatePresence>
        {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onSuccess={() => setShowCreate(false)} />}
        {(showGuestModal || showAuth) && <GuestModal onClose={() => { dismissGuestModal(); setShowAuth(false) }} />}
      </AnimatePresence>
    </div>
  )
}
