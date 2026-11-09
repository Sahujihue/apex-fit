import { NextResponse } from 'next/server';
import { getCookieName } from '@/lib/auth/jwt';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(getCookieName());
  return response;
}
