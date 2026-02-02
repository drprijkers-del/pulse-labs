import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Pagina niet gevonden
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          Deze pagina bestaat niet of is verplaatst. Controleer de URL of ga terug naar het lab.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              Naar homepage
            </Button>
          </Link>
          <Link href="/teams">
            <Button variant="secondary" className="w-full sm:w-auto">
              Naar teams
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
