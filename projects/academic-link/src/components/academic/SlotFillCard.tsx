'use client'

import { useState, useEffect } from 'react'
import { AcademicTemplate } from '@/data/academic-templates'
import { Send, Lightbulb, CheckCircle, Loader2 } from 'lucide-react'

interface SlotFillCardProps {
  template: AcademicTemplate
  researchTopic: string
  onComplete: (completedSentence: string, feedback: FeedbackResult | null) => void
}

interface FeedbackResult {
  correctedSentence: string
  suggestions: string[]
  isCorrect: boolean
}

export function SlotFillCard({ template, researchTopic, onComplete }: SlotFillCardProps) {
  const [slotValues, setSlotValues] = useState<Record<string, string>>({})
  const [showExample, setShowExample] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)

  // Initialize slot values
  useEffect(() => {
    const initial: Record<string, string> = {}
    template.slots.forEach(slot => {
      initial[slot] = ''
    })
    setSlotValues(initial)
    setFeedback(null)
  }, [template])

  const handleSlotChange = (slot: string, value: string) => {
    setSlotValues(prev => ({ ...prev, [slot]: value }))
  }

  const getCompletedSentence = (): string => {
    let sentence = template.template
    template.slots.forEach(slot => {
      sentence = sentence.replace(`[${slot}]`, slotValues[slot] || `[${slot}]`)
    })
    return sentence
  }

  const isAllFilled = template.slots.every(slot => slotValues[slot]?.trim())

  const handleSubmit = async () => {
    if (!isAllFilled) return

    setIsSubmitting(true)
    const completedSentence = getCompletedSentence()

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTemplate: template.template,
          completedSentence,
          researchTopic,
        }),
      })

      if (response.ok) {
        const result: FeedbackResult = await response.json()
        setFeedback(result)
        onComplete(completedSentence, result)
      } else {
        // Fallback if API fails
        onComplete(completedSentence, null)
      }
    } catch (error) {
      console.error('Failed to get feedback:', error)
      onComplete(completedSentence, null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Parse template and render with input fields
  const renderTemplate = () => {
    const parts = template.template.split(/(\[[^\]]+\])/)

    return parts.map((part, index) => {
      const slotMatch = part.match(/\[([^\]]+)\]/)

      if (slotMatch) {
        const slotName = slotMatch[1]
        return (
          <input
            key={index}
            type="text"
            className="slot-input mx-1 rounded"
            placeholder={slotName}
            value={slotValues[slotName] || ''}
            onChange={(e) => handleSlotChange(slotName, e.target.value)}
            style={{ width: Math.max(100, (slotValues[slotName]?.length || slotName.length) * 10) }}
          />
        )
      }

      return <span key={index}>{part}</span>
    })
  }

  const getCategoryColor = () => {
    const colors = {
      introduction: 'bg-blue-100 text-blue-700',
      methodology: 'bg-green-100 text-green-700',
      results: 'bg-orange-100 text-orange-700',
      discussion: 'bg-purple-100 text-purple-700',
      conclusion: 'bg-pink-100 text-pink-700',
    }
    return colors[template.category]
  }

  const getDifficultyColor = () => {
    const colors = {
      beginner: 'bg-emerald-100 text-emerald-700',
      intermediate: 'bg-amber-100 text-amber-700',
      advanced: 'bg-red-100 text-red-700',
    }
    return colors[template.difficulty]
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* Category & Difficulty Tags */}
      <div className="flex gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor()}`}>
          {template.category}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor()}`}>
          {template.difficulty}
        </span>
      </div>

      {/* Template with slots */}
      <div className="text-lg leading-relaxed mb-4 text-gray-800">
        {renderTemplate()}
      </div>

      {/* Example toggle */}
      <button
        onClick={() => setShowExample(!showExample)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-3"
      >
        <Lightbulb size={16} />
        {showExample ? 'Hide example' : 'Show example'}
      </button>

      {showExample && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 italic">
          "{template.example}"
        </div>
      )}

      {/* Feedback Section */}
      {feedback && (
        <div className={`rounded-lg p-4 mb-4 ${feedback.isCorrect ? 'bg-green-50' : 'bg-amber-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className={feedback.isCorrect ? 'text-green-600' : 'text-amber-600'} />
            <span className={`font-medium ${feedback.isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
              {feedback.isCorrect ? 'Great job!' : 'Suggestions for improvement'}
            </span>
          </div>

          {!feedback.isCorrect && (
            <>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Better version:</strong> {feedback.correctedSentence}
              </p>
              <div className="text-sm text-gray-600">
                <strong>Tips:</strong>
                <ul className="list-disc ml-4 mt-1">
                  {feedback.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isAllFilled || isSubmitting}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-smooth
          ${isAllFilled && !isSubmitting
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <Send size={20} />
            Submit for feedback
          </>
        )}
      </button>
    </div>
  )
}
