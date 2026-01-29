'use client'

import { useEffect, useState } from 'react'
import { getTeamMoodStats, getParticipantStreak, MoodStats } from '@/domain/moods/actions'
import { getMoodEmoji } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageToggle } from '@/components/ui/language-toggle'

interface AlreadyCheckedInProps {
  teamName: string
}

export function AlreadyCheckedIn({ teamName }: AlreadyCheckedInProps) {
  const t = useTranslation()
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [streak, setStreak] = useState<number>(0)

  useEffect(() => {
    async function loadData() {
      const [moodStats, participantStreak] = await Promise.all([
        getTeamMoodStats(),
        getParticipantStreak(),
      ])
      setStats(moodStats)
      setStreak(participantStreak)
    }
    loadData()
  }, [])

  const avgMoodEmoji = stats?.average_mood
    ? getMoodEmoji(Math.round(stats.average_mood))
    : '🙂'

  const isGoodStreak = streak >= 3
  const isGreatStreak = streak >= 7

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐔</span>
            <span className="text-sm text-stone-400">{t('pinkPollos')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="tool-badge">{t('pulse')}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="text-center max-w-md">
          {/* Already checked in */}
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {t('alreadyTitle')}
          </h1>
          <p className="text-stone-500 mb-8">
            {t('alreadyMessage')}
          </p>

          {/* Streak - prominent */}
          {streak > 0 && (
            <div className={`
              mb-8 p-6 rounded-3xl
              ${isGreatStreak
                ? 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 text-white shadow-xl'
                : isGoodStreak
                  ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg'
                  : 'bg-stone-100'
              }
            `}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className={`text-4xl ${streak > 1 ? 'animate-flame' : ''}`}>
                  {streak > 1 ? '🔥' : '✨'}
                </span>
                <span className={`text-4xl font-bold ${isGoodStreak ? 'text-white' : 'text-stone-900'}`}>
                  {streak}
                </span>
              </div>
              <p className={`text-sm font-medium ${isGoodStreak ? 'text-white/90' : 'text-stone-500'}`}>
                {streak === 1 ? t('successStreakSingular') : `${t('successStreak')}!`}
              </p>
              {isGreatStreak && (
                <p className="text-xs text-white/70 mt-2">
                  {t('successOnFire')} 💪
                </p>
              )}
            </div>
          )}

          {/* Team stats */}
          {stats && stats.total_entries > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-4">{t('successTeamToday')}</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl">{avgMoodEmoji}</span>
                <div className="text-left">
                  <div className="text-3xl font-bold text-stone-900">
                    {stats.average_mood.toFixed(1)}
                  </div>
                  <div className="text-sm text-stone-500">
                    {t('successAverage')}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 text-sm text-stone-500">
                {stats.total_entries} {t('alreadyCheckedToday')}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-stone-400">
        {teamName}
      </footer>
    </div>
  )
}
