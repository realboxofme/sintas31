import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  jabatan: string | null;
  nip: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
}

const SESSION_COOKIE_NAME = 'sintas_session';
const SESSION_EXPIRY_DAYS = 7;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a session for a user by setting a cookie
 */
export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + SESSION_EXPIRY_DAYS);
  
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiryDate,
    path: '/',
  });
}

/**
 * Get the current session user ID from cookie
 */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return sessionId || null;
}

/**
 * Get the current session user
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  
  const user = await db.user.findUnique({
    where: { id: userId },
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
    },
  });
  
  if (!user || !user.isActive) return null;
  
  return user;
}

/**
 * Clear the session by removing the cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === 'admin';
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return user !== null;
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { email },
  });
  
  if (!user || !user.isActive) return null;
  
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jabatan: user.jabatan,
    nip: user.nip,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
  };
}
