import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

mongoose.set('bufferCommands', false);

/**
 * Retrieve the active MongoDB URI from available environment variables.
 * Supports MONGODB_URI, DATABASE_URL, MONGODB_URL, and MONGO_URL.
 */
export function getMongoUri(): string {
  const uri =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URL ||
    '';
  return uri.trim();
}

/**
 * Check whether a MongoDB connection string is provided in the environment.
 */
export function isDatabaseConfigured(): boolean {
  return getMongoUri().length > 0;
}

/**
 * Connect to MongoDB with connection caching for Next.js serverless runtimes.
 * Automatically handles cold starts, reconnects, and robust timeout handling.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = getMongoUri();

  // In production (e.g. Vercel), a real database URI must be provided
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  if (!uri) {
    if (isProd) {
      const errorMsg =
        'Database connection failed: Neither MONGODB_URI nor DATABASE_URL is configured in your Vercel Environment Variables. Please set MONGODB_URI in Vercel Project Settings.';
      console.error(`[Database Error] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    // In local development without MONGODB_URI configured, return null to use local fallback instantly
    return null;
  }

  const connectionUri = uri;

  // Return cached connection if healthy
  if (cached && cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection dropped, clear cached connection
  if (cached && cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached?.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    cached!.promise = mongoose
      .connect(connectionUri, opts)
      .then((instance) => {
        return instance;
      })
      .catch((err) => {
        cached!.promise = null;
        cached!.conn = null;
        console.error('[Database Error] Mongoose connection attempt failed:', err.message);
        throw err;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    cached!.promise = null;
    cached!.conn = null;
    throw err;
  }

  return cached!.conn;
}
