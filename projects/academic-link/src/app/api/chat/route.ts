import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Scenario } from '@/data/networking-scenarios'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt for networking conversation
function getNetworkingSystemPrompt(scenario: Scenario, researchTopic: string): string {
  return `You are a friendly researcher at an academic conference engaging in a ${scenario.title} conversation.

Context: ${scenario.context}

Your conversation partner is a researcher specializing in: ${researchTopic || 'academic research'}

Conversation guidelines:
1. Keep responses natural, friendly, and conversational (2-3 sentences max)
2. Show genuine interest in their research
3. Ask follow-up questions to keep the conversation flowing
4. Use appropriate academic small talk patterns
5. Match the formality level to the scenario (${scenario.difficulty})
6. Occasionally share relatable academic experiences

Useful phrases for this scenario:
${scenario.usefulPhrases.map(p => `- "${p}"`).join('\n')}

Remember:
- Be warm and approachable
- Don't lecture or be overly formal
- Natural conversation flow is more important than perfect grammar
- Help the user practice real-world conference networking`
}

// System prompt for generating hints
function getHintSystemPrompt(scenario: Scenario): string {
  return `You are helping someone practice conference networking conversations.

Current scenario: ${scenario.title}
Context: ${scenario.context}

Generate 3 natural, contextually appropriate response options the user could say.
Each hint should:
- Be a complete, natural sentence or two
- Fit the conversational context
- Range from simple to more engaging

Respond in JSON format only:
{
  "hints": ["hint 1", "hint 2", "hint 3"]
}`
}

export async function POST(request: NextRequest) {
  try {
    const { messages, scenario, researchTopic, requestHints } = await request.json()

    if (!scenario) {
      return NextResponse.json(
        { error: 'Missing scenario' },
        { status: 400 }
      )
    }

    // If no API key, return mock responses
    if (!process.env.OPENAI_API_KEY) {
      if (requestHints) {
        return NextResponse.json({
          hints: scenario.usefulPhrases.slice(0, 3),
        })
      }
      return NextResponse.json({
        reply: getMockReply(messages, scenario),
      })
    }

    // Handle hint requests
    if (requestHints) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: getHintSystemPrompt(scenario) },
          {
            role: 'user',
            content: `Last message in conversation: "${messages[messages.length - 1]?.content || scenario.aiOpener}"

Generate 3 appropriate response hints.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 300,
      })

      const responseText = completion.choices[0].message.content
      const hintsData = JSON.parse(responseText || '{"hints": []}')

      return NextResponse.json(hintsData)
    }

    // Regular conversation
    const conversationHistory = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: getNetworkingSystemPrompt(scenario, researchTopic) },
        ...conversationHistory,
      ],
      temperature: 0.8,
      max_tokens: 200,
    })

    const reply = completion.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)

    return NextResponse.json({
      reply: "That's interesting! Tell me more about your research. What drew you to this field?",
    })
  }
}

// Mock replies for when API is not available
function getMockReply(messages: any[], scenario: Scenario): string {
  const messageCount = messages.length

  const mockResponses: Record<string, string[]> = {
    'elevator-pitch': [
      "That sounds fascinating! How long have you been working on this?",
      "Interesting approach! Have you published any papers on this topic?",
      "I'd love to hear more about your methodology. Maybe we can connect after the session?",
    ],
    'coffee-break': [
      "Nice to meet you! What session are you most looking forward to?",
      "That's great! I'm always interested in how different fields approach similar problems.",
      "Would you like to grab a coffee? I'd love to hear more about your work.",
    ],
    'poster-session': [
      "Great question! We found some surprising results in that area.",
      "That's exactly what we're exploring in our next phase of research.",
      "I'd be happy to share our dataset with you if you're interested in collaborating.",
    ],
    'after-talk': [
      "Thank you for your interest! Yes, that's one of the key findings we're excited about.",
      "We actually struggled with that challenge initially. Would you like to know how we solved it?",
      "Your perspective is valuable. Are you working on something similar?",
    ],
    'networking-dinner': [
      "What a coincidence! I've read some papers from your lab. Great work!",
      "The food is pretty good here, isn't it? So what brings you to this conference?",
      "I've always been curious about that field. How did you get started?",
    ],
    'farewell': [
      "Absolutely! Here's my card. Let's definitely stay in touch!",
      "It was wonderful meeting you too! I'll send you an email with those papers I mentioned.",
      "Safe travels! Looking forward to seeing you at the next conference!",
    ],
  }

  const responses = mockResponses[scenario.id] || [
    "That's very interesting! Tell me more.",
    "I see what you mean. What's your next step?",
    "Great point! I hadn't thought of it that way.",
  ]

  return responses[messageCount % responses.length]
}
