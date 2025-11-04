'use client'

import { useState } from 'react'
import { migrateLocalStorageCourses, backupLocalStorageCourses, clearLegacyCourses } from '@/lib/courseMigration'
import { CheckCircle, XCircle, AlertTriangle, Download, Upload, Trash2 } from '@/lib/icons'

export default function MigrationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{
    success: number
    failed: number
    errors: string[]
    migratedCourses: string[]
  } | null>(null)

  const handleMigrate = async () => {
    if (!confirm('This will migrate your localStorage courses to the database. Continue?')) {
      return
    }

    setIsRunning(true)
    setResult(null)

    try {
      const migrationResult = await migrateLocalStorageCourses()
      setResult(migrationResult)
    } catch (error) {
      setResult({
        success: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        migratedCourses: []
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleBackup = () => {
    backupLocalStorageCourses()
  }

  const handleClear = () => {
    clearLegacyCourses()
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-8 border border-light-border dark:border-dark-border">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-3">
              Course Migration Tool
            </h1>
            <p className="text-light-muted dark:text-dark-muted">
              Migrate your existing courses from localStorage to the database for better reliability and sync across devices.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Important Information
              </h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                <li>• Make sure you&apos;re logged in before migrating</li>
                <li>• Backup your courses first (recommended)</li>
                <li>• Migration can take a few seconds</li>
                <li>• Don&apos;t close this page during migration</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            
            {/* Backup */}
            <button
              onClick={handleBackup}
              className="flex flex-col items-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
            >
              <Download className="text-blue-600 dark:text-blue-400" size={32} />
              <div className="text-center">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  1. Backup
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Download JSON backup
                </p>
              </div>
            </button>

            {/* Migrate */}
            <button
              onClick={handleMigrate}
              disabled={isRunning}
              className="flex flex-col items-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="text-green-600 dark:text-green-400" size={32} />
              <div className="text-center">
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                  2. Migrate
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {isRunning ? 'Migrating...' : 'Move to database'}
                </p>
              </div>
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              disabled={!result || result.success === 0}
              className="flex flex-col items-center gap-3 p-6 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              <div className="text-center">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  3. Clear
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Remove localStorage
                </p>
              </div>
            </button>

          </div>

          {/* Results */}
          {result && (
            <div className="border-t border-light-border dark:border-dark-border pt-6">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
                Migration Results
              </h2>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    <span className="font-semibold text-green-900 dark:text-green-200">
                      Successful
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {result.success}
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="text-red-600 dark:text-red-400" size={20} />
                    <span className="font-semibold text-red-900 dark:text-red-200">
                      Failed
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {result.failed}
                  </p>
                </div>
              </div>

              {/* Migrated Courses */}
              {result.migratedCourses.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                    Migrated Courses:
                  </h3>
                  <ul className="space-y-2">
                    {result.migratedCourses.map((course, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted"
                      >
                        <CheckCircle className="text-green-500" size={16} />
                        {course}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">
                    Errors:
                  </h3>
                  <ul className="space-y-2">
                    {result.errors.map((error, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded"
                      >
                        <XCircle className="flex-shrink-0 mt-0.5" size={16} />
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Message */}
              {result.success > 0 && result.failed === 0 && (
                <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-900 dark:text-green-200 font-medium">
                    🎉 All courses migrated successfully! You can now safely clear your localStorage.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
