'use client'

import { MoodStats } from '@/domain/moods/actions'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageToggle } from '@/components/ui/language-toggle'

interface CheckinSuccessProps {
  mood: number
  streak: number
  teamStats?: MoodStats
  teamName: string
}

// Purity levels like Heisenberg's product
const PURITY_LABELS = ['50%', '70%', '85%', '96%', '99.1%']

export function CheckinSuccess({ mood, streak, teamStats, teamName }: CheckinSuccessProps) {
  const t = useTranslation()
  const purity = PURITY_LABELS[mood - 1] || '99.1%'

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 relative overflow-hidden">
      {/* Easter egg: RV driving away */}
      <div className="absolute bottom-10 -right-10 text-4xl opacity-10 animate-pulse">
        🚐💨
      </div>

      {/* Header */}
      <header className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐔</span>
            <span className="text-sm text-stone-400">{t('pinkPollos')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="inline-flex items-center gap-1 text-xs text-stone-500 border border-stone-200 px-2 py-1 rounded-full">
              ⚗️ {t('pulse')}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative z-10">
        <div className="text-center max-w-md">
          {/* Success - lab beaker */}
          <div className="text-6xl mb-6">
            🧪
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {t('successTitle')}
          </h1>
          <p className="text-stone-500 mb-8">
            {t('successRecorded')}
          </p>

          {/* Signal value */}
          <div className="mb-8 p-6 bg-white rounded-2xl border border-stone-200">
            <div className="text-5xl font-bold text-stone-900 mb-1">
              {mood}
            </div>
            <p className="text-sm text-cyan-500 font-mono">
              {purity} pure
            </p>
          </div>

          {/* Streak */}
          {streak > 1 && (
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-stone-600">
              <span className="text-lg">⚗️</span>
              <span className="font-semibold">{streak}</span>
              <span className="text-sm">{t('successStreak')}</span>
            </div>
          )}

          {/* Team stats */}
          {teamStats && teamStats.total_entries > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200 mb-8">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-4">{t('successTeamToday')}</p>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-900">
                    {teamStats.average_mood.toFixed(1)}
                  </div>
                  <div className="text-xs text-stone-400">
                    {t('successAverage')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-900">
                    {teamStats.total_entries}
                  </div>
                  <div className="text-xs text-stone-400">
                    {t('successCheckins')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Return message */}
          <p className="text-stone-400 text-sm">
            {t('successSeeYouTomorrow')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-stone-400 relative z-10">
        {teamName}
      </footer>
    </div>
  )
}
