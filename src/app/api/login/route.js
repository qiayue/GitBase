import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export async function POST(request) {
  const { username, password } = await request.json();

  // Verify both username and password
  const validUsername = process.env.ACCESS_USERNAME;
  const validPassword = process.env.ACCESS_PASSWORD;

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }

  if (username === validUsername && password === validPassword) {
    const token = createToken(username);

    const response = NextResponse.json({
      message: 'Login successful',
      username: username
    }, { status: 200 });

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
    return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
  }
}