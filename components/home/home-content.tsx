'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageToggle } from '@/components/ui/language-toggle'

export function HomeContent() {
  const t = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
      {/* Atmospheric background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        {/* Pink glow - top left */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
        {/* Cyan glow - bottom right */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />
        {/* Purple accent - center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-10">
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-bold text-stone-100 tracking-tight">Pulse</span>
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-widest -mt-1">Labs</span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center max-w-2xl">
          {/* Heart pulse icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 mb-8">
            <span className="text-4xl text-pink-400">♥</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-pink-100 to-stone-100">
            Check Your Team&apos;s Pulse
          </h1>

          <p className="text-xl text-stone-400 mb-8 font-light leading-relaxed">
            Simple daily check-ins. Real-time team insights.
            <br className="hidden sm:block" />
            Know how your team is really doing.
          </p>

          {/* CTA */}
          <Link href="/teams">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-pink-900/30 hover:shadow-pink-500/30 hover:from-pink-500 hover:to-purple-500 transition-all duration-300 mb-12">
              <span className="relative z-10 flex items-center gap-2">
                {t('homeGetStarted')}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </Link>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8 text-left">
            <div className="bg-stone-800/50 rounded-xl p-5 border border-stone-700/50">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-3">
                <span className="text-pink-400 text-lg">♥</span>
              </div>
              <h3 className="font-semibold text-stone-200 mb-1">Vibe Check</h3>
              <p className="text-sm text-stone-400">Daily mood tracking with anonymous check-ins. See trends over time.</p>
            </div>
            <div className="bg-stone-800/50 rounded-xl p-5 border border-stone-700/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                <span className="text-cyan-400 font-bold">Δ</span>
              </div>
              <h3 className="font-semibold text-stone-200 mb-1">Ceremonies</h3>
              <p className="text-sm text-stone-400">Deep-dive team health assessments. Shu-Ha-Ri progression system.</p>
            </div>
            <div className="bg-stone-800/50 rounded-xl p-5 border border-stone-700/50">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-200 mb-1">Insights</h3>
              <p className="text-sm text-stone-400">Actionable signals and coach-ready questions for team leads.</p>
            </div>
          </div>

          {/* Login hint */}
          <p className="text-sm text-stone-500 mt-12">
            {t('labLoginHint')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-6 pb-12 text-center relative z-10">
        <p className="text-xs text-stone-500">
          <a
            href="https://pinkpollos.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-300 transition-colors"
          >
            {t('pinkPollos')}
          </a>
          {' · '}{t('labFooter')}
        </p>
      </footer>
    </div>
  )
}
