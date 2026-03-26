// app/api/colleges/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const colleges = await db.college.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ colleges })
}
