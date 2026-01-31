'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'

interface CoachQuestionsProps {
  pulseScore: number | null
  pulseParticipation: number
  deltaTensions?: { area: string; score: number }[]
  teamName: string
}

// Coaching question templates based on situations
const QUESTION_TEMPLATES = {
  lowPulse: [
    "What do you think is causing the team's energy to dip right now?",
    "If you could change one thing about your daily work, what would it be?",
    "What support does the team need that they're not getting?",
    "When was the last time the team felt really energized? What was different?",
    "What's the biggest blocker preventing the team from doing their best work?",
  ],
  lowParticipation: [
    "What would make it easier for everyone to share their daily signal?",
    "Are there team members who feel disconnected? How can we include them?",
    "Is there a trust barrier preventing people from participating?",
    "What message does low participation send about team engagement?",
  ],
  flowProblems: [
    "What's causing work to get stuck in your process?",
    "How often does unplanned work disrupt the sprint?",
    "What would 'done' look like if we could define it more clearly?",
    "Where are the handoffs creating delays?",
  ],
  ownershipProblems: [
    "What decisions does the team feel they can't make on their own?",
    "How can we increase the team's autonomy without losing alignment?",
    "What would it take for the team to feel fully responsible for outcomes?",
    "Where is permission-seeking slowing down the team?",
  ],
  collaborationProblems: [
    "How well does knowledge flow between team members?",
    "What would better collaboration look like for this team?",
    "Are there silos forming within the team?",
    "How can we create more opportunities for pair work?",
  ],
  scrumProblems: [
    "Which ceremonies feel most valuable? Which feel like a burden?",
    "Is the Sprint Goal actually guiding daily decisions?",
    "What would make the Daily Standup more useful?",
    "How can we make retro actions more impactful?",
  ],
  general: [
    "What's working well that we should do more of?",
    "What's the one thing holding this team back from excellence?",
    "If you could wave a magic wand, what would change tomorrow?",
    "What conversation has the team been avoiding?",
    "What does success look like for this team in 3 months?",
  ],
}

// Map Delta angles to question categories
const ANGLE_TO_CATEGORY: Record<string, keyof typeof QUESTION_TEMPLATES> = {
  flow: 'flowProblems',
  ownership: 'ownershipProblems',
  collaboration: 'collaborationProblems',
  scrum: 'scrumProblems',
  technical_excellence: 'general',
  refinement: 'flowProblems',
  planning: 'scrumProblems',
  retro: 'scrumProblems',
  demo: 'collaborationProblems',
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function CoachQuestions({
  pulseScore,
  pulseParticipation,
  deltaTensions = [],
  teamName,
}: CoachQuestionsProps) {
  const t = useTranslation()
  const [questions, setQuestions] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)

  const generateQuestions = () => {
    setGenerating(true)

    const generated: string[] = []

    // Add questions based on Pulse score
    if (pulseScore !== null && pulseScore < 3) {
      generated.push(...pickRandom(QUESTION_TEMPLATES.lowPulse, 2))
    }

    // Add questions based on participation
    if (pulseParticipation < 50) {
      generated.push(...pickRandom(QUESTION_TEMPLATES.lowParticipation, 1))
    }

    // Add questions based on Delta tensions
    for (const tension of deltaTensions.slice(0, 2)) {
      const category = ANGLE_TO_CATEGORY[tension.area] || 'general'
      generated.push(...pickRandom(QUESTION_TEMPLATES[category], 1))
    }

    // Always add some general questions
    generated.push(...pickRandom(QUESTION_TEMPLATES.general, 2))

    // Dedupe and limit
    const unique = [...new Set(generated)].slice(0, 5)

    // Simulate a brief delay for effect
    setTimeout(() => {
      setQuestions(unique)
      setGenerating(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Context cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-1">Pulse Score</div>
          <div className={`text-lg font-bold ${
            pulseScore === null ? 'text-stone-400' :
            pulseScore >= 4 ? 'text-green-600' :
            pulseScore >= 3 ? 'text-cyan-600' :
            pulseScore >= 2 ? 'text-amber-600' :
            'text-red-600'
          }`}>
            {pulseScore?.toFixed(1) || '-'}
          </div>
        </div>
        <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-1">{t('signalParticipation')}</div>
          <div className={`text-lg font-bold ${
            pulseParticipation >= 80 ? 'text-green-600' :
            pulseParticipation >= 50 ? 'text-amber-600' :
            'text-red-600'
          }`}>
            {pulseParticipation}%
          </div>
        </div>
        {deltaTensions.length > 0 && (
          <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3">
            <div className="text-xs text-stone-500 dark:text-stone-400 mb-1">{t('tension')}</div>
            <div className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {deltaTensions[0]?.area}
            </div>
          </div>
        )}
      </div>

      {/* Generate button */}
      {questions.length === 0 && (
        <Button onClick={generateQuestions} loading={generating} className="w-full">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {t('coachQuestionsGenerate')}
        </Button>
      )}

      {/* Generated questions */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-stone-900 dark:text-stone-100">
              Coaching vragen voor {teamName}
            </h4>
            <button
              onClick={generateQuestions}
              className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-medium"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-2">
            {questions.map((question, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
                    {question}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h5 className="font-medium text-amber-800 dark:text-amber-300 text-sm mb-2">
              Tips voor gebruik
            </h5>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <li>• Stel open vragen, geen ja/nee vragen</li>
              <li>• Luister actief, vul niet aan</li>
              <li>• Laat stiltes toe, geef denktijd</li>
              <li>• Vraag door op emoties en aannames</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
