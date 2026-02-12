'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { type WowLevel, WOW_LEVELS } from '@/domain/wow/types'

interface OverallSignalProps {
  teamId: string
  teamName: string
  needsAttention?: boolean
  vibeScore: number | null
  wowScore: number | null
  vibeParticipation: number // percentage 0-100
  wowSessions: number
  wowLevel?: WowLevel | null
  activeTab?: string
  // Optional vibe context (only shown when on Vibe tab)
  vibeMessage?: string | null
  vibeSuggestion?: string | null
  vibeWowHint?: string | null
  onCoachClick?: () => void
}

export function OverallSignal({
  teamId,
  teamName,
  needsAttention = false,
  vibeScore,
  wowScore,
  vibeParticipation,
  wowSessions,
  wowLevel,
  activeTab,
  vibeMessage,
  vibeSuggestion,
  vibeWowHint,
  onCoachClick,
}: OverallSignalProps) {
  const t = useTranslation()
  const levelInfo = wowLevel ? WOW_LEVELS.find(l => l.id === wowLevel) : null

  // Shu-Ha-Ri watermark config
  const watermarkConfig = {
    shu: { kanji: '守', bg: 'bg-amber-500', darkBg: 'dark:bg-amber-600' },
    ha: { kanji: '破', bg: 'bg-cyan-500', darkBg: 'dark:bg-cyan-600' },
    ri: { kanji: '離', bg: 'bg-purple-500', darkBg: 'dark:bg-purple-600' },
  }

  const wm = wowLevel ? watermarkConfig[wowLevel] : null

  // Level-aware icon colors
  const levelColorClasses = {
    shu: 'text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    ha: 'text-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
    ri: 'text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
  }
  const coachIconColor = wowLevel ? levelColorClasses[wowLevel] : 'text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${wm ? `${wm.bg} ${wm.darkBg}` : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700'}`}
    >
      {/* White overlay with fade */}
      {wm && (
        <div
          className="absolute inset-0 bg-white dark:bg-stone-800"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.03) 6%, rgba(0,0,0,0.08) 12%, rgba(0,0,0,0.18) 18%, rgba(0,0,0,0.35) 24%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 36%, rgba(0,0,0,1) 42%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.03) 6%, rgba(0,0,0,0.08) 12%, rgba(0,0,0,0.18) 18%, rgba(0,0,0,0.35) 24%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 36%, rgba(0,0,0,1) 42%)',
          }}
        />
      )}

      {/* Kanji watermark + level label */}
      {wm && (
        <div className="absolute -left-1 top-0 bottom-0 flex flex-col items-center justify-center w-14 sm:w-16 select-none pointer-events-none" style={{ perspective: '200px' }}>
          <span className="text-white/30" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, transform: 'rotateY(-20deg)', transformStyle: 'preserve-3d' }}>
            {wm.kanji}
          </span>
          {levelInfo && (
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-0.5">
              {levelInfo.label}
            </span>
          )}
        </div>
      )}

      {/* Icons — top right */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-0.5">
        <button
          onClick={onCoachClick}
          className={`p-1.5 rounded-lg ${coachIconColor} transition-colors ${activeTab === 'coach' ? 'ring-2 ring-current ring-offset-1 dark:ring-offset-stone-800' : ''}`}
          title={t('coachQuestionsTab')}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
        <Link
          href={`/teams/${teamId}?tab=${activeTab === 'settings' ? 'home' : 'settings'}`}
          className={`p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${activeTab === 'settings' ? 'ring-2 ring-stone-400 ring-offset-1 dark:ring-offset-stone-800' : ''}`}
          title={t('teamSettings')}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 p-4 sm:p-6 pb-10 sm:pb-12 ${wm ? 'pl-16 sm:pl-24' : ''}`}
        style={{ perspective: '600px' }}
      >
        {/* Team name */}
        <div className="flex items-center gap-2 pr-16">
          <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 truncate">
            {teamName}
          </h1>
          {needsAttention && (
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
          )}
        </div>

        {/* Needs attention reason */}
        {needsAttention && (vibeScore !== null || wowScore !== null) && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-700 dark:text-red-400">
              {vibeScore !== null && vibeScore < 2.5 && wowScore !== null && wowScore < 2.5
                ? `${t('attentionReasonVibe')} (${vibeScore.toFixed(1)}) · ${t('attentionReasonWow')} (${wowScore.toFixed(1)})`
                : vibeScore !== null && vibeScore < 2.5
                ? `${t('attentionReasonVibe')} (${vibeScore.toFixed(1)})`
                : wowScore !== null && wowScore < 2.5
                ? `${t('attentionReasonWow')} (${wowScore.toFixed(1)})`
                : null}
            </p>
          </div>
        )}

        {/* Scores — pinned bottom right */}
        <div className="absolute bottom-2.5 right-3 sm:bottom-3 sm:right-6 flex flex-col items-end gap-0.5 sm:flex-row sm:gap-1.5">
          {/* Vibe */}
          <span className="inline-flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-500 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M2 12h3l2-6 3 12 3-8 2 4h7" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-stone-400">Vibe</span>
            <span className={`text-xs sm:text-sm font-bold tabular-nums ${
              vibeScore === null ? 'text-stone-400 dark:text-stone-500' :
              vibeScore >= 4 ? 'text-green-600 dark:text-green-400' :
              vibeScore >= 3 ? 'text-cyan-600 dark:text-cyan-400' :
              vibeScore >= 2 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {vibeScore !== null ? vibeScore.toFixed(1) : '—'}
            </span>
            <span className="text-stone-300 dark:text-stone-600 text-[10px] sm:text-xs">|</span>
            <span className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 tabular-nums">
              {vibeParticipation}% {t('signalParticipation').toLowerCase()}
            </span>
          </span>
          {/* Separator — desktop only */}
          <span className="hidden sm:inline text-stone-300 dark:text-stone-600 text-xs">|</span>
          {/* WoW */}
          <span className="inline-flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline-flex items-center justify-center text-cyan-500 font-bold text-[10px] sm:text-xs shrink-0 leading-none">Δ</span>
            <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-stone-400">WoW</span>
            <span className={`text-xs sm:text-sm font-bold tabular-nums ${
              wowScore === null ? 'text-stone-400 dark:text-stone-500' :
              wowScore >= 4 ? 'text-green-600 dark:text-green-400' :
              wowScore >= 3 ? 'text-cyan-600 dark:text-cyan-400' :
              wowScore >= 2 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {wowScore !== null ? wowScore.toFixed(1) : '—'}
            </span>
            <span className="text-stone-300 dark:text-stone-600 text-[10px] sm:text-xs">|</span>
            <span className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 tabular-nums">
              {wowSessions} active {wowSessions === 1 ? 'session' : 'sessions'}
            </span>
          </span>
        </div>

        {/* Vibe context message (only shown when on Vibe tab) */}
        {vibeMessage && (
          <div className="mt-4 pt-2">
            <p className="font-medium text-stone-700 dark:text-stone-300">{vibeMessage}</p>
            {vibeSuggestion && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{vibeSuggestion}</p>
            )}
            {vibeWowHint && (
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 flex items-center gap-1.5">
                <span className="font-bold">Δ</span>
                {vibeWowHint}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
