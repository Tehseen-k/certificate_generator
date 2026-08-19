import { hashPassword, verifyPassword } from '@/lib/password';
import { restGetDocument, restSetDocument } from '@/lib/firestore-rest';

const ADMIN_COLLECTION = 'admins';
const ADMIN_DOC_ID = 'admin';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'Admin@1234';

type AdminRecord = {
  username: string;
  passwordHash: string;
};

async function readAdminRecord(): Promise<AdminRecord | null> {
  const document = await restGetDocument(ADMIN_COLLECTION, ADMIN_DOC_ID);
  if (!document?.fields) return null;
  const username = document.fields.username?.stringValue || '';
  const passwordHash = document.fields.passwordHash?.stringValue || '';
  if (!username || !passwordHash) return null;
  return { username, passwordHash };
}

async function writeAdminRecord(username: string, passwordHash: string): Promise<void> {
  await restSetDocument(ADMIN_COLLECTION, ADMIN_DOC_ID, {
    username: { stringValue: username },
    passwordHash: { stringValue: passwordHash },
  });
}

async function ensureAdminRecord(): Promise<AdminRecord> {
  const existing = await readAdminRecord();
  if (existing) return existing;

  const created: AdminRecord = {
    username: DEFAULT_USERNAME,
    passwordHash: hashPassword(DEFAULT_PASSWORD),
  };
  await writeAdminRecord(created.username, created.passwordHash);
  return created;
}

export async function validateAdminLogin(
  username: string,
  password: string
): Promise<{ ok: boolean; username?: string; error?: string }> {
  try {
    const record = await ensureAdminRecord();
    if (username !== record.username || !verifyPassword(password, record.passwordHash)) {
      return { ok: false };
    }
    return { ok: true, username: record.username };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not reach Firestore for login.',
    };
  }
}

export async function changeAdminPassword(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters.' };
  }

  try {
    const record = await readAdminRecord();
    if (!record) {
      return { ok: false, error: 'Admin account was not found in Firestore.' };
    }
    if (username !== record.username || !verifyPassword(currentPassword, record.passwordHash)) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    await writeAdminRecord(record.username, hashPassword(newPassword));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not update password in Firestore.',
    };
  }
}
