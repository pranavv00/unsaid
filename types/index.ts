// types/index.ts
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD'
export type Result = 'SELECTED' | 'REJECTED' | 'PENDING' | 'WAITLISTED'
export type PostType = 'INTERVIEW' | 'REVIEW' | 'CONFESSION'
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'FALSE_INFO' | 'HARASSMENT' | 'OTHER'

export interface College {
  id: number
  name: string
  slug: string
  intelligence?: {
    headline: string
  } | null
}

export interface Company {
  id: number
  name: string
  collegeId?: number | null
}

export interface PostWithRelations {
  id: number
  userId: string
  user: { anonName: string }
  collegeId?: number | null
  college?: College | null
  companyId?: number | null
  company?: Company | null
  companyName: string
  role: string
  content: string
  type: PostType
  difficulty: Difficulty
  result: Result
  upvotesCount: number
  commentsCount: number
  score: number
  isLiked?: boolean
  isGlobal: boolean
  createdAt: string | Date
}

export interface CommentWithUser {
  id: number
  postId: number
  userId: string
  user: { anonName: string }
  content: string
  createdAt: string | Date
}

export type FeedFilter = 'global' | string // slug
