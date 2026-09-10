import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByIdentifier, createUser, recordActivity, UserRole } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, identifier, phone, password, confirmPassword, role } = body;

    // 1. Required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email or mobile number is required.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required.' },
        { status: 400 }
      );
    }

    // 2. Validate email or phone format
    const cleanIdentifier = identifier.trim().toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
    const isMobile = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(cleanIdentifier.replace(/[\s\-]/g, ''));

    if (!isEmail && !isMobile) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address or 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 3. Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 4. Confirm password match
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // 5. Prevent duplicate registration
    let existing;
    try {
      existing = await findUserByIdentifier(cleanIdentifier);
    } catch (dbErr: any) {
      console.error('[Signup Error] Database lookup failed:', dbErr?.message || dbErr);
      return NextResponse.json(
        {
          success: false,
          message:
            dbErr?.message ||
            'Database connection error. Please verify MONGODB_URI in your Vercel project environment variables.',
        },
        { status: 503 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email or mobile number is already registered. Please log in.' },
        { status: 409 }
      );
    }

    // 6. Secure Password Hashing
    const passwordHash = await bcrypt.hash(password, 10);

    const assignedRole: UserRole = role === 'admin' ? 'admin' : role === 'officer' ? 'officer' : 'user';

    // 7. Store user in database
    let newUser;
    try {
      const pureDigits = cleanIdentifier.replace(/\D/g, '');
      const userPhone = isMobile ? cleanIdentifier : phone?.trim();
      const userEmail = isEmail ? cleanIdentifier : `${pureDigits.slice(-10)}@mobile.arka`;

      newUser = await createUser({
        name: name.trim(),
        email: userEmail,
        phone: userPhone,
        passwordHash,
        role: assignedRole,
      });
    } catch (createErr: any) {
      console.error('[Signup Error] Failed to persist user in database:', createErr?.message || createErr);
      return NextResponse.json(
        {
          success: false,
          message:
            createErr?.message ||
            'Failed to save account to database. Please check your database connection or try again.',
        },
        { status: 503 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    // 8. Record signup activity in activity logs
    await recordActivity({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      action: 'SIGNUP',
      status: 'SUCCESS',
      ip,
      userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please login with your credentials.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Signup Route Exception]:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
