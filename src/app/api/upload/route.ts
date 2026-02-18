import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan PDF, Word, Excel, atau gambar.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10MB.' },
        { status: 400 }
      );
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return file info
    const fileUrl = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Gagal mengunggah file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'URL file tidak diberikan' },
        { status: 400 }
      );
    }

    // Security: Only allow deleting files from uploads directory
    if (!fileUrl.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus file ini' },
        { status: 403 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', fileUrl);
    
    // Check if file exists and delete
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus file' },
      { status: 500 }
    );
  }
}
