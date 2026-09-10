import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb';
import { User, IUser, UserRole } from '@/models/User';
import { ActivityLog, IActivityLog } from '@/models/ActivityLog';

export type { UserRole };

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  status: 'Active' | 'Disabled';
  createdAt: string;
  lastLogin?: string | null;
}

export interface ActivityRecord {
  id: string;
  userId?: string;
  name?: string;
  email: string;
  role: string;
  action: 'LOGIN' | 'LOGOUT' | 'SIGNUP';
  status: 'SUCCESS' | 'FAILED';
  reason?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'activityLogs.json');

function ensureDataDir() {
  if (isProd) return; // Do not attempt filesystem writes in Vercel serverless
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      // Ignore
    }
  }
}

function readLocalUsers(): UserRecord[] {
  if (isProd) return [];
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocalUsers(users: UserRecord[]) {
  if (isProd) return;
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    // Ignore in serverless
  }
}

function readLocalLogs(): ActivityRecord[] {
  if (isProd) return [];
  ensureDataDir();
  if (!fs.existsSync(LOGS_FILE)) return [];
  try {
    const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocalLogs(logs: ActivityRecord[]) {
  if (isProd) return;
  ensureDataDir();
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {
    // Ignore in serverless
  }
}

/**
 * Normalize an input phone number into pure digits for reliable querying
 */
export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(-10);
  }
  if (digits.length > 10 && digits.startsWith('0')) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Optional seed admin helper (used for setup and automated testing)
 */
export async function seedInitialAdmin(): Promise<void> {
  const existingAdmin = await findUserByIdentifier('admin@arka-ne.gov.in');
  if (!existingAdmin) {
    const adminPassHash = await bcrypt.hash('Admin@2026', 10);
    await createUser({
      name: 'State Fleet Director',
      email: 'admin@arka-ne.gov.in',
      phone: '+91 98640 10001',
      passwordHash: adminPassHash,
      role: 'admin',
    });
  }
}

/**
 * Create a new user in MongoDB (with development offline fallback)
 */
export async function createUser(data: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role?: UserRole;
}): Promise<UserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedPhone = data.phone?.trim();
  const role: UserRole = data.role || 'user';
  const now = new Date();

  let mongoUser: UserRecord | null = null;
  let mongoError: Error | null = null;

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      const doc = await User.create({
        name: data.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash: data.passwordHash,
        role,
        status: 'Active',
        createdAt: now,
      });

      mongoUser = {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        passwordHash: doc.passwordHash,
        role: doc.role as UserRole,
        status: doc.status as 'Active' | 'Disabled',
        createdAt: doc.createdAt.toISOString(),
        lastLogin: null,
      };
    }
  } catch (err: any) {
    mongoError = err;
    console.error('[Database Error] Failed to create user in MongoDB:', err.message);
  }

  if (mongoUser) {
    // Keep local sync in dev only
    try {
      const local = readLocalUsers();
      local.push(mongoUser);
      writeLocalUsers(local);
    } catch (e) {
      // Ignore
    }
    return mongoUser;
  }

  // In production, do not silently swallow MongoDB failure
  if (isProd) {
    throw new Error(
      mongoError?.message || 'Database error: Unable to create user in production MongoDB database.'
    );
  }

  // Development-only fallback
  const fallbackUser: UserRecord = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash: data.passwordHash,
    role,
    status: 'Active',
    createdAt: now.toISOString(),
    lastLogin: null,
  };

  const local = readLocalUsers();
  local.push(fallbackUser);
  writeLocalUsers(local);

  return fallbackUser;
}

/**
 * Find user by email or phone with robust multi-format matching
 */
export async function findUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const digits = clean.replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

  // 1. Primary: Query MongoDB
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      const conditions: any[] = [
        { email: clean },
        { phone: clean },
      ];

      if (digits.length >= 7) {
        conditions.push(
          { phone: digits },
          { phone: last10 },
          { phone: `+91${last10}` },
          { phone: `+91 ${last10}` },
          { email: `${digits}@mobile.arka` },
          { email: `${last10}@mobile.arka` }
        );
      }

      const doc = await User.findOne({ $or: conditions }).lean();

      if (doc) {
        return {
          id: (doc as any)._id.toString(),
          name: (doc as any).name,
          email: (doc as any).email,
          phone: (doc as any).phone,
          passwordHash: (doc as any).passwordHash,
          role: (doc as any).role as UserRole,
          status: (doc as any).status as 'Active' | 'Disabled',
          createdAt: (doc as any).createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: (doc as any).lastLogin ? (doc as any).lastLogin.toISOString() : null,
        };
      }

      if (isProd) {
        return null;
      }
    } else if (isProd) {
      throw new Error('Database connection failed: MongoDB is not connected.');
    }
  } catch (err: any) {
    console.error('[Database Error] Failed to lookup user in MongoDB:', err.message);
    if (isProd) {
      throw new Error(err?.message || 'Unable to connect to MongoDB');
    }
  }

  // 2. Development-only fallback
  if (isProd) return null;
  const local = readLocalUsers();
  const found = local.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.phone && u.phone.toLowerCase() === clean) ||
      (digits.length >= 7 && u.phone && u.phone.replace(/\D/g, '').includes(last10)) ||
      (digits.length >= 7 && u.email && u.email.includes(last10))
  );

  return found || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<UserRecord | null> {
  if (!id) return null;

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      const doc = await User.findById(id).lean();
      if (doc) {
        return {
          id: (doc as any)._id.toString(),
          name: (doc as any).name,
          email: (doc as any).email,
          phone: (doc as any).phone,
          passwordHash: (doc as any).passwordHash,
          role: (doc as any).role as UserRole,
          status: (doc as any).status as 'Active' | 'Disabled',
          createdAt: (doc as any).createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: (doc as any).lastLogin ? (doc as any).lastLogin.toISOString() : null,
        };
      }
    }
  } catch (err: any) {
    console.error('[Database Error] Failed to find user by ID in MongoDB:', err.message);
    if (isProd) throw err;
  }

  const local = readLocalUsers();
  return local.find((u) => u.id === id) || null;
}

/**
 * Update user's lastLogin timestamp
 */
export async function updateUserLastLogin(identifier: string): Promise<void> {
  const now = new Date();
  const clean = identifier.trim().toLowerCase();
  const digits = clean.replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      const conditions: any[] = [
        { email: clean },
        { phone: clean },
      ];
      if (digits.length >= 7) {
        conditions.push(
          { phone: digits },
          { phone: last10 },
          { email: `${digits}@mobile.arka` },
          { email: `${last10}@mobile.arka` }
        );
      }
      await User.updateOne({ $or: conditions }, { $set: { lastLogin: now } });
    }
  } catch (err: any) {
    console.warn('[Database Warning] Could not update lastLogin:', err.message);
  }

  try {
    const local = readLocalUsers();
    const idx = local.findIndex(
      (u) => u.email.toLowerCase() === clean || (u.phone && u.phone.toLowerCase() === clean)
    );
    if (idx !== -1) {
      local[idx].lastLogin = now.toISOString();
      writeLocalUsers(local);
    }
  } catch (e) {
    // Ignore in serverless
  }
}

/**
 * Get all registered users (excluding password hashes)
 */
export async function getAllUsers(): Promise<Omit<UserRecord, 'passwordHash'>[]> {
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      const docs = await User.find().sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          id: d._id.toString(),
          name: d.name,
          email: d.email,
          phone: d.phone,
          role: d.role as UserRole,
          status: d.status,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          lastLogin: d.lastLogin ? new Date(d.lastLogin).toISOString() : null,
        }));
      }
      return [];
    }
  } catch (err: any) {
    console.error('[Database Error] Failed to retrieve users from MongoDB:', err.message);
    if (isProd) {
      throw err;
    }
  }

  const local = readLocalUsers();
  return local.map(({ passwordHash, ...safe }) => safe);
}

/**
 * Record an activity (login, logout, signup attempt)
 */
export async function recordActivity(data: {
  userId?: string;
  name?: string;
  email: string;
  role?: string;
  action: 'LOGIN' | 'LOGOUT' | 'SIGNUP';
  status: 'SUCCESS' | 'FAILED';
  reason?: string;
  ip?: string;
  userAgent?: string;
}): Promise<ActivityRecord> {
  const now = new Date().toISOString();
  const record: ActivityRecord = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: data.userId,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    role: data.role || 'user',
    action: data.action,
    status: data.status,
    reason: data.reason,
    ip: data.ip,
    userAgent: data.userAgent,
    timestamp: now,
  };

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      const doc = await ActivityLog.create({
        userId: record.userId,
        name: record.name,
        email: record.email,
        role: record.role,
        action: record.action,
        status: record.status,
        reason: record.reason,
        ip: record.ip,
        userAgent: record.userAgent,
        timestamp: new Date(record.timestamp),
      });
      record.id = doc._id.toString();
    }
  } catch (err: any) {
    console.warn('[Database Warning] Could not persist activity log in MongoDB:', err.message);
  }

  try {
    const local = readLocalLogs();
    local.unshift(record);
    if (local.length > 500) local.length = 500;
    writeLocalLogs(local);
  } catch (e) {
    // Ignore in serverless
  }

  return record;
}

/**
 * Retrieve activity logs with optional status and time filters
 */
export async function getActivityLogs(filters?: {
  status?: string;
  timeLimit?: string;
}): Promise<ActivityRecord[]> {
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status.toUpperCase();
      }
      if (filters?.timeLimit === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        query.timestamp = { $gte: startOfDay };
      }

      const limit = filters?.timeLimit === 'recent' ? 20 : 100;
      const docs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(limit).lean();

      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          id: d._id.toString(),
          userId: d.userId,
          name: d.name,
          email: d.email,
          role: d.role,
          action: d.action,
          status: d.status,
          reason: d.reason,
          ip: d.ip,
          userAgent: d.userAgent,
          timestamp: d.timestamp ? new Date(d.timestamp).toISOString() : new Date().toISOString(),
        }));
      }
      return [];
    }
  } catch (err: any) {
    console.error('[Database Error] Failed to retrieve logs from MongoDB:', err.message);
    if (isProd) {
      throw err;
    }
  }

  let logs = readLocalLogs();
  if (filters?.status && filters.status !== 'all') {
    const targetStatus = filters.status.toUpperCase();
    logs = logs.filter((l) => l.status === targetStatus);
  }
  if (filters?.timeLimit === 'today') {
    const todayStr = new Date().toISOString().slice(0, 10);
    logs = logs.filter((l) => l.timestamp.slice(0, 10) === todayStr);
  } else if (filters?.timeLimit === 'recent') {
    logs = logs.slice(0, 20);
  }

  return logs;
}
