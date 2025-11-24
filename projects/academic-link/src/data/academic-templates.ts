// Manchester Academic Phrasebank inspired templates
// Organized by academic writing sections

export interface AcademicTemplate {
  id: string
  category: 'introduction' | 'methodology' | 'results' | 'discussion' | 'conclusion'
  template: string
  slots: string[]
  example: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const academicTemplates: AcademicTemplate[] = [
  // Introduction Section
  {
    id: 'intro-1',
    category: 'introduction',
    template: 'The purpose of this study is to [verb] [object].',
    slots: ['verb', 'object'],
    example: 'The purpose of this study is to investigate the effects of caffeine on sleep quality.',
    difficulty: 'beginner',
  },
  {
    id: 'intro-2',
    category: 'introduction',
    template: 'This paper examines the relationship between [factor A] and [factor B].',
    slots: ['factor A', 'factor B'],
    example: 'This paper examines the relationship between social media usage and mental health.',
    difficulty: 'beginner',
  },
  {
    id: 'intro-3',
    category: 'introduction',
    template: 'Recent studies have shown that [finding], however, [gap in research].',
    slots: ['finding', 'gap in research'],
    example: 'Recent studies have shown that deep learning improves accuracy, however, interpretability remains limited.',
    difficulty: 'intermediate',
  },
  {
    id: 'intro-4',
    category: 'introduction',
    template: 'In recent years, there has been an increasing interest in [topic].',
    slots: ['topic'],
    example: 'In recent years, there has been an increasing interest in sustainable energy solutions.',
    difficulty: 'beginner',
  },
  {
    id: 'intro-5',
    category: 'introduction',
    template: 'Despite its importance, [topic] has received relatively little attention in [field].',
    slots: ['topic', 'field'],
    example: 'Despite its importance, data privacy has received relatively little attention in healthcare AI.',
    difficulty: 'intermediate',
  },

  // Methodology Section
  {
    id: 'method-1',
    category: 'methodology',
    template: 'Data was collected through [method] over a period of [duration].',
    slots: ['method', 'duration'],
    example: 'Data was collected through online surveys over a period of six months.',
    difficulty: 'beginner',
  },
  {
    id: 'method-2',
    category: 'methodology',
    template: 'The sample consisted of [number] [participants] who were selected using [sampling method].',
    slots: ['number', 'participants', 'sampling method'],
    example: 'The sample consisted of 150 undergraduate students who were selected using stratified random sampling.',
    difficulty: 'intermediate',
  },
  {
    id: 'method-3',
    category: 'methodology',
    template: 'To address this question, we employed [methodology] based on [framework/theory].',
    slots: ['methodology', 'framework/theory'],
    example: 'To address this question, we employed mixed methods research based on grounded theory.',
    difficulty: 'advanced',
  },
  {
    id: 'method-4',
    category: 'methodology',
    template: 'The experiment was conducted under [conditions] to ensure [objective].',
    slots: ['conditions', 'objective'],
    example: 'The experiment was conducted under controlled laboratory conditions to ensure reproducibility.',
    difficulty: 'intermediate',
  },

  // Results Section
  {
    id: 'results-1',
    category: 'results',
    template: 'The results indicate that [finding] with statistical significance (p < [value]).',
    slots: ['finding', 'value'],
    example: 'The results indicate that treatment A outperformed treatment B with statistical significance (p < 0.05).',
    difficulty: 'intermediate',
  },
  {
    id: 'results-2',
    category: 'results',
    template: 'As shown in Figure [number], there is a [correlation type] correlation between [variable A] and [variable B].',
    slots: ['number', 'correlation type', 'variable A', 'variable B'],
    example: 'As shown in Figure 3, there is a strong positive correlation between exercise frequency and cognitive performance.',
    difficulty: 'intermediate',
  },
  {
    id: 'results-3',
    category: 'results',
    template: 'Notably, [finding] was observed in [percentage]% of the cases.',
    slots: ['finding', 'percentage'],
    example: 'Notably, significant improvement was observed in 78% of the cases.',
    difficulty: 'beginner',
  },

  // Discussion Section
  {
    id: 'discuss-1',
    category: 'discussion',
    template: 'These findings suggest that [interpretation], which aligns with [previous research].',
    slots: ['interpretation', 'previous research'],
    example: 'These findings suggest that early intervention is crucial, which aligns with Smith et al. (2020).',
    difficulty: 'intermediate',
  },
  {
    id: 'discuss-2',
    category: 'discussion',
    template: 'One possible explanation for [finding] is that [hypothesis].',
    slots: ['finding', 'hypothesis'],
    example: 'One possible explanation for the unexpected results is that participants were already familiar with the task.',
    difficulty: 'beginner',
  },
  {
    id: 'discuss-3',
    category: 'discussion',
    template: 'However, it is important to acknowledge that [limitation] may have influenced [aspect of study].',
    slots: ['limitation', 'aspect of study'],
    example: 'However, it is important to acknowledge that the small sample size may have influenced the generalizability.',
    difficulty: 'advanced',
  },

  // Conclusion Section
  {
    id: 'conclude-1',
    category: 'conclusion',
    template: 'In conclusion, this study demonstrates that [main finding] and contributes to [field] by [contribution].',
    slots: ['main finding', 'field', 'contribution'],
    example: 'In conclusion, this study demonstrates that AI can enhance diagnosis accuracy and contributes to medical imaging by providing a validated framework.',
    difficulty: 'advanced',
  },
  {
    id: 'conclude-2',
    category: 'conclusion',
    template: 'Future research should explore [direction] to further understand [topic].',
    slots: ['direction', 'topic'],
    example: 'Future research should explore longitudinal studies to further understand long-term effects.',
    difficulty: 'beginner',
  },
  {
    id: 'conclude-3',
    category: 'conclusion',
    template: 'The findings of this study have practical implications for [application area].',
    slots: ['application area'],
    example: 'The findings of this study have practical implications for clinical treatment protocols.',
    difficulty: 'beginner',
  },
]

// Get random templates for daily practice
export function getDailyTemplates(count: number = 3): AcademicTemplate[] {
  const shuffled = [...academicTemplates].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Get templates by category
export function getTemplatesByCategory(category: AcademicTemplate['category']): AcademicTemplate[] {
  return academicTemplates.filter(t => t.category === category)
}

// Get templates by difficulty
export function getTemplatesByDifficulty(difficulty: AcademicTemplate['difficulty']): AcademicTemplate[] {
  return academicTemplates.filter(t => t.difficulty === difficulty)
}
