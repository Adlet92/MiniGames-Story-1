export type AuthValidationMode = 'login' | 'signup';

export type AuthFieldName =
  | 'email'
  | 'username'
  | 'password'
  | 'confirmPassword';

export interface AuthFormValues {
  confirmPassword: string;
  email: string;
  password: string;
  username: string;
}

export type AuthValidationErrors = Partial<
  Record<AuthFieldName, string>
>;

const EMAIL_PATTERN: RegExp =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USERNAME_PATTERN: RegExp = /^[A-Za-z0-9]+$/;
const USERNAME_START_PATTERN: RegExp = /^[A-Z]/;

const UPPERCASE_PATTERN: RegExp = /[A-Z]/;
const DIGIT_PATTERN: RegExp = /\d/;
const SPECIAL_CHARACTER_PATTERN: RegExp =
  /[^A-Za-z0-9]/;

const PASSWORD_ALLOWED_PATTERN: RegExp =
  /^[\u{21}-\u{7e}]+$/u;

const USERNAME_MIN_LENGTH: number = 2;
const USERNAME_MAX_LENGTH: number = 30;
const PASSWORD_MIN_LENGTH: number = 6;

function validateEmail(
  value: string,
): string | undefined {
  const email: string = value.trim();

  if (email.length === 0) {
    return 'Email is required.';
  }

  return EMAIL_PATTERN.test(email)
    ? undefined
    : 'Enter a valid email address.';
}

function validateUsername(
  value: string,
): string | undefined {
  const username: string = value.trim();

  if (username.length === 0) {
    return 'Username is required.';
  }

  if (
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return 'Username must contain between 2 and 30 characters.';
  }

  if (!USERNAME_START_PATTERN.test(username)) {
    return 'Username must start with an uppercase English letter.';
  }

  return USERNAME_PATTERN.test(username)
    ? undefined
    : 'Username may contain only English letters and digits.';
}

function validateLoginPassword(
  password: string,
): string | undefined {
  if (password.length === 0) {
    return 'Password is required.';
  }

  return password.length >= PASSWORD_MIN_LENGTH
    ? undefined
    : 'Password must contain at least 6 characters.';
}

function validateSignupPassword(
  password: string,
): string | undefined {
  if (password.length === 0) {
    return 'Password is required.';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'Password must contain at least 6 characters.';
  }

  if (!PASSWORD_ALLOWED_PATTERN.test(password)) {
    return 'Use only English letters, digits, and special characters.';
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

function validateConfirmPassword(
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

function assignError(
  errors: AuthValidationErrors,
  fieldName: AuthFieldName,
  errorMessage: string | undefined,
): void {
  if (errorMessage !== undefined) {
    errors[fieldName] = errorMessage;
  }
}

export function validateAuthValues(
  mode: AuthValidationMode,
  values: AuthFormValues,
): AuthValidationErrors {
  const errors: AuthValidationErrors = {};

  assignError(
    errors,
    'email',
    validateEmail(values.email),
  );

  if (mode === 'login') {
    assignError(
      errors,
      'password',
      validateLoginPassword(values.password),
    );

    return errors;
  }

  assignError(
    errors,
    'username',
    validateUsername(values.username),
  );

  assignError(
    errors,
    'password',
    validateSignupPassword(values.password),
  );

  assignError(
    errors,
    'confirmPassword',
    validateConfirmPassword(
      values.password,
      values.confirmPassword,
    ),
  );

  return errors;
}
