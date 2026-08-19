const COOKIE_NAME = 'cg_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    `${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'certificate-generator'}-session`
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return toBase64Url(signature);
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(data);
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export type SessionPayload = {
  u: string;
  exp: number;
};

export type PrintTokenPayload = {
  t: 'print';
  exp: number;
};

const PRINT_TOKEN_SECONDS = 10 * 60;

async function signPayload(payload: object): Promise<string> {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSign(body);
  return `${body}.${signature}`;
}

async function readSignedPayload<T extends { exp: number }>(token: string | undefined | null): Promise<T | null> {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  if (!(await hmacVerify(body, signature))) return null;
  try {
    const json = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(json) as T;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionToken(username: string): Promise<string> {
  return signPayload({
    u: username,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  });
}

export async function readSessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  const payload = await readSignedPayload<SessionPayload>(token);
  if (!payload?.u) return null;
  return payload;
}

export async function createPrintToken(): Promise<string> {
  return signPayload({
    t: 'print',
    exp: Math.floor(Date.now() / 1000) + PRINT_TOKEN_SECONDS,
  });
}

export async function readPrintToken(token: string | undefined | null): Promise<boolean> {
  const payload = await readSignedPayload<PrintTokenPayload>(token);
  return payload?.t === 'print';
}

export function sessionCookieOptions() {
  return {
    maxAge: MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

export { COOKIE_NAME };
