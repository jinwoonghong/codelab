'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Lightbulb, Loader2, X } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { Scenario } from '@/data/networking-scenarios'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  scenario: Scenario
  researchTopic: string
  onEnd: () => void
}

export function ChatInterface({ scenario, researchTopic, onEnd }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [hints, setHints] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()

  // Initialize with AI opener
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: scenario.aiOpener,
      },
    ])
  }, [scenario])

  // Update input when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    resetTranscript()
    setIsLoading(true)
    setShowHints(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          scenario: scenario,
          researchTopic,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
        }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Failed to get response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHintRequest = async () => {
    if (showHints) {
      setShowHints(false)
      return
    }

    setShowHints(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          scenario,
          researchTopic,
          requestHints: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setHints(data.hints || scenario.usefulPhrases.slice(0, 3))
      }
    } catch {
      setHints(scenario.usefulPhrases.slice(0, 3))
    }
  }

  const handleHintSelect = (hint: string) => {
    setInput(hint)
    setShowHints(false)
    inputRef.current?.focus()
  }

  const toggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-networking-light p-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">{scenario.icon}</span>
              {scenario.title}
            </h2>
            <p className="text-xs text-gray-500 mt-1">{scenario.context}</p>
          </div>
          <button
            onClick={onEnd}
            className="p-2 rounded-full hover:bg-purple-100 transition-smooth"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-ai">
              <Loader2 size={16} className="animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Hints Panel */}
      {showHints && (
        <div className="border-t border-gray-100 bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">Suggested responses:</p>
          <div className="space-y-2">
            {hints.length > 0 ? hints.map((hint, index) => (
              <button
                key={index}
                onClick={() => handleHintSelect(hint)}
                className="hint-card block w-full text-left p-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-networking hover:bg-networking-light transition-smooth"
              >
                {hint}
              </button>
            )) : scenario.usefulPhrases.slice(0, 3).map((phrase, index) => (
              <button
                key={index}
                onClick={() => handleHintSelect(phrase)}
                className="hint-card block w-full text-left p-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-networking hover:bg-networking-light transition-smooth"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center gap-2">
          {/* Hint Button */}
          <button
            onClick={handleHintRequest}
            className={`p-3 rounded-full transition-smooth ${
              showHints ? 'bg-networking text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title="Get hints"
          >
            <Lightbulb size={20} />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-networking focus:bg-white transition-smooth"
          />

          {/* Voice Input Button */}
          {speechSupported && (
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-smooth ${
                isListening
                  ? 'bg-red-500 text-white recording-pulse'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop recording' : 'Voice input'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-smooth ${
              input.trim() && !isLoading
                ? 'bg-networking text-white hover:bg-networking-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>

        {isListening && (
          <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
            🎤 Listening... Speak now
          </p>
        )}
      </div>
    </div>
  )
}
