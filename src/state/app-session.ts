import type { User } from 'firebase/auth';

export interface AppSession {
  authenticatedAt: number;
  avatarUrl?: string;
  displayName: string;
  email: string;
}

export const APP_SESSION_STORAGE_KEY: string =
  'minigames:adlet92:app-session';

export const APP_SESSION_LIFETIME_MS: number =
  5 * 60 * 1000;

function getFallbackDisplayName(
  email: string,
): string {
  const localPart: string =
    email.split('@').at(0) ?? 'MiniGamer';

  return localPart.length >= 2 &&
    localPart.length <= 30
    ? localPart
    : 'MiniGamer';
}

export function createAppSession(
  user: User,
): AppSession {
  const email: string | undefined =
    user.email ?? undefined;

  if (email === undefined) {
    throw new Error(
      'The authenticated Firebase user has no email.',
    );
  }

  const firebaseDisplayName: string | undefined =
    user.displayName?.trim() || undefined;

  const avatarUrl: string | undefined =
    user.photoURL ?? undefined;

  const session: AppSession = {
    authenticatedAt: Date.now(),
    displayName:
      firebaseDisplayName ??
      getFallbackDisplayName(email),
    email,
    ...(avatarUrl !== undefined && {
      avatarUrl,
    }),
  };

  localStorage.setItem(
    APP_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );

  return session;
}
