'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'

interface FeedbackToolProps {
  teamId: string
  teamName: string
}

type FeedbackType = 'appreciation' | 'suggestion' | 'concern'

const FEEDBACK_TYPES: { key: FeedbackType; label: string; emoji: string; color: string }[] = [
  { key: 'appreciation', label: 'Waardering', emoji: '🌟', color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { key: 'suggestion', label: 'Suggestie', emoji: '💡', color: 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700' },
  { key: 'concern', label: 'Zorg', emoji: '🤔', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' },
]

export function FeedbackTool({ teamId, teamName }: FeedbackToolProps) {
  const t = useTranslation()
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('appreciation')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)

    // Simulate submission (actual implementation would save to database)
    await new Promise(resolve => setTimeout(resolve, 500))

    setSubmitting(false)
    setSubmitted(true)

    // Reset after showing success
    setTimeout(() => {
      setSubmitted(false)
      setMessage('')
      setRecipient('')
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
          Feedback verzonden!
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          {isAnonymous ? 'Je anonieme feedback is gedeeld.' : 'Je feedback is gedeeld met het team.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Feedback Rules Reminder */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('feedbackRules')}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-start gap-2 text-xs text-purple-700 dark:text-purple-300">
            <span className="text-purple-500">1.</span>
            <span>{t('feedbackRule1')}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-purple-700 dark:text-purple-300">
            <span className="text-purple-500">2.</span>
            <span>{t('feedbackRule2')}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-purple-700 dark:text-purple-300">
            <span className="text-purple-500">3.</span>
            <span>{t('feedbackRule3')}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-purple-700 dark:text-purple-300">
            <span className="text-purple-500">4.</span>
            <span>{t('feedbackRule4')}</span>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            Type feedback
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FEEDBACK_TYPES.map(type => (
              <button
                key={type.key}
                type="button"
                onClick={() => setFeedbackType(type.key)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  feedbackType === type.key
                    ? `${type.color} border-current`
                    : 'bg-stone-50 dark:bg-stone-700 border-transparent hover:border-stone-300 dark:hover:border-stone-500'
                }`}
              >
                <div className="text-2xl mb-1">{type.emoji}</div>
                <div className="text-xs font-medium text-stone-700 dark:text-stone-300">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient (optional) */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            Voor wie? <span className="text-stone-400 font-normal">(optioneel)</span>
          </label>
          <input
            type="text"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="Naam of 'het team'"
            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            Je feedback
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={
              feedbackType === 'appreciation' ? "Wat waardeer je? Wees specifiek over wat je hebt gezien..." :
              feedbackType === 'suggestion' ? "Welke suggestie heb je? Wat zou je willen zien veranderen..." :
              "Waar maak je je zorgen over? Wat heb je geobserveerd..."
            }
            rows={4}
            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
          <div>
            <div className="text-sm font-medium text-stone-700 dark:text-stone-300">Anoniem delen</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">Je naam wordt niet getoond</div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              isAnonymous ? 'bg-cyan-500' : 'bg-stone-300 dark:bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isAnonymous ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={!message.trim()}
          loading={submitting}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Feedback delen
        </Button>
      </form>

      {/* Note about beta */}
      <p className="text-xs text-center text-stone-400 dark:text-stone-500">
        Dit is een preview. Feedback wordt nog niet opgeslagen.
      </p>
    </div>
  )
}
