import { cookies } from 'next/headers';
import { COOKIE_NAME, readSessionToken } from '@/lib/session';

export async function getRequestSession() {
  const jar = await cookies();
  return readSessionToken(jar.get(COOKIE_NAME)?.value);
}
