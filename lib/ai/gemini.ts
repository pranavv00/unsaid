// lib/ai/gemini.ts
import { GoogleGenAI } from '@google/genai'

export async function analyzeCollegeData(collegeName: string, data: string) {
  const apiKey = process.env.GEMINI_API_KEY || ''
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing')
    return null
  }

  // Initialize the SDK inside the function to avoid top-level side effects
  const ai = new GoogleGenAI({ apiKey })

  const prompt = `
Analyze the following student-generated content about ${collegeName}.
The content includes interview experiences, college reviews, and confessions.

Content:
${data}

Provide the response in the following JSON format:
{
  "headline": "One-line headline (highlighted, premium feel, e.g. 'Strong placements but highly competitive environment')",
  "summary": "Short paragraph summary (2-3 lines)",
  "strengths": ["bullet point 1", "bullet point 2"],
  "weaknesses": ["bullet point 1", "bullet point 2"],
  "sentiment": "Good | Average | Poor",
  "placementInsight": "Brief insight about placement quality",
  "satisfactionLevel": "Student satisfaction level (e.g., High, Moderate, Low)"
}

Important Rules:
- DO NOT rely only on reviews.
- Use ALL data sources.
- Confessions should have lower weight.
- Avoid extreme conclusions with low data.
- Ensure the headline is catchy and insightful.
`

  try {
    // New SDK uses ai.models.generateContent
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    })
    
    // In the new SDK, text is a property on the response
    const text = response.text
    if (!text) {
      console.error('Empty response from Gemini API')
      return null
    }
    
    // Extract JSON from the response text (handling potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', text)
      return null
    }
    
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return null
  }
}
