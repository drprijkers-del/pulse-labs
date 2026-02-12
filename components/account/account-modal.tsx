'use client'

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useTranslation } from '@/lib/i18n/context'
import { updateAccountName, updateAccountEmail, deleteAccount } from '@/domain/account/actions'

interface AccountModalProps {
  onClose: () => void
}

export function AccountModal({ onClose }: AccountModalProps) {
  const t = useTranslation()
  const { user } = useUser()
  const { signOut } = useClerk()

  // Name
  const [name, setName] = useState(user?.firstName || '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  // Email
  const [editingEmail, setEditingEmail] = useState(false)
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Password
  const [editingPassword, setEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Delete
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Feedback
  const [feedback, setFeedback] = useState('')

  const hasPassword = user?.passwordEnabled

  async function handleSaveName() {
    setNameSaving(true)
    setNameSuccess(false)
    const result = await updateAccountName(name.trim())
    setNameSaving(false)
    if (result.success) {
      setNameSuccess(true)
      setFeedback(t('accountUpdated'))
      setTimeout(() => { setNameSuccess(false); setFeedback('') }, 2000)
    }
  }

  async function handleSaveEmail() {
    setEmailSaving(true)
    setEmailError('')
    const result = await updateAccountEmail(email.trim())
    setEmailSaving(false)
    if (result.error) {
      setEmailError(result.error)
    } else {
      setEditingEmail(false)
      setFeedback(t('accountUpdated'))
      setTimeout(() => setFeedback(''), 2000)
    }
  }

  async function handleSavePassword() {
    setPasswordSaving(true)
    setPasswordError('')
    try {
      if (hasPassword) {
        await user?.updatePassword({ currentPassword, newPassword })
      } else {
        await user?.updatePassword({ newPassword })
      }
      setEditingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setFeedback(t('accountUpdated'))
      setTimeout(() => setFeedback(''), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update password'
      setPasswordError(message)
    }
    setPasswordSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteAccount()
    if (result.error) {
      setDeleting(false)
      return
    }
    await signOut({ redirectUrl: '/' })
  }

  const deleteWord = t('accountDeleteConfirm').includes('verwijder') ? 'verwijder' : 'delete'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg border-t sm:border border-stone-200 dark:border-stone-700 max-h-[85vh] sm:max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-0">
          <div className="w-10 h-1 bg-stone-300 dark:bg-stone-600 rounded-full" />
        </div>

        {/* Header — compact on mobile */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 dark:border-stone-700 shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100">{t('accountProfile')}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">
          {/* Feedback toast */}
          {feedback && (
            <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 px-3 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {feedback}
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('accountName')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2.5 sm:py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleSaveName}
                  disabled={nameSaving || name.trim() === (user?.firstName || '')}
                  className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation shrink-0"
                >
                  {nameSaving ? '...' : nameSuccess ? '✓' : t('save')}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('accountEmail')}</label>
              {!editingEmail ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-stone-600 dark:text-stone-400 truncate min-w-0">{user?.primaryEmailAddress?.emailAddress}</span>
                  <button
                    onClick={() => { setEditingEmail(true); setEmail(user?.primaryEmailAddress?.emailAddress || '') }}
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline shrink-0 touch-manipulation"
                  >
                    {t('accountChange')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError('') }}
                    className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEmail}
                      disabled={emailSaving || !email.trim() || email.trim() === user?.primaryEmailAddress?.emailAddress}
                      className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
                    >
                      {emailSaving ? '...' : t('save')}
                    </button>
                    <button
                      onClick={() => { setEditingEmail(false); setEmailError('') }}
                      className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors touch-manipulation"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('accountPassword')}</label>
              {!editingPassword ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    {hasPassword ? '••••••••' : '—'}
                  </span>
                  <button
                    onClick={() => setEditingPassword(true)}
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline touch-manipulation"
                  >
                    {hasPassword ? t('accountChangePassword') : t('accountSetPassword')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {hasPassword && (
                    <input
                      type="password"
                      placeholder={t('accountCurrentPassword')}
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setPasswordError('') }}
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  )}
                  <input
                    type="password"
                    placeholder={t('accountNewPassword')}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPasswordError('') }}
                    className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePassword}
                      disabled={passwordSaving || !newPassword || (hasPassword && !currentPassword)}
                      className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
                    >
                      {passwordSaving ? '...' : t('save')}
                    </button>
                    <button
                      onClick={() => { setEditingPassword(false); setPasswordError(''); setCurrentPassword(''); setNewPassword('') }}
                      className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors touch-manipulation"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger zone */}
          <div className="px-4 sm:px-6 pb-6 pt-1">
            {!showDelete ? (
              <button
                onClick={() => setShowDelete(true)}
                className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:underline touch-manipulation py-1"
              >
                {t('accountDeleteTitle')}
              </button>
            ) : (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 space-y-3">
                <p className="text-sm text-red-700 dark:text-red-300">{t('accountDeleteDesc')}</p>
                <input
                  type="text"
                  placeholder={t('accountDeleteConfirm')}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting || deleteConfirm.toLowerCase() !== deleteWord}
                    className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  >
                    {deleting ? '...' : t('accountDeleteButton')}
                  </button>
                  <button
                    onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                    className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors touch-manipulation"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
