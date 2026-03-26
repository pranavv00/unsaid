// app/api/likes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { calculateScore, generateAnonName } from '@/lib/scoring'

const LikeSchema = z.object({ postId: z.number() })

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof LikeSchema>
  try {
    body = LikeSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Ensure user exists (Upsert is race-safe)
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, anonName: generateAnonName() },
  })

  // Toggle like (Delete is NOT race-safe if record is gone, deleteMany is safe)
  const existing = await db.like.findUnique({
    where: { userId_postId: { userId, postId: body.postId } },
  })

  let liked: boolean

  if (existing) {
    try {
      await db.like.delete({ where: { id: existing.id } })
      liked = false
    } catch {
      // Record might have been deleted by another request
      liked = false
    }
  } else {
    try {
      await db.like.create({ data: { userId, postId: body.postId } })
      liked = true
    } catch {
      // Record might have been created by another request
      liked = true
    }
  }

  // Update upvote count + score
  const post = await db.post.update({
    where: { id: body.postId },
    data: {
      upvotesCount: { increment: liked ? 1 : -1 },
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
    liked,
    upvotesCount: post.upvotesCount,
  })
}
