import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  const token = request.cookies.get('auth_token')?.value;
  const isLoggedIn = token ? verifyToken(token) : false;

  return NextResponse.json({ isLoggedIn });
}