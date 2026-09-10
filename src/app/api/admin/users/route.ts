import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { getAllUsers } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error retrieving users.' },
      { status: 500 }
    );
  }
}
