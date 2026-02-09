'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useAuth, useSignIn, useSignUp } from '@clerk/nextjs'
import { useTranslation } from '@/lib/i18n/context'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AuthGateContextValue {
  requireAuth: (onSuccess: () => void) => void
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null)

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider')
  return ctx
}

type Step = 'input' | 'check-email'

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const t = useTranslation()

  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)

  const requireAuth = useCallback((onSuccess: () => void) => {
    if (!isLoaded) return
    if (isSignedIn) {
      onSuccess()
      return
    }
    pendingActionRef.current = onSuccess
    setStep('input')
    setEmail('')
    setError(null)
    setLoading(false)
    setShowModal(true)
  }, [isSignedIn, isLoaded])

  const handleClose = () => {
    setShowModal(false)
    pendingActionRef.current = null
  }

  const handleGoogleLogin = async () => {
    if (!signIn) return
    setGoogleLoading(true)
    setError(null)
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/login/sso-callback',
        redirectUrlComplete: '/teams',
      })
    } catch {
      setError(t('signupModalError'))
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t('signupModalInvalidEmail'))
      return
    }

    if (!signUp || !signIn) return

    setLoading(true)
    const redirectUrl = `${window.location.origin}/teams`

    try {
      // Try sign-in first (existing user — no CAPTCHA needed)
      const si = await signIn.create({ identifier: trimmed })
      console.log('[AUTH] signIn factors:', JSON.stringify(si.supportedFirstFactors))
      const emailLinkFactor = si.supportedFirstFactors?.find(
        (f: Record<string, unknown>) => f.strategy === 'email_link'
      ) as { emailAddressId: string } | undefined

      if (emailLinkFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_link',
          emailAddressId: emailLinkFactor.emailAddressId,
          redirectUrl,
        })
        setStep('check-email')
      } else {
        console.error('[AUTH] No email_link factor found in:', si.supportedFirstFactors)
        setError(t('signupModalError'))
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { code: string; message: string }[] }
      const errorCode = clerkError.errors?.[0]?.code
      console.error('[AUTH] signIn error:', errorCode, JSON.stringify(clerkError.errors))

      if (errorCode === 'form_identifier_not_found') {
        // New user — sign up (CAPTCHA div is ready by now)
        try {
          await signUp.create({ emailAddress: trimmed })
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_link',
            redirectUrl,
          })
          setStep('check-email')
        } catch (signUpErr: unknown) {
          const signUpError = signUpErr as { errors?: { code: string; message: string }[] }
          setError(signUpError.errors?.[0]?.message || t('signupModalError'))
        }
      } else {
        setError(clerkError.errors?.[0]?.message || t('signupModalError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={step === 'input' ? t('signupModalTitle') : t('signupModalCheckEmail')}
      >
        {step === 'input' ? (
          <div className="space-y-4">
            <p className="text-sm text-stone-500 dark:text-stone-400 whitespace-pre-line">
              {t('signupModalBody')}
            </p>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-stone-800 px-3 text-stone-400 dark:text-stone-500">of</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="signup-email"
                type="email"
                label={t('signupModalEmail')}
                placeholder={t('signupModalEmailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error || undefined}
                autoComplete="email"
              />

              <div id="clerk-captcha" />

              <Button type="submit" loading={loading} className="w-full">
                {loading ? t('signupModalSending') : t('signupModalSubmit')}
              </Button>
            </form>

            <button
              type="button"
              onClick={handleClose}
              className="w-full text-center text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors py-1"
            >
              {t('signupModalDismiss')}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">
              {t('signupModalCheckEmailBody')}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-6">
              {email}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              {t('signupModalDismiss')}
            </button>
          </div>
        )}
      </Modal>
    </AuthGateContext.Provider>
  )
}
