// app/profile/[id]/page.tsx
'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MessageSquare,
  ArrowUp,
  Settings,
  MapPin,
  LogOut,
  ChevronLeft,
  User as UserIcon
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Feed from '@/components/feed/Feed'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import BackButton from '@/components/ui/BackButton'

interface ProfileData {
  id: string
  anonName: string
  createdAt: string
  stats: {
    posts: number
    upvotes: number
    socialScore: number
  }
}

interface CommentData {
  id: number
  content: string
  createdAt: string
  post: {
    id: number
    role: string
    companyName: string
  }
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, isLoaded: userLoaded } = useUser()
  const id = params?.id as string
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')

  const isOwnProfile = currentUser?.id === id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${id}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProfile()
  }, [id])

  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true)
      try {
        const res = await fetch(`/api/users/${id}/comments`)
        if (res.ok) {
          const data = await res.json()
          setComments(data.comments || [])
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err)
      } finally {
        setCommentsLoading(false)
      }
    }

    if (id && activeTab === 'comments' && comments.length === 0) {
      fetchComments()
    }
  }, [id, activeTab, comments.length])

  if (loading) return <div className="min-h-screen bg-transparent" />

  return (
    <div className="min-h-screen relative">
      <div
        className="gradient-orb w-[600px] h-[600px] top-[-300px] right-[-100px]"
        style={{ background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)' }}
      />

      <Navbar feed="global" onFeedChange={() => { }} onCreatePost={() => { }} />

      <main className="pt-[80px] pb-20 px-4">
        <div className="max-w-[680px] mx-auto">
          <BackButton className="mb-6" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative glass-premium rounded-3xl border border-white/10 shadow-2xl overflow-hidden mb-8"
          >
            <div className="h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />

            <div className="px-6 pb-6">
              <div className="flex justify-between items-end -translate-y-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-zinc-900 border-4 border-black flex items-center justify-center text-white/20 overflow-hidden shadow-xl">
                    <UserIcon size={40} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 border-2 border-black" />
                </div>

                <div className="flex gap-2">
                  {isOwnProfile && (
                    <SignOutButton>
                      <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all">
                        <LogOut size={16} />
                      </button>
                    </SignOutButton>
                  )}
                </div>
              </div>

              <div className="mt-[-20px] mb-6">
                <h1 className="text-2xl font-display font-800 text-white flex items-center gap-2">
                  {profile?.anonName}
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40 font-mono uppercase tracking-tighter">
                    {id.slice(0, 8)}
                  </span>
                </h1>
                <div className="flex items-center gap-4 mt-2 text-white/40 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>Joined {profile ? format(new Date(profile.createdAt), 'MMMM yyyy') : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>Anonymous City</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-6">
                {[
                  { label: 'Posts', value: profile?.stats.posts, icon: MessageSquare, color: 'text-indigo-400' },
                  { label: 'Upvotes', value: profile?.stats.upvotes, icon: ArrowUp, color: 'text-emerald-400' },
                  { label: 'Score', value: profile?.stats.socialScore, icon: Settings, color: 'text-amber-400' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
                    <div className={cn("flex justify-center mb-1", stat.color)}>
                      <stat.icon size={14} />
                    </div>
                    <div className="text-lg font-display font-800 text-white">{stat.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/20 font-700">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-700 uppercase tracking-widest transition-all",
                activeTab === 'posts' ? "bg-white/10 text-white shadow-sm" : "text-white/30 hover:text-white/50"
              )}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-700 uppercase tracking-widest transition-all",
                activeTab === 'comments' ? "bg-white/10 text-white shadow-sm" : "text-white/30 hover:text-white/50"
              )}
            >
              Comments
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'posts' ? (
              <motion.div
                key="posts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Feed
                  feedSlug="global"
                  authorId={id}
                  onRequireAuth={() => { }}
                  onCreatePost={() => { }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="comments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {commentsLoading ? (
                  <div className="text-center py-10 text-white/20 text-xs font-700 uppercase tracking-widest animate-pulse">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-20 text-white/20 italic text-sm">
                    No comments yet.
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="glass-premium rounded-2xl p-4 border border-white/5">
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span>Commented on</span>
                        <span className="text-indigo-400 font-800">
                          {comment.post.role} @ {comment.post.companyName}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{comment.content}</p>
                      <div className="mt-3 text-[9px] text-white/20 uppercase tracking-tighter">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
