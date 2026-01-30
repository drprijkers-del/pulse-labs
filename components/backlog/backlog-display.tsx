'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { BacklogItem, ReleaseNote } from '@/domain/backlog/actions'

interface BacklogDisplayProps {
  items: BacklogItem[]
  releases: ReleaseNote[]
}

type Tab = 'exploring' | 'building' | 'not_doing' | 'releases'

export function BacklogDisplay({ items, releases }: BacklogDisplayProps) {
  const [activeTab, setActiveTab] = useState<Tab>('exploring')

  // Group items
  const exploring = items.filter(i => i.status === 'exploring')
  const building = items.filter(i => i.status === 'decided' && i.decision === 'building')
  const notDoing = items.filter(i => i.status === 'decided' && i.decision === 'not_doing')

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'exploring', label: 'Exploring', count: exploring.length },
    { id: 'building', label: 'Building', count: building.length },
    { id: 'not_doing', label: 'Not doing', count: notDoing.length },
    { id: 'releases', label: 'Releases', count: releases.length },
  ]

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ux: 'UX',
      statements: 'Statements',
      analytics: 'Analytics',
      integration: 'Integration',
      features: 'Features',
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ux: 'bg-purple-100 text-purple-700',
      statements: 'bg-blue-100 text-blue-700',
      analytics: 'bg-cyan-100 text-cyan-700',
      integration: 'bg-amber-100 text-amber-700',
      features: 'bg-emerald-100 text-emerald-700',
    }
    return colors[category] || 'bg-stone-100 text-stone-700'
  }

  const renderItems = (itemList: BacklogItem[]) => {
    if (itemList.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-stone-400">No items yet</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {itemList.map((item) => (
          <Card key={item.id}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                  {getCategoryLabel(item.category)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900">{item.title_en}</h3>
                  {item.source_en && (
                    <p className="text-sm text-stone-500 mt-1">{item.source_en}</p>
                  )}
                  {item.our_take_en && (
                    <p className="text-sm text-stone-600 mt-2 italic">
                      &ldquo;{item.our_take_en}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderReleases = () => {
    if (releases.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-stone-400">No releases yet</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {releases.map((release) => (
          <Card key={release.id}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded">
                  v{release.version}
                </span>
                <span className="text-sm text-stone-400">
                  {new Date(release.released_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <h3 className="font-medium text-stone-900">{release.title_en}</h3>
              {release.description_en && (
                <p className="text-sm text-stone-500 mt-1">{release.description_en}</p>
              )}
              {release.changes && release.changes.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {release.changes.map((change, i) => (
                    <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">+</span>
                      {change.en}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
              }
            `}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs text-stone-400">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'exploring' && (
        <div>
          <p className="text-sm text-stone-500 mb-4">
            Ideas and features we&apos;re actively considering. Feedback welcome!
          </p>
          {renderItems(exploring)}
        </div>
      )}

      {activeTab === 'building' && (
        <div>
          <p className="text-sm text-stone-500 mb-4">
            Decided to build. Coming soon to Pulse.
          </p>
          {renderItems(building)}
        </div>
      )}

      {activeTab === 'not_doing' && (
        <div>
          <p className="text-sm text-stone-500 mb-4">
            We considered these but decided against them. Here&apos;s why.
          </p>
          {renderItems(notDoing)}
        </div>
      )}

      {activeTab === 'releases' && (
        <div>
          <p className="text-sm text-stone-500 mb-4">
            Recent updates and new features.
          </p>
          {renderReleases()}
        </div>
      )}
    </div>
  )
}
