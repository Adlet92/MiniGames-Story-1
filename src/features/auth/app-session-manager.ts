import { signOut } from 'firebase/auth';
import type { FirebaseServices } from '../../services/firebase';
import { initializeFirebase } from '../../services/firebase';
import type { AppSession, AppSessionReadResult } from '../../state/app-session';
import {
  APP_SESSION_LIFETIME_MS,
  readAppSession,
  removeAppSession,
  storeAppSession,
} from '../../state/app-session';

export interface AppSessionManagerOptions {
  onSessionChange: (session: AppSession | undefined) => void;
  onSessionExpired: () => void;
  onSignOutFailure: () => void;
}

export interface AppSessionManager {
  accept: (session: AppSession) => void;
  check: () => AppSession | undefined;
  clear: () => void;
  getSession: () => AppSession | undefined;
  requireSession: (onAuthenticationRequired: () => void) => AppSession | undefined;
  start: () => void;
  stop: () => void;
}

type SessionEndReason = 'empty' | 'expired' | 'invalid' | 'logout';

async function signOutFirebase(): Promise<void> {
  const firebaseServices: FirebaseServices = initializeFirebase();

  await signOut(firebaseServices.auth);
}

function hasSameSession(firstSession: AppSession | undefined, secondSession: AppSession): boolean {
  return (
    firstSession !== undefined &&
    firstSession.authenticatedAt === secondSession.authenticatedAt &&
    firstSession.email === secondSession.email &&
    firstSession.displayName === secondSession.displayName &&
    firstSession.avatarUrl === secondSession.avatarUrl
  );
}

export function createAppSessionManager(options: AppSessionManagerOptions): AppSessionManager {
  let currentSession: AppSession | undefined;
  let expirationTimer: number | undefined;
  let hasStarted: boolean = false;
  let hasGuestState: boolean = false;
  let hasShownExpiration: boolean = false;

  const clearExpirationTimer: () => void = (): void => {
    if (expirationTimer === undefined) {
      return;
    }

    clearTimeout(expirationTimer);
    expirationTimer = undefined;
  };

  const requestFirebaseSignOut: () => void = (): void => {
    void signOutFirebase().catch((): void => {
      options.onSignOutFailure();
    });
  };

  const scheduleExpiration: (session: AppSession) => void = (session: AppSession): void => {
    clearExpirationTimer();

    const expiresAt: number = session.authenticatedAt + APP_SESSION_LIFETIME_MS;

    const remainingTime: number = Math.max(0, expiresAt - Date.now());

    expirationTimer = setTimeout((): void => {
      check();
    }, remainingTime);
  };

  const transitionToGuest: (reason: SessionEndReason) => void = (
    reason: SessionEndReason,
  ): void => {
    const shouldNotifyExpiration: boolean = reason === 'expired' && !hasShownExpiration;

    clearExpirationTimer();
    currentSession = undefined;
    hasGuestState = true;
    removeAppSession();
    requestFirebaseSignOut();
    options.onSessionChange(undefined);

    if (!shouldNotifyExpiration) {
      return;
    }

    hasShownExpiration = true;
    options.onSessionExpired();
  };

  const applyReadResult: (result: AppSessionReadResult) => AppSession | undefined = (
    result: AppSessionReadResult,
  ): AppSession | undefined => {
    if (result.status === 'valid') {
      const shouldUpdateUi: boolean = !hasSameSession(currentSession, result.session);

      currentSession = result.session;
      hasGuestState = false;
      scheduleExpiration(result.session);

      if (shouldUpdateUi) {
        options.onSessionChange(result.session);
      }

      return result.session;
    }

    if (hasGuestState && result.status === 'empty') {
      return undefined;
    }

    transitionToGuest(result.status);

    return undefined;
  };

  function check(): AppSession | undefined {
    return applyReadResult(readAppSession());
  }

  const accept: (session: AppSession) => void = (session: AppSession): void => {
    storeAppSession(session);
    currentSession = session;
    hasGuestState = false;
    hasShownExpiration = false;
    scheduleExpiration(session);
    options.onSessionChange(session);
  };

  const clear: () => void = (): void => {
    transitionToGuest('logout');
  };

  const getSession: () => AppSession | undefined = (): AppSession | undefined => currentSession;

  const requireSession: (onAuthenticationRequired: () => void) => AppSession | undefined = (
    onAuthenticationRequired: () => void,
  ): AppSession | undefined => {
    const session: AppSession | undefined = check();

    if (session === undefined) {
      onAuthenticationRequired();
    }

    return session;
  };

  const handleVisibilityChange: () => void = (): void => {
    if (document.visibilityState === 'visible') {
      check();
    }
  };

  const handleWindowFocus: () => void = (): void => {
    check();
  };

  const start: () => void = (): void => {
    if (hasStarted) {
      return;
    }

    hasStarted = true;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    addEventListener('focus', handleWindowFocus);

    check();
  };

  const stop: () => void = (): void => {
    if (!hasStarted) {
      return;
    }

    hasStarted = false;
    clearExpirationTimer();

    document.removeEventListener('visibilitychange', handleVisibilityChange);

    removeEventListener('focus', handleWindowFocus);
  };

  return {
    accept,
    check,
    clear,
    getSession,
    requireSession,
    start,
    stop,
  };
}
