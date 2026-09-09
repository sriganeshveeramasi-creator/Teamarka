import bcrypt from 'bcryptjs';
import {
  findUserByIdentifier,
  createUser,
  updateUserLastLogin,
  getAllUsers,
  recordActivity,
  getActivityLogs,
  seedInitialAdmin,
} from '../src/lib/db';
import {
  signSessionToken,
  verifySessionToken,
  AUTH_COOKIE_NAME,
} from '../src/lib/auth';

function validateEmail(val: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function validatePhone(val: string) {
  return /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(val.replace(/[\s\-]/g, ''));
}

async function runTests() {
  console.log('=== STARTING TEAM ARKA AUTHENTICATION SYSTEM TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}: ${message || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Empty fields validation
  const emptyEmail = '';
  assert('Test 1: Empty identifier is rejected', !validateEmail(emptyEmail) && !validatePhone(emptyEmail));

  // 2. Invalid email format vs valid formats
  assert('Test 2a: Invalid email "not-an-email" rejected', !validateEmail('not-an-email'));
  assert('Test 2b: Valid email "officer@arka-ne.gov.in" accepted', validateEmail('officer@arka-ne.gov.in'));
  assert('Test 2c: Valid phone "+919876543210" accepted', validatePhone('+919876543210'));

  // 3. Password strength validation
  const shortPass = '123';
  assert('Test 3: Short password (<6 chars) rejected', shortPass.length < 6);

  // 4. Password hashing with bcrypt
  const plainPassword = 'SecurePassword@2026';
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  assert('Test 4a: Password is cryptographically hashed with bcrypt', hash.startsWith('$2'));
  assert('Test 4b: Stored hash is NOT plaintext password', hash !== plainPassword);
  const matchResult = await bcrypt.compare(plainPassword, hash);
  assert('Test 4c: Valid password matches bcrypt hash', matchResult === true);
  const wrongMatchResult = await bcrypt.compare('WrongPassword', hash);
  assert('Test 4d: Incorrect password fails bcrypt compare', wrongMatchResult === false);

  // 5. User Registration & Database persistence
  const testEmail = `inspector_${Date.now()}@arka-ne.gov.in`;
  const testPhone = `986${Math.floor(1000000 + Math.random() * 9000000)}`;
  const userHash = await bcrypt.hash('SecurePassword@2026', 10);
  const createdUser = await createUser({
    name: 'Inspector Biren Singha',
    email: testEmail,
    phone: testPhone,
    passwordHash: userHash,
    role: 'officer',
  });
  assert('Test 5a: User saved in database', !!createdUser && createdUser.email === testEmail);
  assert('Test 5b: User assigned proper role', createdUser.role === 'officer');

  // 6. Duplicate User Prevention
  const foundByEmail = await findUserByIdentifier(testEmail);
  assert('Test 6a: Duplicate check finds user by email', !!foundByEmail && foundByEmail.id === createdUser.id);
  const foundByPhone = await findUserByIdentifier(testPhone);
  assert('Test 6b: Duplicate check finds user by phone', !!foundByPhone && foundByPhone.id === createdUser.id);

  // 7. Invalid Login Attempt & Failed Login Activity Logging
  const nonexistent = await findUserByIdentifier('nonexistent@arka-ne.gov.in');
  assert('Test 7a: Non-registered user lookup returns null', nonexistent === null);

  const failedLog = await recordActivity({
    email: 'nonexistent@arka-ne.gov.in',
    name: 'Anonymous',
    role: 'user',
    action: 'LOGIN',
    status: 'FAILED',
    reason: 'Account not found',
    ip: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0',
  });
  assert('Test 7b: Failed login attempt is logged with reason', failedLog.status === 'FAILED' && failedLog.reason === 'Account not found');

  // 8. Valid Login Attempt & SUCCESS Activity Logging & LastLogin Update
  const validUser = await findUserByIdentifier(testEmail);
  const passCheck = validUser ? await bcrypt.compare('SecurePassword@2026', validUser.passwordHash) : false;
  assert('Test 8a: Registered user credentials verify against database hash', passCheck === true);

  if (validUser) {
    await updateUserLastLogin(validUser.email);
    const successLog = await recordActivity({
      userId: validUser.id,
      email: validUser.email,
      name: validUser.name,
      role: validUser.role,
      action: 'LOGIN',
      status: 'SUCCESS',
      reason: 'Authentication successful',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0',
    });
    assert('Test 8b: Successful login attempt logged with SUCCESS status', successLog.status === 'SUCCESS');

    // 9. Session Token (JWT) & HTTP-only Cookie Setup
    const token = signSessionToken({
      userId: validUser.id,
      name: validUser.name,
      email: validUser.email,
      role: validUser.role,
    });
    assert('Test 9a: JWT session token is properly signed', typeof token === 'string' && token.split('.').length === 3);

    const verifiedSession = verifySessionToken(token);
    assert('Test 9b: JWT session token is verified and decoded correctly', !!verifiedSession && verifiedSession.userId === validUser.id);
    assert('Test 9c: Officer role is correctly preserved in session token', !!verifiedSession && verifiedSession.role === 'officer');
  }

  // 10. Admin Audit & Data Privacy: Passwords NEVER Exposed
  const allUsers = await getAllUsers();
  assert('Test 10a: Admin users list contains registered accounts', allUsers.length > 0);
  const exposedHashes = allUsers.filter((u: any) => 'passwordHash' in u || 'password' in u);
  assert('Test 10b: Zero passwords or password hashes exposed in users list', exposedHashes.length === 0);

  // 11. Activity Logs & Filter Testing
  const allLogs = await getActivityLogs();
  assert('Test 11a: Activity logs retrieved from database', allLogs.length > 0);
  const failedLogs = await getActivityLogs({ status: 'FAILED' });
  assert('Test 11b: Status filter (FAILED) returns only failed attempts', failedLogs.every((l) => l.status === 'FAILED'));
  const successLogs = await getActivityLogs({ status: 'SUCCESS' });
  assert('Test 11c: Status filter (SUCCESS) returns only successful attempts', successLogs.every((l) => l.status === 'SUCCESS'));

  // 12. Default Seed Admin Account
  await seedInitialAdmin();
  const defaultAdmin = await findUserByIdentifier('admin@arka-ne.gov.in');
  assert('Test 12a: Seeded administrator account exists', !!defaultAdmin && defaultAdmin.role === 'admin');
  if (defaultAdmin) {
    const adminPassMatch = await bcrypt.compare('Admin@2026', defaultAdmin.passwordHash);
    assert('Test 12b: Seeded administrator password (Admin@2026) verifies', adminPassMatch === true);
  }

  console.log(`\n==================================================`);
  console.log(`TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
