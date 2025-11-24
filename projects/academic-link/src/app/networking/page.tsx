'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Clock, ChevronRight } from 'lucide-react'
import { ChatInterface } from '@/components/networking/ChatInterface'
import { networkingScenarios, Scenario } from '@/data/networking-scenarios'

export default function NetworkingPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [researchTopic, setResearchTopic] = useState('')

  useEffect(() => {
    const savedTopic = localStorage.getItem('researchTopic')
    if (savedTopic) setResearchTopic(savedTopic)
  }, [])

  const getDifficultyColor = (difficulty: Scenario['difficulty']) => {
    const colors = {
      easy: 'bg-emerald-100 text-emerald-700',
      medium: 'bg-amber-100 text-amber-700',
      hard: 'bg-red-100 text-red-700',
    }
    return colors[difficulty]
  }

  const getDifficultyLabel = (difficulty: Scenario['difficulty']) => {
    const labels = {
      easy: '5 min',
      medium: '10 min',
      hard: '15 min',
    }
    return labels[difficulty]
  }

  if (selectedScenario) {
    return (
      <ChatInterface
        scenario={selectedScenario}
        researchTopic={researchTopic}
        onEnd={() => setSelectedScenario(null)}
      />
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex items-center gap-2 mb-6">
        <MessageCircle className="text-networking" size={28} />
        <h1 className="text-xl font-bold text-gray-800">Networking Mode</h1>
      </header>

      {/* Introduction */}
      <div className="bg-networking-light rounded-xl p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">Practice Conference Smalltalk</h2>
        <p className="text-sm text-gray-600">
          Select a scenario to practice real conference conversations.
          Use voice or text to respond!
        </p>
      </div>

      {/* Research Topic Notice */}
      {!researchTopic && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-700">
            Set your research topic in Settings for personalized conversations.
          </p>
        </div>
      )}

      {/* Scenario Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Choose a scenario
        </h3>

        {networkingScenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario)}
            className="w-full bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-networking hover:shadow-md transition-smooth"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{scenario.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800">{scenario.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{scenario.titleKo}</p>
                <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>~{getDifficultyLabel(scenario.difficulty)}</span>
                </div>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          </button>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Keep your responses natural and conversational</li>
          <li>• Use the hint button if you're stuck</li>
          <li>• Practice speaking with the voice input feature</li>
          <li>• Don't worry about making mistakes!</li>
        </ul>
      </div>
    </div>
  )
}
