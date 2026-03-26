'use client'
// app/profile/page.tsx
import { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, MessageSquare, Heart, Loader2, Lock } from 'lucide-react'
import PostCard from '@/components/post/PostCard'
import PostSkeleton from '@/components/post/PostSkeleton'
import { cn } from '@/lib/utils'
import type { PostWithRelations, CommentWithUser } from '@/types'

const TABS = [
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'likes', label: 'Liked', icon: Heart },
]

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    fetchTab(activeTab)
  }, [activeTab, isSignedIn])

  const fetchTab = async (tab: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/profile?tab=${tab}`)
      const data = await res.json()
      if (tab === 'comments') {
        setComments(data.comments)
      } else {
        setPosts(data.posts)
      }
    } catch { }
    setLoading(false)
  }

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-5">
            <Lock size={20} className="text-white/30" />
          </div>
          <h2 className="font-display font-700 text-lg text-white mb-2">Sign in to view profile</h2>
          <p className="text-sm text-white/30 mb-6">Your anonymous identity awaits.</p>
          <SignInButton mode="modal">
            <button className="btn-primary px-6 py-2.5 text-sm">Sign in</button>
          </SignInButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[76px] pb-20 px-4">
      <div className="max-w-[680px] mx-auto">
        {/* Profile header */}
        <div className="mb-8 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-700 text-lg text-accent">
                {user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-display font-700 text-[18px] text-white">Your Profile</span>
              </div>
              <p className="text-xs text-white/30 font-mono">Anonymous identity — never revealed</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-6 border border-white/[0.06]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                activeTab === id
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-white/30 hover:text-white/60'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
            </div>
          ) : activeTab === 'comments' ? (
            <motion.div
              key="comments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {comments.length === 0 ? (
                <p className="text-center text-sm text-white/20 py-12">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="card p-4">
                    <p className="text-xs text-white/30 mb-2 font-medium">
                      On: {(c as any).post?.companyName} — {(c as any).post?.role}
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {posts.length === 0 ? (
                <p className="text-center text-sm text-white/20 py-12">
                  {activeTab === 'posts' ? 'No posts yet.' : 'No liked posts yet.'}
                </p>
              ) : (
                posts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    isAuthed
                    onRequireAuth={() => { }}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
