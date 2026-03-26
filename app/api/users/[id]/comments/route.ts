// app/api/users/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id

  try {
    const comments = await db.comment.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            role: true,
            companyName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Failed to fetch user comments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
