import { FirebaseError } from 'firebase/app';
import type { User, UserCredential } from 'firebase/auth';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { FirebaseServices } from './firebase';
import { initializeFirebase } from './firebase';

const GOOGLE_AUTHENTICATION_ERROR_MESSAGES: Readonly<
  Partial<Record<string, string>>
> = {
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using another sign-in method.',
  'auth/cancelled-popup-request':
    'The previous Google sign-in request was canceled.',
  'auth/network-request-failed':
    'Unable to connect. Check your internet connection and try again.',
  'auth/operation-not-allowed':
    'Google authentication is currently unavailable.',
  'auth/popup-blocked':
    'The Google sign-in popup was blocked. Allow popups and try again.',
  'auth/popup-closed-by-user':
    'Google sign-in was canceled.',
  'auth/too-many-requests':
    'Too many authentication attempts. Please wait and try again.',
  'auth/unauthorized-domain':
    'This website is not authorized for Google authentication.',
};

export async function authenticateWithGoogle(): Promise<User> {
  const firebaseServices: FirebaseServices =
    initializeFirebase();

  const provider: GoogleAuthProvider =
    new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const credential: UserCredential =
    await signInWithPopup(
      firebaseServices.auth,
      provider,
    );

  return credential.user;
}

export function getGoogleAuthenticationErrorMessage(
  error: unknown,
): string {
  return error instanceof FirebaseError
    ? (GOOGLE_AUTHENTICATION_ERROR_MESSAGES[error.code] ??
        'Google authentication failed. Please try again.')
    : 'Google authentication failed. Please try again.';
}
