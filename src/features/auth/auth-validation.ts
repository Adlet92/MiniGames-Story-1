export type AuthValidationMode = 'login' | 'register';

export type AuthFieldName = 'email' | 'username' | 'password' | 'confirmPassword';

export interface AuthFormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export type AuthValidationErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN: RegExp = /^[A-Za-z0-9]+$/;
const USERNAME_START_PATTERN: RegExp = /^[A-Z]/;
const UPPERCASE_PATTERN: RegExp = /[A-Z]/;
const DIGIT_PATTERN: RegExp = /\d/;
const SPECIAL_CHARACTER_PATTERN: RegExp = /[^A-Za-z0-9]/;
const PASSWORD_ALLOWED_PATTERN: RegExp = /^[\x21-\x7E]+$/;

const USERNAME_MIN_LENGTH: number = 2;
const USERNAME_MAX_LENGTH: number = 30;
const PASSWORD_MIN_LENGTH: number = 6;

function validateEmail(email: string): string | undefined {
  const normalizedEmail: string = email.trim();

  if (normalizedEmail.length === 0) {
    return 'Email is required.';
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

function validateUsername(username: string): string | undefined {
  const normalizedUsername: string = username.trim();

  if (normalizedUsername.length === 0) {
    return 'Username is required.';
  }

  if (
    normalizedUsername.length < USERNAME_MIN_LENGTH ||
    normalizedUsername.length > USERNAME_MAX_LENGTH
  ) {
    return 'Username must contain 2–30 characters.';
  }

  if (!USERNAME_START_PATTERN.test(normalizedUsername)) {
    return 'Username must start with an uppercase English letter.';
  }

  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return 'Username may contain English letters and digits only.';
  }

  return undefined;
}

function validateLoginPassword(password: string): string | undefined {
  if (password.length === 0) {
    return 'Password is required.';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'Password must contain at least 6 characters.';
  }

  return undefined;
}

function validateRegistrationPassword(password: string): string | undefined {
  if (password.length === 0) {
    return 'Password is required.';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'Password must contain at least 6 characters.';
  }

  if (!PASSWORD_ALLOWED_PATTERN.test(password)) {
    return 'Use English letters, digits, and special characters without spaces.';
  }

  if (!UPPERCASE_PATTERN.test(password)) {
    return 'Password must contain an uppercase English letter.';
  }

  if (!DIGIT_PATTERN.test(password)) {
    return 'Password must contain a digit.';
  }

  if (!SPECIAL_CHARACTER_PATTERN.test(password)) {
    return 'Password must contain a special character.';
  }

  return undefined;
}

function validateConfirmation(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (confirmPassword.length === 0) {
    return 'Please confirm your password.';
  }

  if (confirmPassword !== password) {
    return 'Passwords do not match.';
  }

  return undefined;
}

export function validateAuthValues(
  mode: AuthValidationMode,
  values: AuthFormValues,
): AuthValidationErrors {
  const errors: AuthValidationErrors = {};
  const emailError: string | undefined = validateEmail(values.email);

  if (emailError !== undefined) {
    errors.email = emailError;
  }

  if (mode === 'login') {
    const passwordError: string | undefined = validateLoginPassword(values.password);

    if (passwordError !== undefined) {
      errors.password = passwordError;
    }

    return errors;
  }

  const usernameError: string | undefined = validateUsername(values.username);
  const passwordError: string | undefined = validateRegistrationPassword(values.password);
  const confirmationError: string | undefined = validateConfirmation(
    values.password,
    values.confirmPassword,
  );

  if (usernameError !== undefined) {
    errors.username = usernameError;
  }

  if (passwordError !== undefined) {
    errors.password = passwordError;
  }

  if (confirmationError !== undefined) {
    errors.confirmPassword = confirmationError;
  }

  return errors;
}

export function isAuthFormValid(
  mode: AuthValidationMode,
  values: AuthFormValues,
): boolean {
  return Object.keys(validateAuthValues(mode, values)).length === 0;
}
