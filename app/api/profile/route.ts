// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tab = searchParams.get('tab') || 'posts'

  if (tab === 'posts') {
    const posts = await db.post.findMany({
      where: { userId },
      include: {
        user: { select: { anonName: true } },
        college: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      posts: posts.map((p) => ({
        ...p,
        isLiked: false,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    })
  }

  if (tab === 'comments') {
    const comments = await db.comment.findMany({
      where: { userId },
      include: {
        user: { select: { anonName: true } },
        post: { select: { id: true, companyName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      comments: comments.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    })
  }

  if (tab === 'likes') {
    const likes = await db.like.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: { select: { anonName: true } },
            college: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      posts: likes.map((l) => ({
        ...l.post,
        isLiked: true,
        createdAt: l.post.createdAt.toISOString(),
        updatedAt: l.post.updatedAt.toISOString(),
      })),
    })
  }

  return NextResponse.json({ error: 'Invalid tab' }, { status: 400 })
}
