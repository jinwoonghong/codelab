'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, User, BookOpen, Trash2, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [researchTopic, setResearchTopic] = useState('')
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [practiceHistory, setPracticeHistory] = useState<any[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved settings
    const savedTopic = localStorage.getItem('researchTopic')
    const savedName = localStorage.getItem('userName')
    const savedInstitution = localStorage.getItem('userInstitution')
    const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')

    if (savedTopic) setResearchTopic(savedTopic)
    if (savedName) setName(savedName)
    if (savedInstitution) setInstitution(savedInstitution)
    setPracticeHistory(history)
  }, [])

  const handleSave = () => {
    localStorage.setItem('researchTopic', researchTopic)
    localStorage.setItem('userName', name)
    localStorage.setItem('userInstitution', institution)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your practice history?')) {
      localStorage.removeItem('practiceHistory')
      setPracticeHistory([])
    }
  }

  const researchExamples = [
    'Deep Learning for Medical Imaging',
    'Natural Language Processing',
    'Sustainable Energy Systems',
    'Quantum Computing',
    'Climate Change Modeling',
  ]

  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex items-center gap-2 mb-6">
        <Settings className="text-gray-600" size={28} />
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
      </header>

      {/* Profile Section */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          <User size={16} />
          Profile
        </h2>

        <div className="space-y-4 bg-white rounded-xl border border-gray-100 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dr. Kim"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g., Seoul National University"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Research Topic Section */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          <BookOpen size={16} />
          Research Topic
        </h2>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Research Area
          </label>
          <input
            type="text"
            value={researchTopic}
            onChange={(e) => setResearchTopic(e.target.value)}
            placeholder="e.g., Deep Learning for Medical Imaging"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
          />

          <p className="text-xs text-gray-500 mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {researchExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => setResearchTopic(example)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-smooth"
              >
                {example}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3">
            This will be used to personalize your practice sentences and conversations.
          </p>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-smooth mb-6
          ${saved
            ? 'bg-green-500 text-white'
            : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
      >
        {saved ? (
          <>
            <CheckCircle size={20} />
            Saved!
          </>
        ) : (
          <>
            <Save size={20} />
            Save Settings
          </>
        )}
      </button>

      {/* Practice Stats */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Practice Statistics
        </h2>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-academic-light rounded-lg">
              <p className="text-2xl font-bold text-academic">{practiceHistory.length}</p>
              <p className="text-xs text-gray-500">Sentences Practiced</p>
            </div>
            <div className="text-center p-3 bg-networking-light rounded-lg">
              <p className="text-2xl font-bold text-networking">
                {Math.floor(practiceHistory.length / 3)}
              </p>
              <p className="text-xs text-gray-500">Days Active</p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="w-full py-2 text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear Practice History
          </button>
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          About
        </h2>

        <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-2">Academic Link v0.1.0</p>
          <p>
            A mobile web app designed to help researchers practice academic English
            writing and conference networking skills.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Based on Manchester Academic Phrasebank patterns.
          </p>
        </div>
      </section>
    </div>
  )
}
