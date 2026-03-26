// app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const ReportSchema = z.object({
  postId: z.number(),
  reason: z.enum(['ABUSE', 'FAKE_INFO', 'SPAM', 'MISLEADING']),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof ReportSchema>
  try {
    body = ReportSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Check if already reported
  const existing = await db.report.findUnique({
    where: { userId_postId: { userId, postId: body.postId } },
  })

  if (existing) {
    return NextResponse.json({ error: 'Already reported.' }, { status: 400 })
  }

  await db.report.create({
    data: { userId, postId: body.postId, reason: body.reason },
  })

  // Auto-moderate if too many reports
  const reportCount = await db.report.count({ where: { postId: body.postId } })
  if (reportCount >= 3) {
    await db.post.update({
      where: { id: body.postId },
      data: { isModerated: true },
    })
  }

  return NextResponse.json({ success: true })
}
