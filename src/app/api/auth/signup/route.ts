import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByIdentifier, createUser, recordActivity, seedInitialAdmin, UserRole } from '@/lib/db';

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
    const existing = await findUserByIdentifier(cleanIdentifier);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email or mobile already registered.' },
        { status: 409 }
      );
    }

    // 6. Secure Password Hashing
    const passwordHash = await bcrypt.hash(password, 10);

    const assignedRole: UserRole = role === 'admin' ? 'admin' : role === 'officer' ? 'officer' : 'user';

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
