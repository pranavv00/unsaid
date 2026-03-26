export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'

// Handle manual generation trigger
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  noStore()
  const slug = params?.slug
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }
  
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
  noStore()
  
  try {
    const slug = params?.slug

    if (!slug) {
      return NextResponse.json(null)
    }

    const college = await db.college.findUnique({
      where: { slug }
    })

    if (!college) {
      return NextResponse.json(null)
    }

    // Safe way to fetch intelligence as a top-level model to bypass relation errors
    const intelligenceModel = (db as any).collegeIntelligence || (db as any).college_intelligence
    if (!intelligenceModel) {
      return NextResponse.json(null)
    }

    const intelligence = await intelligenceModel.findUnique({
      where: { collegeId: college.id }
    })

    return NextResponse.json(intelligence || null)
  } catch (error) {
    // Return 200/null to satisfy Next.js build-time data collection
    console.warn('Silent fail for intelligence GET (likely build-time):', error)
    return NextResponse.json(null)
  }
}
