import type { User } from 'firebase/auth';

export interface AppSession {
  authenticatedAt: number;
  avatarUrl?: string;
  displayName: string;
  email: string;
}

export type AppSessionReadResult =
  | { status: 'empty' }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { session: AppSession; status: 'valid' };

export const APP_SESSION_STORAGE_KEY: string = 'minigames:adlet92:app-session';

export const APP_SESSION_LIFETIME_MS: number = 5 * 60 * 1000;

const APP_SESSION_FIELDS: ReadonlySet<string> = new Set<string>([
  'displayName',
  'email',
  'authenticatedAt',
  'avatarUrl',
]);

function getFallbackDisplayName(email: string): string {
  const localPart: string = email.split('@', 1)[0]?.trim() ?? '';

  return localPart.length >= 2 && localPart.length <= 30 ? localPart : 'MiniGamer';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isAppSession(value: unknown): value is AppSession {
  if (!isRecord(value)) {
    return false;
  }

  const displayName: unknown = value['displayName'];
  const email: unknown = value['email'];
  const authenticatedAt: unknown = value['authenticatedAt'];
  const avatarUrl: unknown = value['avatarUrl'];

  const hasValidAvatarUrl: boolean =
    avatarUrl === undefined || (typeof avatarUrl === 'string' && avatarUrl.trim().length > 0);

  const hasOnlyAllowedFields: boolean = Object.keys(value).every((key: string): boolean =>
    APP_SESSION_FIELDS.has(key),
  );

  return (
    typeof displayName === 'string' &&
    typeof email === 'string' &&
    email.trim().length > 0 &&
    typeof authenticatedAt === 'number' &&
    Number.isSafeInteger(authenticatedAt) &&
    authenticatedAt > 0 &&
    hasValidAvatarUrl &&
    hasOnlyAllowedFields
  );
}

export function isAppSessionExpired(
  session: AppSession,
  currentTime: number = Date.now(),
): boolean {
  return currentTime - session.authenticatedAt >= APP_SESSION_LIFETIME_MS;
}

export function storeAppSession(session: AppSession): void {
  localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function removeAppSession(): void {
  localStorage.removeItem(APP_SESSION_STORAGE_KEY);
}

export function readAppSession(currentTime: number = Date.now()): AppSessionReadResult {
  const storedValue: string | undefined =
    localStorage.getItem(APP_SESSION_STORAGE_KEY) ?? undefined;

  if (storedValue === undefined) {
    return { status: 'empty' };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(storedValue) as unknown;
  } catch {
    return { status: 'invalid' };
  }

  if (!isAppSession(parsedValue)) {
    return { status: 'invalid' };
  }

  if (parsedValue.authenticatedAt > currentTime) {
    return { status: 'invalid' };
  }

  return isAppSessionExpired(parsedValue, currentTime)
    ? { status: 'expired' }
    : {
        session: parsedValue,
        status: 'valid',
      };
}

export function createAppSession(user: User): AppSession {
  const email: string | undefined = user.email?.trim() || undefined;

  if (email === undefined) {
    throw new Error('The authenticated Firebase user has no email.');
  }

  const firebaseDisplayName: string | undefined = user.displayName?.trim() || undefined;

  const avatarUrl: string | undefined = user.photoURL?.trim() || undefined;

  const session: AppSession = {
    authenticatedAt: Date.now(),
    displayName: firebaseDisplayName ?? getFallbackDisplayName(email),
    email,
    ...(avatarUrl !== undefined && { avatarUrl }),
  };

  storeAppSession(session);

  return session;
}
