'use client'
// components/post/PostCard.tsx
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUp, MessageSquare, Flag, Building2, GraduationCap, Clock, User } from 'lucide-react'
import { format } from 'timeago.js'
import { cn, DIFFICULTY_COLORS, DIFFICULTY_LABELS, RESULT_COLORS, RESULT_LABELS, formatCount, getAuthorColors } from '@/lib/utils'
import type { PostWithRelations } from '@/types'
import ReportModal from './ReportModal'

interface PostCardProps {
  post: PostWithRelations
  onRequireAuth: () => void
  isAuthed: boolean
  index?: number
}

export default function PostCard({ post, onRequireAuth, isAuthed, index = 0 }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false)
  const [upvotes, setUpvotes] = useState(post.upvotesCount)
  const [likeAnimating, setLikeAnimating] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const authorColors = getAuthorColors(post.user.anonName)

  const contentPreview = post.content.length > 280 && !expanded
    ? post.content.slice(0, 280) + '…'
    : post.content

  const handleLike = useCallback(async () => {
    if (!isAuthed) { onRequireAuth(); return }
    setLikeAnimating(true)
    const newLiked = !liked
    setLiked(newLiked)
    setUpvotes((prev) => prev + (newLiked ? 1 : -1))
    setTimeout(() => setLikeAnimating(false), 300)

    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
    } catch {
      setLiked(!newLiked)
      setUpvotes((prev) => prev + (newLiked ? -1 : 1))
    }
  }, [liked, isAuthed, onRequireAuth, post.id])

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
        className="card p-5 group cursor-default"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Type/Company Icon */}
            <div className={cn(
              "w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:border-white/20 transition-colors",
              authorColors.bg,
              authorColors.border
            )}>
              {post.type === 'CONFESSION' ? (
                <User size={18} className={authorColors.text} />
              ) : post.type === 'REVIEW' ? (
                <User size={18} className={authorColors.text} />
              ) : (
                <Building2 size={16} className={authorColors.text} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {post.type === 'CONFESSION' ? (
                  <span className={cn("font-display font-700 text-[15px] leading-tight", authorColors.text)}>
                    {post.user.anonName}
                  </span>
                ) : post.type === 'REVIEW' ? (
                  <span className={cn("font-display font-700 text-[15px] leading-tight", authorColors.text)}>
                    {post.user.anonName}
                  </span>
                ) : (
                  <>
                    <span className={cn("font-display font-600 text-[15px] leading-tight", authorColors.text)}>
                      {post.user.anonName}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-sm text-white/60 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                      {post.companyName === 'Unknown' ? 'General' : post.companyName}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {post.college && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-white/20 uppercase font-800 tracking-tighter shrink-0">
                      {post.type === 'CONFESSION' ? 'Confessed from' :
                        post.type === 'REVIEW' ? 'Reviewed at' :
                          'Interviewed at'}
                    </span>
                    <Link
                      href={`/feed/${post.college.slug}`}
                      className="flex items-center gap-1 text-xs text-accent/80 hover:text-accent transition-colors font-700 underline decoration-white/10 underline-offset-2"
                    >
                      {post.college.name}
                    </Link>
                  </div>
                )}
                {post.college?.intelligence?.headline && (
                  <>
                    <span className="text-white/20 text-xs">→</span>
                    <span className="text-[10px] sm:text-xs font-800 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic opacity-90">
                      {post.college.intelligence.headline}
                    </span>
                  </>
                )}
                <span className="text-white/20 text-xs">·</span>
                <span className="text-xs text-white/30 flex items-center gap-1 font-medium">
                  <Clock size={10} className="opacity-50" />
                  {format(new Date(post.createdAt))}
                </span>
              </div>
            </div>
          </div>

          {/* Right badges */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-amber-500/60 font-900 uppercase tracking-tighter bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/15">
                🔒 Anonymous
              </span>
              <span className={cn(
                'text-[9px] font-900 px-1.5 py-0.5 rounded border uppercase tracking-tighter shadow-sm',
                post.type === 'INTERVIEW' ? 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5' :
                  post.type === 'REVIEW' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                    'text-purple-400 border-purple-400/20 bg-purple-400/5'
              )}>
                {post.type}
              </span>
            </div>
            {post.type === 'INTERVIEW' && (
              <div className="flex items-center gap-1">
                <span className={cn('text-[9px] font-800 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-white/5', RESULT_COLORS[post.result])}>
                  {RESULT_LABELS[post.result]}
                </span>
                <span className={cn('text-[9px] font-800 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-white/5', DIFFICULTY_COLORS[post.difficulty])}>
                  {DIFFICULTY_LABELS[post.difficulty]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="ml-12 mb-4">
          <p className="text-[14px] text-white/75 leading-relaxed whitespace-pre-wrap">
            {contentPreview}
          </p>
          {post.content.length > 280 && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-accent/70 hover:text-accent mt-1 transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Footer actions */}
        <div className="ml-12 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Upvote */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                liked
                  ? 'bg-accent/15 text-accent'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
              )}
            >
              <motion.div animate={likeAnimating ? { scale: [1, 1.5, 1] } : {}}>
                <ArrowUp size={13} />
              </motion.div>
              <span>{formatCount(upvotes)}</span>
            </motion.button>

            {/* Comments */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200">
              <MessageSquare size={13} />
              <span>{formatCount(post.commentsCount)}</span>
            </button>
          </div>

          {/* Report */}
          <button
            onClick={() => {
              if (!isAuthed) { onRequireAuth(); return }
              setShowReport(true)
            }}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400/70 hover:bg-red-400/[0.08] transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <Flag size={12} />
          </button>
        </div>
      </motion.article>

      {showReport && (
        <ReportModal
          postId={post.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  )
}
