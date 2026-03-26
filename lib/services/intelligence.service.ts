// lib/services/intelligence.service.ts
import { db } from '@/lib/db'
import { analyzeCollegeData } from '@/lib/ai/gemini'
import { Post } from '@prisma/client'

export async function generateCollegeIntelligence(collegeId: number) {
  const college = await db.college.findUnique({
    where: { id: collegeId },
    include: {
      posts: {
        where: { isModerated: false }, // Only analyze clean posts
        orderBy: { createdAt: 'desc' },
        take: 50, // Analyze the 50 most recent posts
      },
    },
  })

  if (!college || college.posts.length < 1) {
    console.log(`Not enough data for college ${collegeId}`)
    return null
  }

  // Aggregate data for Gemini
  const aggregatedData = college.posts
    .map((p: Post) => `[${p.type}] ${p.content} (Upvotes: ${p.upvotesCount}, Result: ${p.result}, Difficulty: ${p.difficulty})`)
    .join('\n---\n')

  const intelligence = await analyzeCollegeData(college.name, aggregatedData)

  if (!intelligence) return null

  // Save to database
  const result = await db.collegeIntelligence.upsert({
    where: { collegeId },
    update: {
      headline: intelligence.headline,
      summary: intelligence.summary,
      strengths: intelligence.strengths,
      weaknesses: intelligence.weaknesses,
      sentiment: intelligence.sentiment,
      placementInsight: intelligence.placementInsight,
      satisfactionLevel: intelligence.satisfactionLevel,
      updatedAt: new Date(),
    },
    create: {
      collegeId,
      headline: intelligence.headline,
      summary: intelligence.summary,
      strengths: intelligence.strengths,
      weaknesses: intelligence.weaknesses,
      sentiment: intelligence.sentiment,
      placementInsight: intelligence.placementInsight,
      satisfactionLevel: intelligence.satisfactionLevel,
    },
  })

  return result
}
