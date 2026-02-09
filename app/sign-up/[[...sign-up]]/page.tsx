import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Account aanmaken</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
          Maak een account met je e-mail. Geen wachtwoord nodig.
        </p>
      </div>
      <SignUp
        fallbackRedirectUrl="/teams"
        signInUrl="/sign-in"
      />
    </div>
  )
}
