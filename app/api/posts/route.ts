// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { rateLimit, cooldown } from '@/lib/redis'
import { moderateContent, isTooSevere } from '@/lib/moderation'
import { generateAnonName, calculateScore } from '@/lib/scoring'
import { generateCollegeIntelligence } from '@/lib/services/intelligence.service'
import { slugify } from '@/lib/utils/slug'

const PostSchema = z.object({
  companyName: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  content: z.string().min(10).max(5000),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
  result: z.enum(['SELECTED', 'REJECTED', 'PENDING', 'WAITLISTED']).optional(),
  collegeSlug: z.string().optional(),
  type: z.enum(['INTERVIEW', 'REVIEW', 'CONFESSION']).default('INTERVIEW'),
  isGlobal: z.boolean().default(true),
  newCollegeName: z.string().max(100).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const feed = searchParams.get('feed') // 'global' or 'MIT' (slug)
  const type = searchParams.get('type') // 'INTERVIEW', 'REVIEW', etc
  const authorId = searchParams.get('authorId')
  const cursor = searchParams.get('cursor')
  const limit = 20

  const { userId: currentUserId } = await auth()

  try {
    const where: any = { isModerated: false }
    if (authorId) {
      where.userId = authorId
    } else {
      if (feed && feed !== 'global') {
        where.college = { slug: feed }
      } else if (feed === 'global') {
        where.isGlobal = true
      }
      
      if (type) {
        where.type = type.toUpperCase()
      }
    }

    // Fetch a larger set to allow for "Hot" sorting
    const posts = await db.post.findMany({
      where,
      take: 200, 
      orderBy: { id: 'desc' },
      include: {
        user: { select: { anonName: true } },
        college: { select: { id: true, name: true, slug: true } },
      },
    })

    // 1. "Hot" Sorting Logic
    const sortedPosts = [...posts].sort((a, b) => {
      const getScore = (p: any) => {
        const upvotes = p.upvotesCount || 0
        const comments = p.commentsCount || 0
        const time = new Date(p.createdAt).getTime() / 1000
        return (upvotes * 3600) + (comments * 1800) + time
      }
      return getScore(b) - getScore(a)
    })

    // 3. Paginate the sorted results
    const cursorIndex = cursor 
      ? sortedPosts.findIndex(p => p.id === parseInt(cursor)) 
      : -1
    
    const startIndex = cursorIndex === -1 ? 0 : cursorIndex + 1
    const paginatedPosts = sortedPosts.slice(startIndex, startIndex + limit)
    const hasNextPage = sortedPosts.length > startIndex + limit
    const finalPosts = paginatedPosts

    // 4. Determine which posts the current user has liked
    let likedPostIds = new Set<number>()
    if (currentUserId && finalPosts.length > 0) {
      const likes = await db.like.findMany({
        where: {
          userId: currentUserId,
          postId: { in: finalPosts.map(p => p.id) }
        },
        select: { postId: true }
      })
      likedPostIds = new Set(likes.map(l => l.postId))
    }

    // 5. Attach Intelligence Headlines
    const collegeIds = Array.from(new Set(finalPosts.map(p => p.collegeId).filter(Boolean))) as number[]
    let intelligenceMap: Record<number, { headline: string }> = {}
    
    if (collegeIds.length > 0) {
      try {
        const intelligences = await (db as any).collegeIntelligence?.findMany({
          where: { collegeId: { in: collegeIds } },
          select: { collegeId: true, headline: true }
        })
        if (intelligences) {
          intelligenceMap = intelligences.reduce((acc: any, curr: any) => ({
            ...acc,
            [curr.collegeId]: { headline: curr.headline }
          }), {})
        }
      } catch (err) {
        console.error('Failed to fetch intelligence map:', err)
      }
    }

    const enrichedPosts = finalPosts.map((p) => ({
      ...p,
      isLiked: likedPostIds.has(p.id),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      college: p.college ? {
        ...p.college,
        intelligence: intelligenceMap[p.collegeId!] || null
      } : null
    }))

    const nextCursor = hasNextPage ? enrichedPosts[enrichedPosts.length - 1].id : null

    return NextResponse.json({
      posts: enrichedPosts,
      nextCursor,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Redis Check: Throttling (5 posts per minute) & Cooldown (10 seconds)
  const rl = await rateLimit(`posts:${userId}`, 5, 60)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many posts. Slow down!' }, { status: 429 })
  }

  const cd = await cooldown(`posts:cd:${userId}`, 10)
  if (!cd.success) {
    return NextResponse.json({ error: 'Please wait before posting again.' }, { status: 429 })
  }

  let body: z.infer<typeof PostSchema>
  try {
    body = PostSchema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Moderation
  const moderation = moderateContent(body.content)
  if (moderation.severity === 'high') {
    return NextResponse.json({ error: 'Content violated community guidelines.' }, { status: 400 })
  }
  const cleanContent = moderation.clean

  // Ensure user exists
  let user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    user = await db.user.create({
      data: { id: userId, anonName: generateAnonName() },
    })
  }

  let college = null
  if (body.collegeSlug) {
    if (body.collegeSlug === 'other' && body.newCollegeName) {
      // Find or Create new college
      const slug = slugify(body.newCollegeName)
      college = await db.college.upsert({
        where: { slug },
        update: {},
        create: {
          name: body.newCollegeName,
          slug,
        }
      })
    } else {
      college = await db.college.findUnique({ where: { slug: body.collegeSlug } })
    }
  }

  const now = new Date()
  const postIsGlobal = body.isGlobal === undefined ? true : body.isGlobal
  
  // RAW SQL INSERT to bypass Prisma Engine validation
  try {
    const [insertedPost]: any = await db.$queryRawUnsafe(`
      INSERT INTO posts (
        "userId", 
        "collegeId", 
        "companyName", 
        "role", 
        "content", 
        "type", 
        "isGlobal", 
        "difficulty", 
        "result", 
        "score", 
        "isModerated",
        "upvotesCount",
        "commentsCount",
        "createdAt", 
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6::"PostType", $7, $8::"Difficulty", $9::"Result", $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, 
      userId, 
      college?.id || null, 
      body.companyName || 'Unknown', 
      body.role || 'General', 
      cleanContent, 
      body.type || 'INTERVIEW', 
      postIsGlobal, 
      body.difficulty || 'MEDIUM', 
      body.result || 'PENDING', 
      calculateScore(0, 0, now),
      false, // isModerated
      0, // upvotesCount
      0, // commentsCount
      now, 
      now
    )

    // Trigger intelligence generation in background
    if (college) {
      const [{ count }]: any = await db.$queryRawUnsafe(
        'SELECT count(*) FROM posts WHERE "collegeId" = $1', 
        college.id
      )
      const postCount = Number(count)
      if (postCount === 1 || postCount % 5 === 0) {
        generateCollegeIntelligence(college.id).catch(console.error)
      }
    }

    return NextResponse.json({
      ...insertedPost,
      user: { anonName: user?.anonName },
      college: college ? { id: college.id, name: college.name, slug: college.slug } : null,
      isLiked: false,
    })
  } catch (rawError: any) {
    console.error('Raw SQL Insert Failed:', rawError)
    throw rawError
  }
}
