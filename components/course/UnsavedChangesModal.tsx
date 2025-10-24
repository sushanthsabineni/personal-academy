'use client'

import { AlertTriangle } from '@/lib/icons'

interface UnsavedChangesModalProps {
  isOpen: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

export function UnsavedChangesModal({
  isOpen,
  onSave,
  onDiscard,
  onCancel
}: UnsavedChangesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl border-2 border-orange-500">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <AlertTriangle size={32} className="text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          Unsaved Changes
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          You have unsaved changes. Do you want to save your progress before leaving?
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onSave}
            className="w-full px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all"
          >
            Save & Continue
          </button>
          <button
            onClick={onDiscard}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
          >
            Discard Changes
          </button>
          <button
            onClick={onCancel}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
