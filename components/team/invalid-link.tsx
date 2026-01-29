interface InvalidLinkProps {
  message?: string
}

export function InvalidLink({ message }: InvalidLinkProps) {
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
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🔗</div>
          <h1 className="text-2xl font-bold text-stone-900 mb-3">
            Link niet geldig
          </h1>
          <p className="text-stone-500 mb-8">
            {message || 'Deze link is niet geldig of verlopen. Vraag je teamleader om een nieuwe uitnodigingslink.'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-500 text-sm">
            <span>💡</span>
            <span>Tip: check of je de volledige link hebt gekopieerd</span>
          </div>
        </div>
      </main>
    </div>
  )
}
