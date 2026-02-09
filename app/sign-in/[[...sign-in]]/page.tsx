import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Log in</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
          Ontvang een veilige loginlink via e-mail.
        </p>
      </div>
      <SignIn
        fallbackRedirectUrl="/teams"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
