import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession } from '@/lib/auth';

// Login route - updated for recompilation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
