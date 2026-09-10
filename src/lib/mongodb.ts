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

// Disable Mongoose bufferCommands globally so queries fail fast rather than hanging serverless lambdas
mongoose.set('bufferCommands', false);

/**
 * Clean, strip surrounding quotes, and safely encode username/password in MongoDB URI.
 * Handles unencoded special characters in the database password (such as @, #, %, +, :, /)
 * without corrupting the connection string.
 */
export function normalizeMongoUri(raw: string): { uri: string; error: string | null } {
  if (!raw || !raw.trim()) {
    return { uri: '', error: 'MONGODB_URI environment variable is not set.' };
  }

  let uri = raw.trim();

  // Strip leading and trailing quotes (common when copying from Vercel dashboard or env files)
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  // Ensure valid MongoDB scheme
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return {
      uri,
      error:
        'Invalid protocol: MongoDB connection string must start with "mongodb://" or "mongodb+srv://".',
    };
  }

  const isSrv = uri.startsWith('mongodb+srv://');
  const scheme = isSrv ? 'mongodb+srv://' : 'mongodb://';
  const rest = uri.slice(scheme.length);

  // Find where the authority part ends (first slash or question mark)
  const slashIdx = rest.indexOf('/');
  const questionIdx = rest.indexOf('?');
  let authorityEnd = rest.length;

  if (slashIdx !== -1 && questionIdx !== -1) {
    authorityEnd = Math.min(slashIdx, questionIdx);
  } else if (slashIdx !== -1) {
    authorityEnd = slashIdx;
  } else if (questionIdx !== -1) {
    authorityEnd = questionIdx;
  }

  const authority = rest.slice(0, authorityEnd);
  const pathAndQuery = rest.slice(authorityEnd);

  // Find the LAST '@' in the authority part (which separates user:pass from hosts)
  const lastAt = authority.lastIndexOf('@');
  if (lastAt === -1) {
    // No credentials in connection string
    return { uri: scheme + authority + pathAndQuery, error: null };
  }

  const userinfo = authority.slice(0, lastAt);
  const hosts = authority.slice(lastAt + 1);

  const colonIdx = userinfo.indexOf(':');
  let username = userinfo;
  let password = '';

  if (colonIdx !== -1) {
    username = userinfo.slice(0, colonIdx);
    password = userinfo.slice(colonIdx + 1);
  }

  // URL-decode first if already partially encoded, then safely encode
  let safeUser = username;
  let safePass = password;
  try {
    safeUser = encodeURIComponent(decodeURIComponent(username));
  } catch (e) {
    safeUser = encodeURIComponent(username);
  }

  try {
    safePass = encodeURIComponent(decodeURIComponent(password));
  } catch (e) {
    safePass = encodeURIComponent(password);
  }

  const authString = safePass ? `${safeUser}:${safePass}@` : `${safeUser}@`;
  const cleanUri = `${scheme}${authString}${hosts}${pathAndQuery}`;

  return { uri: cleanUri, error: null };
}

/**
 * Mask the password in a MongoDB URI so it can be safely logged without exposing secrets.
 */
export function maskMongoUri(raw: string): string {
  if (!raw || !raw.trim()) return '(not configured)';
  const normalized = normalizeMongoUri(raw);
  const target = normalized.uri || raw;
  return target.replace(
    /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/,
    '$1****$3'
  );
}

/**
 * Classify a database connection error into an actionable, safe message.
 */
export function classifyMongoError(err: unknown): string {
  if (!err) return 'Unknown database error occurred.';
  const msg = typeof err === 'object' && err !== null && 'message' in err
    ? String((err as any).message)
    : String(err);

  if (msg.includes('bad auth') || msg.toLowerCase().includes('authentication failed')) {
    return 'MongoDB Atlas authentication failed. Please verify the database username and password configured in your MONGODB_URI environment variable.';
  }

  if (
    msg.includes('ECONNREFUSED 127.0.0.1') ||
    msg.includes('ECONNREFUSED localhost') ||
    msg.includes('127.0.0.1:27017')
  ) {
    return 'Database connection refused: The application attempted to connect to local MongoDB at 127.0.0.1:27017, but no local MongoDB server is running. Please update MONGODB_URI to your MongoDB Atlas connection string (mongodb+srv://...).';
  }

  if (
    msg.includes('MongoServerSelectionError') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('ECONNREFUSED') ||
    msg.toLowerCase().includes('timed out')
  ) {
    return 'MongoDB Atlas cluster unreachable. Please ensure "0.0.0.0/0" (Allow Access from Anywhere) is added to your MongoDB Atlas Network Access IP Access List.';
  }

  if (msg.includes('Invalid scheme') || msg.includes('Invalid protocol') || msg.includes('Invalid connection string')) {
    return 'Invalid MONGODB_URI format. The connection string must start with "mongodb://" or "mongodb+srv://".';
  }

  if (msg.includes('is not set') || msg.includes('missing') || msg.includes('MONGODB_URI environment variable is missing')) {
    return 'MONGODB_URI environment variable is missing. Please set MONGODB_URI in your Vercel Project Settings or .env.local file.';
  }

  return `Database connection error: ${msg}`;
}

/**
 * Retrieve the active MongoDB URI from available environment variables.
 * Prioritizes MONGODB_URI, then DATABASE_URL, MONGODB_URL, MONGO_URL.
 */
export function getMongoUri(): string {
  const raw =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URL ||
    '';
  return raw.trim();
}

/**
 * Check whether a MongoDB connection string is provided in the environment.
 */
export function isDatabaseConfigured(): boolean {
  return getMongoUri().length > 0;
}

/**
 * Connect to MongoDB with connection caching for Next.js serverless runtimes.
 * Automatically handles cold starts, reconnects, special characters in passwords,
 * and robust timeout handling. Never silently falls back to localhost.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const rawUri = getMongoUri();
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  if (!rawUri) {
    const errorMsg =
      'MONGODB_URI environment variable is missing. Please configure MONGODB_URI in your Vercel Project Settings or .env.local file.';
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const { uri: cleanUri, error: parseError } = normalizeMongoUri(rawUri);
  if (parseError) {
    console.error(`[Database Error] ${parseError}`);
    throw new Error(parseError);
  }

  // Explicitly prevent connecting to localhost / 127.0.0.1 in production
  if (isProd && (cleanUri.includes('localhost') || cleanUri.includes('127.0.0.1'))) {
    const errorMsg =
      'Invalid production database configuration: MONGODB_URI is pointing to localhost / 127.0.0.1. A remote MongoDB Atlas connection string (mongodb+srv://...) must be configured in Vercel.';
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 1. Return existing connected instance immediately
  if (mongoose.connection.readyState === 1) {
    if (cached) cached.conn = mongoose;
    return mongoose;
  }

  // 2. Wait for in-flight connection if one is already pending
  if (mongoose.connection.readyState === 2) {
    try {
      if (cached?.promise) {
        await cached.promise;
      } else {
        await mongoose.connection.asPromise();
      }
      if (cached) cached.conn = mongoose;
      return mongoose;
    } catch (pendingErr) {
      if (cached) {
        cached.conn = null;
        cached.promise = null;
      }
      const classified = classifyMongoError(pendingErr);
      console.error(`[Database Error] Pending connection failed: ${classified}`);
      throw new Error(classified);
    }
  }

  // 3. Clear stale cache if connection was dropped
  if (cached && mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  // 4. Create new connection promise with serverless-tuned options
  if (!cached?.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      dbName: 'team_arka',
    };

    const masked = maskMongoUri(cleanUri);
    console.log(`[Database] Connecting to MongoDB: ${masked}`);

    cached!.promise = mongoose
      .connect(cleanUri, opts)
      .then((instance) => {
        cached!.conn = instance;
        console.log(`[Database] Successfully connected to MongoDB: ${masked}`);
        return instance;
      })
      .catch((err) => {
        cached!.promise = null;
        cached!.conn = null;
        const classified = classifyMongoError(err);
        console.error(`[Database Error] Connection failed to ${masked}: ${classified}`);
        throw new Error(classified);
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
