import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
]

// Max size 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Supabase client (backend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'public'

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diunggah' },
        { status: 400 }
      )
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung' },
        { status: 400 }
      )
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 10MB' },
        { status: 400 }
      )
    }

    // Generate safe filename
    const timestamp = Date.now()
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${cleanName}`

    // Path di Supabase Storage
    const filePath = `${folder}/${fileName}`

    // Upload ke Supabase Storage bucket "dokumen"
    const { error } = await supabase.storage
      .from('dokumen')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Ambil public URL
    const { data } = supabase.storage
      .from('dokumen')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      file: {
        url: data.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
      },
    })

  } catch (error: any) {
    console.error('Upload error:', error)

    return NextResponse.json(
      { error: 'Gagal upload file' },
      { status: 500 }
    )
  }
}

