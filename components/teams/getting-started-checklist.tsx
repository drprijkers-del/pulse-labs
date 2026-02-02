'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

interface GettingStartedChecklistProps {
  teamId: string
  teamSlug: string
  hasPulseEntries: boolean
  hasCeremonySessions: boolean
  hasClosedSessions: boolean
}

export function GettingStartedChecklist({
  teamId,
  teamSlug,
  hasPulseEntries,
  hasCeremonySessions,
  hasClosedSessions,
}: GettingStartedChecklistProps) {
  const t = useTranslation()
  const [dismissed, setDismissed] = useState(true) // Start hidden to prevent flash

  // Check localStorage on mount
  useEffect(() => {
    const key = `team-${teamId}-onboarding-dismissed`
    const isDismissed = localStorage.getItem(key) === 'true'
    setDismissed(isDismissed)
  }, [teamId])

  const handleDismiss = () => {
    const key = `team-${teamId}-onboarding-dismissed`
    localStorage.setItem(key, 'true')
    setDismissed(true)
  }

  // Calculate completion
  const steps = [
    { id: 'vibe', done: hasPulseEntries },
    { id: 'ceremonies', done: hasCeremonySessions },
    { id: 'insights', done: hasClosedSessions },
  ]
  const completedCount = steps.filter(s => s.done).length
  const allComplete = completedCount === steps.length

  // Don't show if dismissed or all complete
  if (dismissed || allComplete) return null

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-xl">
            🚀
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {t('onboardingTitle')}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t('onboardingSubtitle')}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-2.5 -m-1 hover:bg-cyan-100 dark:hover:bg-cyan-800/50 rounded-lg transition-colors text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 min-w-11 min-h-11 flex items-center justify-center"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
          <span>{completedCount} / {steps.length} {t('onboardingComplete')}</span>
        </div>
        <div className="h-2 bg-white dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {/* Step 1: Share Pulse link */}
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          hasPulseEntries
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            hasPulseEntries
              ? 'bg-green-500 text-white'
              : 'bg-stone-200 dark:bg-stone-600 text-stone-500 dark:text-stone-400'
          }`}>
            {hasPulseEntries ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-xs font-bold">1</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${hasPulseEntries ? 'text-green-700 dark:text-green-400' : 'text-stone-700 dark:text-stone-300'}`}>
              {t('onboardingStep1')}
            </p>
            {!hasPulseEntries && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {t('onboardingStep1Hint')}
              </p>
            )}
          </div>
          {!hasPulseEntries && (
            <Link
              href={`/vibe/t/${teamSlug}`}
              target="_blank"
              className="px-4 py-2.5 text-xs font-medium bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shrink-0 min-h-11 flex items-center"
            >
              {t('onboardingTestLink')}
            </Link>
          )}
        </div>

        {/* Step 2: Run Delta session */}
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          hasCeremonySessions
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            hasCeremonySessions
              ? 'bg-green-500 text-white'
              : 'bg-stone-200 dark:bg-stone-600 text-stone-500 dark:text-stone-400'
          }`}>
            {hasCeremonySessions ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-xs font-bold">2</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${hasCeremonySessions ? 'text-green-700 dark:text-green-400' : 'text-stone-700 dark:text-stone-300'}`}>
              {t('onboardingStep2')}
            </p>
            {!hasCeremonySessions && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {t('onboardingStep2Hint')}
              </p>
            )}
          </div>
          {!hasCeremonySessions && (
            <Link
              href={`/teams/${teamId}/delta/new`}
              className="px-4 py-2.5 text-xs font-medium bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shrink-0 min-h-11 flex items-center"
            >
              {t('onboardingStartSession')}
            </Link>
          )}
        </div>

        {/* Step 3: Review insights */}
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          hasClosedSessions
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            hasClosedSessions
              ? 'bg-green-500 text-white'
              : 'bg-stone-200 dark:bg-stone-600 text-stone-500 dark:text-stone-400'
          }`}>
            {hasClosedSessions ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-xs font-bold">3</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${hasClosedSessions ? 'text-green-700 dark:text-green-400' : 'text-stone-700 dark:text-stone-300'}`}>
              {t('onboardingStep3')}
            </p>
            {!hasClosedSessions && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {t('onboardingStep3Hint')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
