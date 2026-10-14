import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getApps, initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

type FirebaseEnvironmentVariable =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_APP_ID'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
}

function getRequiredEnvironmentVariable(variableName: FirebaseEnvironmentVariable): string {
  const value: string | undefined = import.meta.env[variableName];

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing Firebase environment variable: ${variableName}`);
  }

  return value;
}

function createFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: getRequiredEnvironmentVariable('VITE_FIREBASE_API_KEY'),

    appId: getRequiredEnvironmentVariable('VITE_FIREBASE_APP_ID'),

    authDomain: getRequiredEnvironmentVariable('VITE_FIREBASE_AUTH_DOMAIN'),

    messagingSenderId: getRequiredEnvironmentVariable('VITE_FIREBASE_MESSAGING_SENDER_ID'),

    projectId: getRequiredEnvironmentVariable('VITE_FIREBASE_PROJECT_ID'),

    storageBucket: getRequiredEnvironmentVariable('VITE_FIREBASE_STORAGE_BUCKET'),
  };
}

export function initializeFirebase(): FirebaseServices {
  const registeredApps: FirebaseApp[] = getApps();

  const registeredApp: FirebaseApp | undefined = registeredApps.at(0);

  const app: FirebaseApp = registeredApp ?? initializeApp(createFirebaseOptions());

  const auth: Auth = getAuth(app);

  return {
    app,
    auth,
  };
}
