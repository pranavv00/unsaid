import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Handle manual generation trigger
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  
  try {
    const college = await db.college.findUnique({
      where: { slug }
    })

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 })
    }

    const { generateCollegeIntelligence } = await import('@/lib/services/intelligence.service')
    const intelligence = await generateCollegeIntelligence(college.id)

    if (!intelligence) {
      return NextResponse.json({ error: 'Not enough data to generate insights' }, { status: 400 })
    }

    return NextResponse.json(intelligence)
  } catch (error) {
    console.error('Error generating intelligence:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  try {
    const college = await db.college.findUnique({
      where: { slug }
    })

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 })
    }

    // Safe way to fetch intelligence as a top-level model to bypass relation errors
    const intelligence = await (db as any).collegeIntelligence?.findUnique({
      where: { collegeId: college.id }
    })

    return NextResponse.json(intelligence || null)
  } catch (error) {
    console.error('Error fetching intelligence:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
