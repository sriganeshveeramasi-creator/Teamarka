import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { getActivityLogs } from '@/lib/db';

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

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const timeLimit = searchParams.get('time') || 'all';

    const logs = await getActivityLogs({ status, timeLimit });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error retrieving activity logs.' },
      { status: 500 }
    );
  }
}
