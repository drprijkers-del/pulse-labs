'use client'

import { useState } from 'react'
import { submitMoodCheckin, CheckinResult } from '@/domain/moods/actions'
import { getMoodEmoji, getMoodLabel, formatDate } from '@/lib/utils'
import { CheckinSuccess } from './checkin-success'

interface TeamCheckinProps {
  teamName: string
}

const MOOD_CONFIG = [
  { value: 1, emoji: '😢', label: 'Heel slecht', color: 'from-red-400 to-red-500' },
  { value: 2, emoji: '😕', label: 'Niet zo goed', color: 'from-orange-400 to-orange-500' },
  { value: 3, emoji: '😐', label: 'Oké', color: 'from-yellow-400 to-yellow-500' },
  { value: 4, emoji: '🙂', label: 'Goed', color: 'from-lime-400 to-lime-500' },
  { value: 5, emoji: '😄', label: 'Geweldig!', color: 'from-green-400 to-green-500' },
]

export function TeamCheckin({ teamName }: TeamCheckinProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [nickname, setNickname] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selectedMood) return

    setLoading(true)
    setError(null)

    const checkinResult = await submitMoodCheckin(
      selectedMood,
      comment || undefined,
      nickname || undefined
    )

    setLoading(false)

    if (!checkinResult.success) {
      if (checkinResult.alreadyCheckedIn) {
        setResult(checkinResult)
      } else {
        setError(checkinResult.error || 'Er is iets misgegaan')
      }
      return
    }

    setResult(checkinResult)
  }

  if (result?.success) {
    return (
      <CheckinSuccess
        mood={selectedMood!}
        streak={result.streak || 1}
        teamStats={result.teamStats}
        teamName={teamName}
      />
    )
  }

  if (result?.alreadyCheckedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Al ingecheckt!
          </h1>
          <p className="text-stone-500">
            Je hebt vandaag al een mood check-in gedaan. Kom morgen terug!
          </p>
        </div>
      </div>
    )
  }

  const selectedConfig = selectedMood ? MOOD_CONFIG.find(m => m.value === selectedMood) : null

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
        <div className="w-full max-w-lg">
          {/* Team & Date */}
          <div className="text-center mb-8">
            <p className="text-sm text-stone-400 mb-1">{formatDate(new Date())}</p>
            <h1 className="text-2xl font-bold text-stone-900">{teamName}</h1>
          </div>

          {/* Question */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight">
            Hoe voel je je <span className="gradient-text">vandaag</span>?
          </h2>

          {/* Mood selector - BIGGER BUTTONS */}
          <div className="flex justify-center gap-3 md:gap-5 mb-8">
            {MOOD_CONFIG.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`
                  mood-button relative
                  w-16 h-16 md:w-20 md:h-20
                  rounded-2xl md:rounded-3xl
                  flex items-center justify-center
                  text-4xl md:text-5xl
                  transition-all duration-300
                  ${selectedMood === mood.value
                    ? `selected bg-gradient-to-br ${mood.color} shadow-lg`
                    : 'bg-stone-100 hover:bg-stone-200'
                  }
                `}
              >
                <span className={selectedMood === mood.value ? 'animate-bounce-gentle' : ''}>
                  {mood.emoji}
                </span>
              </button>
            ))}
          </div>

          {/* Selected mood label */}
          {selectedConfig && (
            <div className="text-center mb-10 animate-fade-in">
              <p className="text-xl font-semibold text-stone-800">
                {selectedConfig.label}
              </p>
            </div>
          )}

          {/* Optional fields */}
          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Je naam (optioneel)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />

            <textarea
              placeholder="Wil je er iets over kwijt? (optioneel)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedMood || loading}
            className={`
              w-full py-4 px-6 rounded-full font-semibold text-lg
              transition-all duration-200
              ${selectedMood
                ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-500/25'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }
              disabled:opacity-50
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Bezig...
              </span>
            ) : (
              'Check-in'
            )}
          </button>

          {/* Anonymous note */}
          <p className="text-center text-xs text-stone-400 mt-6">
            🔒 Je check-in is anoniem
          </p>
        </div>
      </main>
    </div>
  )
}
