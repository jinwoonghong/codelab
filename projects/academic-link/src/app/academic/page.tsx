'use client'

import { useState, useEffect } from 'react'
import { BookOpen, RefreshCw, Award } from 'lucide-react'
import { SlotFillCard } from '@/components/academic/SlotFillCard'
import { getDailyTemplates, AcademicTemplate, academicTemplates, getTemplatesByCategory } from '@/data/academic-templates'

type CategoryFilter = 'all' | 'introduction' | 'methodology' | 'results' | 'discussion' | 'conclusion'

export default function AcademicPage() {
  const [templates, setTemplates] = useState<AcademicTemplate[]>([])
  const [completedCount, setCompletedCount] = useState(0)
  const [researchTopic, setResearchTopic] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  useEffect(() => {
    // Load saved research topic
    const savedTopic = localStorage.getItem('researchTopic')
    if (savedTopic) setResearchTopic(savedTopic)

    // Load daily templates
    loadTemplates()
  }, [])

  const loadTemplates = (category: CategoryFilter = 'all') => {
    if (category === 'all') {
      setTemplates(getDailyTemplates(3))
    } else {
      const filtered = getTemplatesByCategory(category)
      setTemplates(filtered.slice(0, 3))
    }
    setCompletedCount(0)
  }

  const handleCategoryChange = (category: CategoryFilter) => {
    setCategoryFilter(category)
    loadTemplates(category)
  }

  const handleRefresh = () => {
    loadTemplates(categoryFilter)
  }

  const handleComplete = (completedSentence: string) => {
    setCompletedCount(prev => prev + 1)

    // Save to practice history
    const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
    history.push({
      date: new Date().toISOString(),
      sentence: completedSentence,
    })
    localStorage.setItem('practiceHistory', JSON.stringify(history.slice(-50)))
  }

  const categories: { value: CategoryFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'introduction', label: 'Intro' },
    { value: 'methodology', label: 'Method' },
    { value: 'results', label: 'Results' },
    { value: 'discussion', label: 'Discuss' },
    { value: 'conclusion', label: 'Conclude' },
  ]

  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="text-academic" size={28} />
          <h1 className="text-xl font-bold text-gray-800">Academic Mode</h1>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-gray-100 transition-smooth"
          title="New templates"
        >
          <RefreshCw size={20} className="text-gray-500" />
        </button>
      </header>

      {/* Research Topic Notice */}
      {!researchTopic && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-700">
            Set your research topic in Settings for personalized practice.
          </p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-academic-light rounded-lg">
        <Award className="text-academic" size={24} />
        <div>
          <p className="text-sm font-medium text-gray-700">Today's Progress</p>
          <p className="text-lg font-bold text-academic">{completedCount} / {templates.length} completed</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-smooth
              ${categoryFilter === cat.value
                ? 'bg-academic text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Daily Mission Label */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Daily Practice - Fill in the blanks
        </h2>
      </div>

      {/* Template Cards */}
      <div className="space-y-4">
        {templates.map((template, index) => (
          <SlotFillCard
            key={`${template.id}-${index}`}
            template={template}
            researchTopic={researchTopic}
            onComplete={handleComplete}
          />
        ))}
      </div>

      {/* Completion Message */}
      {completedCount === templates.length && templates.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
          <Award className="mx-auto mb-2 text-green-600" size={40} />
          <h3 className="font-bold text-green-700 mb-1">Excellent Work!</h3>
          <p className="text-sm text-green-600">
            You've completed today's academic writing practice.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-smooth"
          >
            Practice More
          </button>
        </div>
      )}
    </div>
  )
}
