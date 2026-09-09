import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByIdentifier, createUser, recordActivity, seedInitialAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await seedInitialAdmin();

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

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 2. Validate email or mobile format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
    const isMobile = /^(\+91[\-\s]?)?[6-9]\d{9}$/.test(cleanIdentifier.replace(/[\s\-]/g, ''));

    if (!isEmail && !isMobile) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address or 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // 3. Password validation
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 4. Password confirmation match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // 5. Prevent duplicate registration
    const existing = await findUserByIdentifier(cleanIdentifier);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email or mobile already registered.' },
        { status: 409 }
      );
    }

    // 6. Secure Password Hashing
    const passwordHash = await bcrypt.hash(password, 10);

    const assignedRole: 'user' | 'admin' = role === 'admin' ? 'admin' : 'user';

    // 7. Store user
    const newUser = await createUser({
      name: name.trim(),
      email: isEmail ? cleanIdentifier : `${cleanIdentifier.replace(/\D/g, '')}@mobile.arka`,
      phone: isMobile ? cleanIdentifier : phone?.trim(),
      passwordHash,
      role: assignedRole,
    });

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    // 8. Record signup activity
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
        message: 'Account created successfully. Please login.',
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
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
