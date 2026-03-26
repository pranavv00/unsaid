'use client'
// hooks/useFeed.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import type { PostWithRelations } from '@/types'

export function useFeed(feed: string, type?: string, authorId?: string) {
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const currentFeed = useRef(feed)
  const currentType = useRef(type)
  const currentAuthor = useRef(authorId)

  const fetchPosts = useCallback(async (cursor?: number, reset = false) => {
    if (reset) {
      setLoading(true)
      setPosts([])
      setNextCursor(null)
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({ feed })
      if (type) params.set('type', type)
      if (authorId) params.set('authorId', authorId)
      if (cursor) params.set('cursor', String(cursor))

      const res = await fetch(`/api/posts?${params}`)
      const data = await res.json()

      if (res.ok && data.posts) {
        if (reset || !cursor) {
          setPosts(data.posts)
        } else {
          setPosts((prev) => [...prev, ...data.posts])
        }
        setNextCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      } else {
        console.error('API Error:', data.message || 'Unknown error')
      }
    } catch (err) {
      console.error('Feed error:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [feed, type, authorId])

  // Reset on feed, type or author change
  useEffect(() => {
    currentFeed.current = feed
    currentType.current = type
    currentAuthor.current = authorId
    fetchPosts(undefined, true)
  }, [feed, type, authorId])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchPosts(nextCursor)
    }
  }, [loadingMore, hasMore, nextCursor, fetchPosts])

  const prependPost = useCallback((post: PostWithRelations) => {
    setPosts((prev) => [post, ...prev])
  }, [])

  return { posts, loading, loadingMore, hasMore, loadMore, prependPost }
}
