// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { rateLimit, cooldown } from '@/lib/redis'
import { moderateContent, isTooSevere } from '@/lib/moderation'
import { calculateScore, generateAnonName } from '@/lib/scoring'

const CommentSchema = z.object({
  postId: z.number(),
  content: z.string().min(1).max(1000),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId = parseInt(searchParams.get('postId') || '0')

  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
  }

  const comments = await db.comment.findMany({
    where: { postId },
    include: { user: { select: { anonName: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    comments: comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 30 comments/day
  const daily = await rateLimit(`comments:${userId}`, 30, 86400)
  if (!daily.success) {
    return NextResponse.json({ error: 'Daily comment limit reached.' }, { status: 429 })
  }

  // Cooldown: 30 seconds
  const cd = await cooldown(`comment-cd:${userId}`, 30)
  if (!cd.success) {
    return NextResponse.json(
      { error: `Please wait ${cd.waitSeconds}s before commenting again.` },
      { status: 429 }
    )
  }

  let body: z.infer<typeof CommentSchema>
  try {
    body = CommentSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (isTooSevere(body.content)) {
    return NextResponse.json({ error: 'Inappropriate content.' }, { status: 400 })
  }

  const { clean } = moderateContent(body.content)

  // Ensure user exists
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    await db.user.create({
      data: { id: userId, anonName: generateAnonName() },
    })
  }

  const comment = await db.comment.create({
    data: { postId: body.postId, userId, content: clean },
    include: { user: { select: { anonName: true } } },
  })

  // Update post comment count + recalculate score
  const post = await db.post.update({
    where: { id: body.postId },
    data: {
      commentsCount: { increment: 1 },
    },
    select: { upvotesCount: true, commentsCount: true, createdAt: true },
  })

  await db.post.update({
    where: { id: body.postId },
    data: {
      score: calculateScore(post.upvotesCount, post.commentsCount, post.createdAt),
    },
  })

  return NextResponse.json({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  })
}
