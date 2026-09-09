import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './mongodb';
import { User, IUser } from '@/models/User';
import { ActivityLog, IActivityLog } from '@/models/ActivityLog';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'user' | 'admin';
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

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'activityLogs.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      // Ignore
    }
  }
}

function readLocalUsers(): UserRecord[] {
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
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    // Ignore
  }
}

function readLocalLogs(): ActivityRecord[] {
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
  ensureDataDir();
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {
    // Ignore
  }
}

/**
 * Seed default admin account if not already present
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
 * Create a new user in MongoDB and synchronize with local fallback store
 */
export async function createUser(data: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role?: 'user' | 'admin';
}): Promise<UserRecord> {
  const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const normalizedEmail = data.email.trim().toLowerCase();

  const userRecord: UserRecord = {
    id,
    name: data.name.trim(),
    email: normalizedEmail,
    phone: data.phone?.trim(),
    passwordHash: data.passwordHash,
    role: data.role || 'user',
    status: 'Active',
    createdAt: now,
    lastLogin: null,
  };

  // Try MongoDB
  try {
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      const doc = await User.create({
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        passwordHash: userRecord.passwordHash,
        role: userRecord.role,
        status: userRecord.status,
      });
      userRecord.id = doc._id.toString();
    }
  } catch (err) {
    // MongoDB fallback
  }

  // Always sync local store
  const local = readLocalUsers();
  local.push(userRecord);
  writeLocalUsers(local);

  return userRecord;
}

/**
 * Find user by email or phone
 */
export async function findUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  // Try MongoDB
  try {
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      const doc = await User.findOne({
        $or: [{ email: clean }, { phone: clean }],
      }).lean();
      if (doc) {
        return {
          id: (doc as any)._id.toString(),
          name: (doc as any).name,
          email: (doc as any).email,
          phone: (doc as any).phone,
          passwordHash: (doc as any).passwordHash,
          role: (doc as any).role,
          status: (doc as any).status,
          createdAt: (doc as any).createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: (doc as any).lastLogin ? (doc as any).lastLogin.toISOString() : null,
        };
      }
    }
  } catch (err) {
    // Fall back to local file
  }

  const local = readLocalUsers();
  const found = local.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.phone && u.phone.toLowerCase() === clean)
  );

  return found || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<UserRecord | null> {
  if (!id) return null;

  try {
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      const doc = await User.findById(id).lean();
      if (doc) {
        return {
          id: (doc as any)._id.toString(),
          name: (doc as any).name,
          email: (doc as any).email,
          phone: (doc as any).phone,
          passwordHash: (doc as any).passwordHash,
          role: (doc as any).role,
          status: (doc as any).status,
          createdAt: (doc as any).createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: (doc as any).lastLogin ? (doc as any).lastLogin.toISOString() : null,
        };
      }
    }
  } catch (err) {
    // Fall back to local file
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

  try {
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      await User.updateOne(
        { $or: [{ email: clean }, { phone: clean }] },
        { $set: { lastLogin: now } }
      );
    }
  } catch (err) {
    // Fall back
  }

  const local = readLocalUsers();
  const idx = local.findIndex(
    (u) => u.email.toLowerCase() === clean || (u.phone && u.phone.toLowerCase() === clean)
  );
  if (idx !== -1) {
    local[idx].lastLogin = now.toISOString();
    writeLocalUsers(local);
  }
}

/**
 * Get all registered users (excluding password hashes)
 */
export async function getAllUsers(): Promise<Omit<UserRecord, 'passwordHash'>[]> {
  try {
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      const docs = await User.find().sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          id: d._id.toString(),
          name: d.name,
          email: d.email,
          phone: d.phone,
          role: d.role,
          status: d.status,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          lastLogin: d.lastLogin ? new Date(d.lastLogin).toISOString() : null,
        }));
      }
    }
  } catch (err) {
    // Fall back
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
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      await ActivityLog.create({
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
    }
  } catch (err) {
    // Fall back
  }

  const local = readLocalLogs();
  local.unshift(record);
  // Keep last 500 logs locally
  if (local.length > 500) local.length = 500;
  writeLocalLogs(local);

  return record;
}

/**
 * Retrieve activity logs with optional status and time filters
 */
export async function getActivityLogs(filters?: {
  status?: string;
  timeLimit?: string;
}): Promise<ActivityRecord[]> {
  let logs: ActivityRecord[] = [];

  try {
    const mongooseConn = await connectToDatabase();
    if (mongooseConn) {
      const query: any = {};
      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status.toUpperCase();
      }
      if (filters?.timeLimit === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        query.timestamp = { $gte: startOfDay };
      }

      const docs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(100).lean();
      if (docs && docs.length > 0) {
        logs = docs.map((d: any) => ({
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
        return logs;
      }
    }
  } catch (err) {
    // Fall back
  }

  logs = readLocalLogs();

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
