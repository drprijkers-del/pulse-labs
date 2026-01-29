'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function LoginForm() {
  const t = useTranslation()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const unauthorized = searchParams.get('error') === 'unauthorized'

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    setEmailSent(true)
  }

  // Success state - email sent
  if (emailSent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-xl font-semibold mb-2">{t('loginCheckInbox')}</h2>
          <p className="text-gray-500 mb-6">
            {t('loginEmailSent')}<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="text-sm text-gray-400 mb-4">
            {t('loginClickLink')}
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="text-sm text-pink-600 hover:text-pink-700"
          >
            {t('loginOtherEmail')}
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-1">{t('loginWelcome')}</h2>
          <p className="text-sm text-gray-500">
            {t('loginSubtitle')}
          </p>
        </div>

        {unauthorized && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
            <span className="font-medium">Hmm, </span>
            {t('loginUnauthorized')}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleMagicLink} className="space-y-4">
          <Input
            id="email"
            type="email"
            label={t('loginEmail')}
            placeholder={t('loginEmailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
          >
            {loading ? t('loginLoading') : t('loginButton')}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          {t('loginNoPassword')}
        </p>
      </CardContent>
    </Card>
  )
}
