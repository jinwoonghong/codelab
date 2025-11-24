// Conference networking scenarios for smalltalk practice

export interface Scenario {
  id: string
  title: string
  titleKo: string
  description: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  context: string
  aiOpener: string
  suggestedTopics: string[]
  usefulPhrases: string[]
}

export const networkingScenarios: Scenario[] = [
  {
    id: 'elevator-pitch',
    title: 'Elevator Pitch',
    titleKo: '엘리베이터 피치',
    description: 'Introduce yourself and your research briefly',
    icon: '🛗',
    difficulty: 'medium',
    context: 'You\'re in an elevator with a senior researcher in your field. You have about 30 seconds.',
    aiOpener: 'Oh, I saw your name tag. Are you also attending the AI in Healthcare session?',
    suggestedTopics: [
      'Your research focus',
      'Why you chose this topic',
      'Your key findings',
    ],
    usefulPhrases: [
      'I\'m currently working on...',
      'My research focuses on...',
      'We\'ve found that...',
      'I\'m particularly interested in...',
    ],
  },
  {
    id: 'coffee-break',
    title: 'Coffee Break',
    titleKo: '커피 브레이크',
    description: 'Casual conversation during conference break',
    icon: '☕',
    difficulty: 'easy',
    context: 'You\'re standing at the coffee station during a 15-minute break. Someone approaches you.',
    aiOpener: 'Hi! Is this seat taken? This coffee is surprisingly good, isn\'t it?',
    suggestedTopics: [
      'Conference sessions',
      'Your institution',
      'Travel experiences',
      'Future plans',
    ],
    usefulPhrases: [
      'I really enjoyed the session on...',
      'Have you been to this conference before?',
      'Where are you based?',
      'What brings you here?',
    ],
  },
  {
    id: 'poster-session',
    title: 'Poster Session',
    titleKo: '포스터 세션 질문하기',
    description: 'Asking questions about someone\'s research poster',
    icon: '📊',
    difficulty: 'medium',
    context: 'You\'re interested in a poster about machine learning. The presenter notices you reading.',
    aiOpener: 'Hello! Would you like me to walk you through our findings?',
    suggestedTopics: [
      'Methodology questions',
      'Results interpretation',
      'Future applications',
      'Collaboration opportunities',
    ],
    usefulPhrases: [
      'Could you explain more about...?',
      'How did you approach...?',
      'Have you considered...?',
      'This is really relevant to my work because...',
    ],
  },
  {
    id: 'after-talk',
    title: 'After a Talk',
    titleKo: '발표 후 대화',
    description: 'Approach a speaker after their presentation',
    icon: '🎤',
    difficulty: 'hard',
    context: 'A researcher just gave an interesting talk. You want to discuss their work.',
    aiOpener: 'Thank you for coming up! Did you have any questions about the presentation?',
    suggestedTopics: [
      'Specific points from the talk',
      'Methodology clarification',
      'Potential collaboration',
      'Related research',
    ],
    usefulPhrases: [
      'I found your point about... particularly interesting.',
      'I was wondering if you could elaborate on...',
      'In my own research, we\'ve encountered similar...',
      'Have you looked into...?',
    ],
  },
  {
    id: 'networking-dinner',
    title: 'Networking Dinner',
    titleKo: '네트워킹 디너',
    description: 'Table conversation at conference dinner',
    icon: '🍽️',
    difficulty: 'easy',
    context: 'You\'re seated at a table with researchers you don\'t know at the conference dinner.',
    aiOpener: 'Hi there! I\'m Dr. Kim from Seoul National University. What field are you in?',
    suggestedTopics: [
      'Research interests',
      'Career path',
      'Conference highlights',
      'Non-work topics',
    ],
    usefulPhrases: [
      'Nice to meet you! I\'m...',
      'That sounds fascinating! How did you get into that?',
      'I\'ve heard great things about your lab.',
      'Are you enjoying the conference so far?',
    ],
  },
  {
    id: 'farewell',
    title: 'Farewell & Follow-up',
    titleKo: '작별 인사',
    description: 'End conversation and exchange contacts',
    icon: '👋',
    difficulty: 'easy',
    context: 'Your conversation is ending and you want to stay in touch.',
    aiOpener: 'It was great talking to you! I should head to the next session.',
    suggestedTopics: [
      'Exchange contacts',
      'Suggest collaboration',
      'Mention future meetings',
      'Express appreciation',
    ],
    usefulPhrases: [
      'It was great meeting you!',
      'Would you like to exchange contact information?',
      'Let\'s keep in touch!',
      'Feel free to reach out if you have any questions.',
      'I hope we can collaborate in the future.',
    ],
  },
]

export function getScenarioById(id: string): Scenario | undefined {
  return networkingScenarios.find(s => s.id === id)
}
