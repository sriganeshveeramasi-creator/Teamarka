import { NextRequest, NextResponse } from 'next/server';
import { recordActivity } from '@/lib/db';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        await recordActivity({
          userId: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
          action: 'LOGOUT',
          status: 'SUCCESS',
          ip,
          userAgent,
        });
      }
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully.' },
      { status: 200 }
    );

    // Clear session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    const response = NextResponse.json(
      { success: true, message: 'Logged out.' },
      { status: 200 }
    );
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}
