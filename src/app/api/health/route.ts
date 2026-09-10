import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import {
  connectToDatabase,
  classifyMongoError,
  isDatabaseConfigured,
  getDatabaseUsername,
} from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Safe server-side database health endpoint.
 * Reports only connection state ("connected" | "disconnected") and sanitized error category.
 * NEVER outputs passwords, connection strings, or credentials.
 */
export async function GET() {
  const configured = isDatabaseConfigured();
  const configuredUser = getDatabaseUsername();

  if (!configured) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: 'MONGODB_URI environment variable is missing.',
        configuredUser: null,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  try {
    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      // Ping the database to verify active round-trip communication
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }

      return NextResponse.json(
        {
          status: 'ok',
          database: 'connected',
          configuredUser: configuredUser || 'present',
          dbName: mongoose.connection.name || 'team_arka',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
          message: 'Database connection is not in ready state.',
          configuredUser: configuredUser || 'present',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (err: unknown) {
    const sanitizedError = classifyMongoError(err);
    console.error('[Health Check Error]:', sanitizedError);

    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: sanitizedError,
        configuredUser: configuredUser || 'present',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
