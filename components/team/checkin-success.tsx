'use client'

import { MoodStats } from '@/domain/moods/actions'
import { getMoodEmoji } from '@/lib/utils'

interface CheckinSuccessProps {
  mood: number
  streak: number
  teamStats?: MoodStats
  teamName: string
}

export function CheckinSuccess({ mood, streak, teamStats, teamName }: CheckinSuccessProps) {
  const avgMoodEmoji = teamStats?.average_mood
    ? getMoodEmoji(Math.round(teamStats.average_mood))
    : '🙂'

  const isNewStreak = streak === 1
  const isGoodStreak = streak >= 3
  const isGreatStreak = streak >= 7

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐔</span>
            <span className="text-sm text-stone-400">Pink Pollos</span>
          </div>
          <span className="tool-badge">Mood Meter</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="text-center max-w-md animate-scale-in">
          {/* Success animation */}
          <div className="relative inline-block mb-6">
            <div className="text-8xl md:text-9xl animate-bounce-gentle">{getMoodEmoji(mood)}</div>
            <div className="absolute -right-1 -bottom-1 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
            Bedankt! 🎉
          </h1>
          <p className="text-stone-500 mb-8">
            Je check-in is opgeslagen
          </p>

          {/* STREAK - More prominent */}
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
              {isNewStreak
                ? 'Je eerste check-in! Start je streak!'
                : streak === 2
                  ? 'dagen streak - Keep going!'
                  : isGreatStreak
                    ? `dagen streak - Je bent on fire! 🔥`
                    : `dagen streak!`
              }
            </p>
            {isGreatStreak && (
              <p className="text-xs text-white/70 mt-2">
                Top performer! 💪
              </p>
            )}
          </div>

          {/* Team stats */}
          {teamStats && teamStats.total_entries > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-8">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-4">Team vandaag</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl">{avgMoodEmoji}</span>
                <div className="text-left">
                  <div className="text-3xl font-bold text-stone-900">
                    {teamStats.average_mood.toFixed(1)}
                  </div>
                  <div className="text-sm text-stone-500">
                    gemiddeld
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-stone-900">{teamStats.total_entries}</div>
                    <div className="text-stone-400">check-ins</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Return message */}
          <p className="text-stone-400 text-sm">
            Tot morgen! 👋
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-stone-400">
        {teamName}
      </footer>
    </div>
  )
}
