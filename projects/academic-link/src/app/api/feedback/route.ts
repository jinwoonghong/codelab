import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client - will use OPENAI_API_KEY env variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt for academic writing feedback
const ACADEMIC_FEEDBACK_PROMPT = `You are an expert academic English writing tutor specializing in helping non-native English speakers improve their academic writing.

Your role is to:
1. Check grammatical correctness of the submitted academic sentence
2. Evaluate if the vocabulary and phrasing is appropriate for academic writing
3. Suggest improvements while maintaining the original meaning
4. Be encouraging but honest about areas for improvement

Guidelines:
- Focus on academic tone and clarity
- Suggest more precise or formal vocabulary where appropriate
- Keep suggestions practical and easy to understand
- If the sentence is already good, acknowledge it and maybe suggest one minor enhancement

Respond in JSON format only:
{
  "isCorrect": boolean,
  "correctedSentence": "improved version of the sentence",
  "suggestions": ["list of 2-3 specific tips"]
}`

export async function POST(request: NextRequest) {
  try {
    const { originalTemplate, completedSentence, researchTopic } = await request.json()

    if (!completedSentence) {
      return NextResponse.json(
        { error: 'Missing completed sentence' },
        { status: 400 }
      )
    }

    // If no API key, return mock feedback
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(mockFeedback(completedSentence))
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model
      messages: [
        { role: 'system', content: ACADEMIC_FEEDBACK_PROMPT },
        {
          role: 'user',
          content: `Original template: "${originalTemplate}"
Research topic context: ${researchTopic || 'General academic'}
Completed sentence: "${completedSentence}"

Please evaluate this academic sentence and provide feedback.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseText = completion.choices[0].message.content
    const feedback = JSON.parse(responseText || '{}')

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Feedback API error:', error)

    // Return mock feedback on error
    return NextResponse.json(mockFeedback(''))
  }
}

// Mock feedback for when API is not available
function mockFeedback(sentence: string) {
  const isGood = sentence.length > 30 && sentence.includes(' ')

  if (isGood) {
    return {
      isCorrect: true,
      correctedSentence: sentence,
      suggestions: [
        'Consider using more specific terminology for your field',
        'The sentence structure is clear and academic',
      ],
    }
  }

  return {
    isCorrect: false,
    correctedSentence: sentence + ' (Consider adding more detail)',
    suggestions: [
      'Try to be more specific about your research focus',
      'Consider adding quantifiable details if applicable',
      'Use active voice for clearer academic writing',
    ],
  }
}
