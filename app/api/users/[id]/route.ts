// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        anonName: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            likes: true,
          }
        }
      }
    })

    // Fetch total upvotes sum across all user posts
    const upvotesAggregate = await db.post.aggregate({
      where: { userId },
      _sum: { upvotesCount: true }
    })

    const totalUpvotes = upvotesAggregate._sum.upvotesCount || 0
    const postCount = user?._count.posts || 0
    const socialScore = (postCount * 10) + (totalUpvotes * 5)

    if (!user) {
      return NextResponse.json({ 
        id: userId,
        anonName: 'Anonymous Learner', 
        createdAt: new Date().toISOString(),
        stats: {
          posts: 0,
          upvotes: 0,
          socialScore: 0
        }
      })
    }

    return NextResponse.json({
      ...user,
      stats: {
        posts: postCount,
        upvotes: totalUpvotes,
        socialScore
      }
    })
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
