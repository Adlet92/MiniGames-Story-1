import { FirebaseError } from 'firebase/app';
import type { User, UserCredential } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import type { FirebaseServices } from './firebase';
import { initializeFirebase } from './firebase';

interface LoginEmailAuthenticationRequest {
  email: string;
  mode: 'login';
  password: string;
}

interface SignupEmailAuthenticationRequest {
  email: string;
  mode: 'signup';
  password: string;
  username: string;
}

export type EmailAuthenticationRequest =
  LoginEmailAuthenticationRequest | SignupEmailAuthenticationRequest;

const AUTHENTICATION_ERROR_MESSAGES: Readonly<Partial<Record<string, string>>> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/network-request-failed': 'Unable to connect. Check your internet connection and try again.',
  'auth/operation-not-allowed': 'Email authentication is currently unavailable.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'The email or password is incorrect.',
  'auth/weak-password': 'The password does not meet the security requirements.',
  'auth/wrong-password': 'The email or password is incorrect.',
};

export async function authenticateWithEmail(request: EmailAuthenticationRequest): Promise<User> {
  const firebaseServices: FirebaseServices = initializeFirebase();

  const email: string = request.email.trim();

  if (request.mode === 'login') {
    const credential: UserCredential = await signInWithEmailAndPassword(
      firebaseServices.auth,
      email,
      request.password,
    );

    return credential.user;
  }

  const credential: UserCredential = await createUserWithEmailAndPassword(
    firebaseServices.auth,
    email,
    request.password,
  );

  await updateProfile(credential.user, {
    displayName: request.username.trim(),
  });

  return credential.user;
}

export function getAuthenticationErrorMessage(error: unknown): string {
  return error instanceof FirebaseError
    ? (AUTHENTICATION_ERROR_MESSAGES[error.code] ?? 'Authentication failed. Please try again.')
    : 'Authentication failed. Please try again.';
}
