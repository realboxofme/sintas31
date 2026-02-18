import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get user by ID (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getSessionUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pengguna' },
      { status: 500 }
    );
  }
}

// PUT: Update user (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getSessionUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { email, password, name, role, jabatan, nip, phone, avatar, isActive } = body;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'kepala', 'staff'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Role tidak valid. Pilihan: admin, kepala, staff' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh pengguna lain' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
      jabatan?: string | null;
      nip?: string | null;
      phone?: string | null;
      avatar?: string | null;
      isActive?: boolean;
    } = {};

    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (jabatan !== undefined) updateData.jabatan = jabatan || null;
    if (nip !== undefined) updateData.nip = nip || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash new password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const user = await db.user.update({
      where: { id },
      data: updateData,
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
      message: 'Pengguna berhasil diperbarui',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui pengguna' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getSessionUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete user
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengguna berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus pengguna' },
      { status: 500 }
    );
  }
}
