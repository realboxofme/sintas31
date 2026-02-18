import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: List all users (admin only)
export async function GET() {
  try {
    const currentUser = await getSessionUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' },
        { status: 403 }
      );
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jabatan: true,
        nip: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pengguna' },
      { status: 500 }
    );
  }
}

// POST: Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSessionUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, jabatan, nip, phone, avatar, isActive } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama harus diisi' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'kepala', 'staff'];
    const userRole = role || 'staff';
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Role tidak valid. Pilihan: admin, kepala, staff' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        jabatan: jabatan || null,
        nip: nip || null,
        phone: phone || null,
        avatar: avatar || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jabatan: true,
        nip: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengguna berhasil dibuat',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat pengguna' },
      { status: 500 }
    );
  }
}
