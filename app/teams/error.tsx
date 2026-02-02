'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TeamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Teams error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Er ging iets mis
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          Het lab heeft een onverwachte reactie gehad. Probeer het opnieuw of ga terug naar de homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            Opnieuw proberen
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              Naar homepage
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
