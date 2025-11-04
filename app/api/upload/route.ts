import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. Auth check
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse form data
    const formData = await request.formData()
    const fileEntry = formData.get('file')
    const courseIdEntry = formData.get('courseId')
    const fileDescriptionEntry = formData.get('fileDescription')

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!courseIdEntry || typeof courseIdEntry !== 'string' || courseIdEntry.trim().length === 0) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    const fileDescription =
      typeof fileDescriptionEntry === 'string'
        ? fileDescriptionEntry.trim() || null
        : null

    const file = fileEntry
    const courseId = courseIdEntry.trim()

    const { data: courseRecord, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('user_id', session.user.id)
      .single()

    if (courseError || !courseRecord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          maxSize: '10MB',
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowed: 'PDF, PPT, Word documents only',
          received: file.type,
        },
        { status: 400 },
      )
    }

    // 4. Generate secure filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${session.user.id}/${courseId}/${timestamp}_${sanitizedName}`

    // 5. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError || !uploadData) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        {
          error: 'Upload failed',
          details: uploadError?.message ?? 'Unknown upload error',
        },
        { status: 500 },
      )
    }

    // 6. Get file URL (signed URL for private access)
    const { data: urlData, error: signedUrlError } = await supabase.storage
      .from('course-documents')
      .createSignedUrl(filePath, 31536000) // 1 year expiry

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json(
        {
          error: 'Upload failed',
          details: signedUrlError.message,
        },
        { status: 500 },
      )
    }

    // 7. Save metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert({
        user_id: session.user.id,
        course_id: courseId,
        file_name: file.name,
        file_url: uploadData.path,
        file_type: file.type,
        file_size: file.size,
        file_description: fileDescription,
        processing_status: 'pending',
        processing_error: null,
        extracted_text: null,
        metadata: {
          original_name: file.name,
          mime_type: file.type,
          size_mb: (file.size / 1024 / 1024).toFixed(2),
          uploaded_at: new Date().toISOString(),
        },
      } as never)
      .select()
      .single()

    if (dbError || !fileRecord) {
      // Cleanup uploaded file if DB insert fails
      await supabase.storage.from('course-documents').remove([filePath])

      console.error('Database error:', dbError)
      return NextResponse.json(
        {
          error: 'Failed to save file metadata',
          details: dbError?.message ?? 'Unknown database error',
        },
        { status: 500 },
      )
    }

    // 8. Trigger file processing (async)
    // This will be handled by n8n workflow later

    return NextResponse.json({
      success: true,
      file: {
        id: (fileRecord as any).id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.signedUrl,
        description: fileDescription,
        processing_status: 'pending',
        uploaded_at: (fileRecord as any).created_at,
      },
    })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: message,
      },
      { status: 500 },
    )
  }
}

// GET: List uploaded files for a course
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')?.trim()

    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    const { data: courseRecord, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('user_id', session.user.id)
      .single()

    if (courseError || !courseRecord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: files, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error || !files) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to fetch files' },
        { status: 500 },
      )
    }

    // Generate signed URLs for files
    const filesWithUrls = await Promise.all(
      files.map(async (file: any) => {
        if (!file.file_url) {
          return {
            ...file,
            signed_url: null,
          }
        }

        const { data: urlData, error: signedUrlError } = await supabase.storage
          .from('course-documents')
          .createSignedUrl(file.file_url, 3600) // 1 hour

        if (signedUrlError) {
          console.error('Signed URL error:', signedUrlError)
        }

        return {
          ...file,
          signed_url: urlData?.signedUrl ?? null,
        }
      }),
    )

    return NextResponse.json({ files: filesWithUrls })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Remove uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')?.trim()

    if (!fileId) {
      return NextResponse.json({ error: 'fileId required' }, { status: 400 })
    }

    // Get file info
    const { data: file, error: fetchError } = await supabase
      .from('file_uploads')
      .select('file_url, user_id')
      .eq('id', fileId)
      .single()

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Verify ownership
    if ((file as any).user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from storage
    if ((file as any).file_url) {
      const { error: storageError } = await supabase.storage
        .from('course-documents')
        .remove([(file as any).file_url])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', fileId)
      .eq('user_id', session.user.id)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
