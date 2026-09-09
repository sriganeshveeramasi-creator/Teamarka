import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  findUserByIdentifier,
  updateUserLastLogin,
  recordActivity,
} from '@/lib/db';
import { signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    // 1. Basic validation
    if (!identifier || !identifier.trim() || !password) {
      return NextResponse.json(
        { success: false, message: 'Please enter your registered email/mobile and password.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 2. Find user in database
    let user;
    try {
      user = await findUserByIdentifier(cleanIdentifier);
    } catch (dbErr: any) {
      console.error('[Login Error] Database lookup failed:', dbErr?.message || dbErr);
      return NextResponse.json(
        {
          success: false,
          message:
            'Database connection error. Please verify MONGODB_URI or DATABASE_URL in your Vercel project environment variables.',
        },
        { status: 503 }
      );
    }

    // 3. If user not found
    if (!user) {
      await recordActivity({
        email: cleanIdentifier,
        role: 'unknown',
        action: 'LOGIN',
        status: 'FAILED',
        reason: 'User not found',
        ip,
        userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Invalid email/mobile or password.' },
        { status: 401 }
      );
    }

    // 4. Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await recordActivity({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        action: 'LOGIN',
        status: 'FAILED',
        reason: 'Incorrect password',
        ip,
        userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Invalid email/mobile or password.' },
        { status: 401 }
      );
    }

    // 5. Update lastLogin timestamp
    await updateUserLastLogin(user.email);

    // 6. Record successful login in activity logs
    await recordActivity({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      action: 'LOGIN',
      status: 'SUCCESS',
      ip,
      userAgent,
    });

    // 7. Create secure JWT session token
    const token = signSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 8. Create response and set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: new Date().toISOString(),
        },
      },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error: any) {
    console.error('[Login Route Exception]:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
