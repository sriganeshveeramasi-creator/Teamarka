import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid contact.' },
        { status: 400 }
      );
    }

    // Safe security behavior: never reveal whether an account exists
    return NextResponse.json(
      {
        success: true,
        message: 'If an account is associated with this contact, secure password recovery instructions have been dispatched.',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Unable to process recovery request.' },
      { status: 500 }
    );
  }
}
