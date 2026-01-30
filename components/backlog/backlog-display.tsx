'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import type { BacklogItem, ReleaseNote } from '@/domain/backlog/actions'
import { submitWish } from '@/domain/backlog/actions'

interface BacklogDisplayProps {
  items: BacklogItem[]
  releases: ReleaseNote[]
}

type Tab = 'exploring' | 'building' | 'not_doing' | 'releases'
type WishState = 'browsing' | 'form' | 'submitting' | 'success'

export function BacklogDisplay({ items, releases }: BacklogDisplayProps) {
  const t = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('exploring')

  // Wish form state
  const [wishState, setWishState] = useState<WishState>('browsing')
  const [wishText, setWishText] = useState('')
  const [wishWhy, setWishWhy] = useState('')
  const [wishError, setWishError] = useState('')

  // Group items
  const exploring = items.filter(i => i.status === 'exploring')
  const building = items.filter(i => i.status === 'decided' && i.decision === 'building')
  const notDoing = items.filter(i => i.status === 'decided' && i.decision === 'not_doing')
  const review = items.filter(i => i.status === 'review')

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'exploring', label: 'Exploring', count: exploring.length },
    { id: 'building', label: 'Building', count: building.length },
    { id: 'not_doing', label: 'Not doing', count: notDoing.length },
    { id: 'releases', label: 'Releases', count: releases.length },
  ]

  const handleSubmitWish = async () => {
    if (!wishText.trim()) {
      setWishError(t('wishRequired'))
      return
    }

    setWishState('submitting')

    const result = await submitWish(wishText.trim(), wishWhy.trim())

    if (!result.success) {
      setWishError(result.error || 'Something went wrong')
      setWishState('form')
      return
    }

    setWishState('success')
    setWishText('')
    setWishWhy('')
  }

  const handleCancelForm = () => {
    setWishState('browsing')
    setWishText('')
    setWishWhy('')
    setWishError('')
  }

  const handleCloseSuccess = () => {
    setWishState('browsing')
  }

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

  const getProductBadge = (product: string) => {
    const config: Record<string, { label: string; color: string }> = {
      delta: { label: 'Delta', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
      pulse: { label: 'Pulse', color: 'bg-purple-50 text-purple-600 border-purple-200' },
      shared: { label: 'Shared', color: 'bg-stone-50 text-stone-600 border-stone-200' },
    }
    return config[product] || config.shared
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
        {itemList.map((item) => {
          const productBadge = getProductBadge(item.product)
          return (
            <Card key={item.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${productBadge.color}`}>
                      {productBadge.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
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
          )
        })}
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
        {releases.map((release) => {
          const productBadge = getProductBadge(release.product)
          return (
            <Card key={release.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${productBadge.color}`}>
                    {productBadge.label}
                  </span>
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
          )
        })}
      </div>
    )
  }

  return (
    <div>
      {/* Wish submission section */}
      {wishState === 'browsing' && (
        <Card className="mb-8 border-cyan-200 bg-cyan-50/50">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-bold text-stone-900">{t('wishTitle')}</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Have an idea or suggestion? We&apos;d love to hear it!
                </p>
              </div>
              <Button onClick={() => setWishState('form')}>
                {t('wishAddButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wish form */}
      {(wishState === 'form' || wishState === 'submitting') && (
        <Card className="mb-8 border-cyan-200">
          <CardContent className="py-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">{t('wishTitle')}</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="wish-text" className="block text-sm font-medium text-stone-700 mb-1">
                  {t('wishLabel')}
                </label>
                <textarea
                  id="wish-text"
                  value={wishText}
                  onChange={(e) => {
                    setWishText(e.target.value)
                    setWishError('')
                  }}
                  placeholder={t('wishPlaceholder')}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={wishState === 'submitting'}
                />
                {wishError && (
                  <p className="text-sm text-red-600 mt-1">{wishError}</p>
                )}
              </div>

              <div>
                <label htmlFor="wish-why" className="block text-sm font-medium text-stone-700 mb-1">
                  {t('wishWhyLabel')}
                </label>
                <textarea
                  id="wish-why"
                  value={wishWhy}
                  onChange={(e) => setWishWhy(e.target.value)}
                  placeholder={t('wishWhyPlaceholder')}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={wishState === 'submitting'}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmitWish}
                  disabled={wishState === 'submitting'}
                  className="flex-1"
                >
                  {wishState === 'submitting' ? t('wishSubmitting') : t('wishSubmit')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancelForm}
                  disabled={wishState === 'submitting'}
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success message */}
      {wishState === 'success' && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-2">{t('wishThanks')}</h2>
            <p className="text-sm text-stone-600 mb-4">{t('wishConfirmation')}</p>
            <Button variant="secondary" onClick={handleCloseSuccess}>
              {t('wishClose')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Under review section (if there are items) */}
      {review.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">
            Under review ({review.length})
          </h3>
          {renderItems(review)}
        </div>
      )}

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
