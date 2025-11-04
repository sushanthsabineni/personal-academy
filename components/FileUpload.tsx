'use client'

import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

interface UploadItem {
  tempId: string
  name: string
  size: number
  type: string
  status: UploadStatus
  progress: number
  description: string | null
  file?: File
  id?: string
  url?: string | null
  uploadedAt?: string
  processingStatus?: string | null
  error?: string
}

interface FileUploadProps {
  courseId: string
  onUploadComplete?: () => void
}

interface UploadResponse {
  success: boolean
  file: {
    id: string
    name: string
    size: number
    type: string
    url: string
    description: string | null
    processing_status: string
    uploaded_at: string
  }
}

interface FilesResponse {
  files: Array<{
    id: string
    file_name: string
    file_size: number | null
    file_type: string | null
    file_description: string | null
    processing_status: string | null
    signed_url: string | null
    created_at: string
  }>
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ALLOWED_TYPES_LABEL = ALLOWED_TYPES.join(', ')

const generateTempId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const formatFileSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

export function FileUpload({ courseId, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)
  const [fileDescription, setFileDescription] = useState('')
  const [deletingIds, setDeletingIds] = useState<string[]>([])

  const mergeExistingFiles = useCallback((existing: UploadItem[]) => {
    setFiles((prev) => {
      const inFlight = prev.filter((item) => !item.id)
      return [...existing, ...inFlight]
    })
  }, [])

  const fetchExistingFiles = useCallback(async () => {
    setLoadingExisting(true)
    try {
      const response = await fetch(`/api/upload?courseId=${encodeURIComponent(courseId)}`)
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error ?? 'Failed to fetch files')
      }

      const data = (await response.json().catch(() => ({}))) as FilesResponse
      const mapped: UploadItem[] = (data.files ?? []).map((file) => ({
        tempId: file.id,
        id: file.id,
        name: file.file_name,
        size: file.file_size ?? 0,
        type: file.file_type ?? 'application/octet-stream',
        status: 'success',
        progress: 100,
        description: file.file_description ?? null,
        url: file.signed_url ?? null,
        uploadedAt: file.created_at,
        processingStatus: file.processing_status ?? null,
      }))

      mergeExistingFiles(mapped)
    } catch (error) {
      console.error('Failed to load uploaded files', error)
      toast.error('Unable to load uploaded files.')
    } finally {
      setLoadingExisting(false)
    }
  }, [courseId, mergeExistingFiles])

  useEffect(() => {
    fetchExistingFiles()
  }, [fetchExistingFiles])

  const updateFileEntry = useCallback((tempId: string, updates: Partial<UploadItem>) => {
    setFiles((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, ...updates } : item)),
    )
  }, [])

  const handleUploadSingle = useCallback(
    async (item: UploadItem) => {
      if (!item.file) return

      updateFileEntry(item.tempId, {
        status: 'uploading',
        progress: 10,
        error: undefined,
      })

      try {
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('courseId', courseId)
        if (item.description) {
          formData.append('fileDescription', item.description)
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const responseBody = (await response.json().catch(() => ({}))) as
          | UploadResponse
          | { error?: string }
          | Record<string, unknown>

        if (!response.ok || typeof responseBody !== 'object' || responseBody === null) {
          const errorMessage =
            ('error' in responseBody && typeof responseBody.error === 'string'
              ? responseBody.error
              : 'Upload failed') || 'Upload failed'
          throw new Error(errorMessage)
        }

        if (!('success' in responseBody) || !responseBody.success || !('file' in responseBody)) {
          const errorMessage =
            ('error' in responseBody && typeof responseBody.error === 'string'
              ? responseBody.error
              : 'Upload failed') || 'Upload failed'
          throw new Error(errorMessage)
        }

        const data = responseBody as UploadResponse

        updateFileEntry(item.tempId, {
          status: 'success',
          progress: 100,
          id: data.file.id,
          name: data.file.name,
          size: data.file.size,
          type: data.file.type,
          url: data.file.url,
          description: data.file.description,
          uploadedAt: data.file.uploaded_at,
          processingStatus: data.file.processing_status,
        })

        toast.success(`${item.name} uploaded successfully`)
      } catch (error) {
        console.error('File upload failed', error)
        const message = error instanceof Error ? error.message : 'Upload failed'
        updateFileEntry(item.tempId, {
          status: 'error',
          progress: 0,
          error: message,
        })
        toast.error(`Failed to upload ${item.name}`)
      }
    },
    [courseId, updateFileEntry],
  )

  const handleUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target
      const selectedFiles = Array.from(input.files ?? [])
      input.value = ''

      if (!selectedFiles.length) {
        return
      }

      for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds the 10MB limit`)
          return
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not an allowed file type`)
          return
        }
      }

      const currentDescription = fileDescription.trim() || null

      const uploadItems = selectedFiles.map<UploadItem>((file) => ({
        tempId: generateTempId(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
        description: currentDescription,
        file,
      }))

      setFiles((prev) => [...prev, ...uploadItems])
      setUploading(true)

      try {
        for (const item of uploadItems) {
          await handleUploadSingle(item)
        }

        onUploadComplete?.()
      } finally {
        setUploading(false)
      }
    },
    [fileDescription, handleUploadSingle, onUploadComplete],
  )

  const handleRemove = useCallback(
    async (item: UploadItem) => {
      if (item.status === 'uploading') {
        return
      }

      if (!item.id) {
        setFiles((prev) => prev.filter((file) => file.tempId !== item.tempId))
        return
      }

      setDeletingIds((prev) => [...prev, item.tempId])

      try {
        const response = await fetch(`/api/upload?fileId=${encodeURIComponent(item.id)}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null)
          throw new Error(errorBody?.error ?? 'Failed to delete file')
        }

        setFiles((prev) => prev.filter((file) => file.tempId !== item.tempId))
        toast.success(`${item.name} removed`)
      } catch (error) {
        console.error('Failed to delete file', error)
        toast.error(error instanceof Error ? error.message : 'Failed to delete file')
      } finally {
        setDeletingIds((prev) => prev.filter((id) => id !== item.tempId))
      }
    },
    [],
  )

  const isDeleting = useCallback(
    (tempId: string) => deletingIds.includes(tempId),
    [deletingIds],
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">File Description (Optional)</label>
        <input
          type="text"
          value={fileDescription}
          onChange={(e) => setFileDescription(e.target.value)}
          placeholder="e.g., 'Use as reference for terminology'"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800"
          disabled={uploading}
        />
        <p className="text-xs text-gray-500 mt-1">How should AI interpret this document?</p>
      </div>

      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
        <div className="flex flex-col items-center">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-gray-500">PDF, PPT, Word (Max 10MB)</span>
        </div>
        <input
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.ppt,.pptx,.doc,.docx"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {loadingExisting && files.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading uploaded files...
        </div>
      ) : null}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileData) => {
            const deleting = isDeleting(fileData.tempId)
            return (
              <div
                key={fileData.tempId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-5 h-5 text-teal-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{fileData.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileData.size)} · {fileData.type || 'Unknown type'}
                    </p>
                    {fileData.description ? (
                      <p className="text-xs text-gray-500 mt-1">Note: {fileData.description}</p>
                    ) : null}
                    {fileData.processingStatus ? (
                      <p className="text-xs text-gray-500 mt-1">
                        Processing status: {fileData.processingStatus}
                      </p>
                    ) : null}

                    {fileData.status === 'uploading' && (
                      <div className="mt-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 transition-all duration-300"
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                    )}

                    {fileData.status === 'error' && fileData.error ? (
                      <p className="text-xs text-red-500 mt-1">{fileData.error}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {fileData.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                  )}
                  {fileData.status === 'success' && !deleting && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {fileData.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {deleting && <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />}

                  {fileData.status !== 'uploading' && (
                    <button
                      type="button"
                      onClick={() => handleRemove(fileData)}
                      className="text-red-500 hover:text-red-700"
                      disabled={deleting}
                      title="Remove file"
                    >
                      {fileData.id ? (
                        <Trash2 className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!uploading ? (
        <p className="text-xs text-gray-500">
          Allowed file types: {ALLOWED_TYPES_LABEL}. Maximum size: 10MB each.
        </p>
      ) : null}
    </div>
  )
}
