export type AuthValidationMode = 'login' | 'register';

export type AuthFieldName =
  | 'email'
  | 'username'
  | 'password'
  | 'confirmPassword';

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
const PASSWORD_ALLOWED_PATTERN: RegExp = /^[\u{21}-\u{7E}]+$/u;

const USERNAME_MIN_LENGTH: number = 2;
const USERNAME_MAX_LENGTH: number = 30;
const PASSWORD_MIN_LENGTH: number = 6;

function validateEmail(email: string): string | undefined {
  const normalizedEmail: string = email.trim();

  if (normalizedEmail.length === 0) {
    return 'Email is required.';
  }

  return EMAIL_PATTERN.test(normalizedEmail)
    ? undefined
    : 'Enter a valid email address.';
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
    return 'Username must contain between 2 and 30 characters.';
  }

  if (!USERNAME_START_PATTERN.test(normalizedUsername)) {
    return 'Username must start with an uppercase English letter.';
  }

  return USERNAME_PATTERN.test(normalizedUsername)
    ? undefined
    : 'Username may contain only English letters and digits.';
}

function validateLoginPassword(password: string): string | undefined {
  if (password.length === 0) {
    return 'Password is required.';
  }

  return password.length >= PASSWORD_MIN_LENGTH
    ? undefined
    : 'Password must contain at least 6 characters.';
}

function validateRegistrationPassword(
  password: string,
): string | undefined {
  if (password.length === 0) {
    return 'Password is required.';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'Password must contain at least 6 characters.';
  }

  if (!PASSWORD_ALLOWED_PATTERN.test(password)) {
    return 'Password may contain only English letters, digits, and special characters.';
  }

  if (!UPPERCASE_PATTERN.test(password)) {
    return 'Password must contain an uppercase English letter.';
  }

  if (!DIGIT_PATTERN.test(password)) {
    return 'Password must contain a digit.';
  }

  return SPECIAL_CHARACTER_PATTERN.test(password)
    ? undefined
    : 'Password must contain a special character.';
}

function validateConfirmation(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (confirmPassword.length === 0) {
    return 'Please confirm your password.';
  }

  return confirmPassword === password
    ? undefined
    : 'Passwords do not match.';
}

function addError(
  errors: AuthValidationErrors,
  fieldName: AuthFieldName,
  message: string | undefined,
): void {
  if (message !== undefined) {
    errors[fieldName] = message;
  }
}

export function validateAuthValues(
  mode: AuthValidationMode,
  values: AuthFormValues,
): AuthValidationErrors {
  const errors: AuthValidationErrors = {};

  addError(errors, 'email', validateEmail(values.email));

  if (mode === 'login') {
    addError(
      errors,
      'password',
      validateLoginPassword(values.password),
    );

    return errors;
  }

  addError(errors, 'username', validateUsername(values.username));
  addError(
    errors,
    'password',
    validateRegistrationPassword(values.password),
  );
  addError(
    errors,
    'confirmPassword',
    validateConfirmation(values.password, values.confirmPassword),
  );

  return errors;
}

export function isAuthFormValid(
  mode: AuthValidationMode,
  values: AuthFormValues,
): boolean {
  return Object.keys(validateAuthValues(mode, values)).length === 0;
}
