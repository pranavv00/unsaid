'use client'
// components/feed/Feed.tsx
import { AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import PostCard from '@/components/post/PostCard'
import PostSkeleton from '@/components/post/PostSkeleton'
import EmptyState from './EmptyState'
import { useFeed } from '@/hooks/useFeed'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { PostWithRelations } from '@/types'

interface FeedProps {
  feedSlug: string
  postType?: string
  authorId?: string
  onRequireAuth: () => void
  onCreatePost: () => void
  onNewPost?: (post: PostWithRelations) => void
}

export default function Feed({ feedSlug, postType, authorId, onRequireAuth, onCreatePost }: FeedProps) {
  const { isSignedIn } = useUser()
  const { posts, loading, loadingMore, hasMore, loadMore, prependPost } = useFeed(feedSlug, postType, authorId)
  const sentinelRef = useInfiniteScroll(loadMore, hasMore)

  useEffect(() => {
    const handleNewPost = (event: any) => {
      const newPost = event.detail
      if (newPost) {
        let shouldPrepend = false

        if (authorId) {
          // If on a profile feed, only prepend if the post belongs to this author
          if (newPost.userId === authorId) shouldPrepend = true
        } else if (feedSlug === 'global') {
          // If on global feed, prepend everything
          shouldPrepend = true
        } else if (newPost.college?.slug === feedSlug) {
          // If on specific college feed, prepend if slugs match
          shouldPrepend = true
        }

        if (shouldPrepend) {
          // If a postType filter is active, only prepend if it matches that too
          if (!postType || newPost.type === postType) {
            prependPost(newPost)
          }
        }
      }
    }

    window.addEventListener('new-post', handleNewPost as EventListener)
    return () => window.removeEventListener('new-post', handleNewPost as EventListener)
  }, [prependPost, feedSlug, postType])

  return (
    <div className="space-y-3">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
      ) : !posts || posts.length === 0 ? (
        <EmptyState onCreatePost={onCreatePost} />
      ) : (
        <AnimatePresence mode="popLayout">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              isAuthed={!!isSignedIn}
              onRequireAuth={onRequireAuth}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {loadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 size={18} className="animate-spin text-white/20" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-white/15 py-6 font-mono">
          — end of feed —
        </p>
      )}
    </div>
  )
}
