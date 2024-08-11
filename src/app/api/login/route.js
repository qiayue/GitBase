import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export async function POST(request) {
  const { password } = await request.json();
  
  if (password === process.env.ACCESS_PASSWORD) {
    const token = createToken();
    
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;
  } else {
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  }
}