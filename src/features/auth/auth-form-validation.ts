import type {
  AuthFieldName,
  AuthFormValues,
  AuthValidationErrors,
  AuthValidationMode,
} from './auth-validation';
import { validateAuthValues } from './auth-validation';

interface FieldBinding {
  errorElement: HTMLParagraphElement;
  fieldName: AuthFieldName;
  input: HTMLInputElement;
}

const AUTH_DIALOG_FORM_SELECTOR: string = '.auth-dialog form';

const INITIALIZED_ATTRIBUTE: string =
  'data-auth-validation-initialized';

const ENHANCED_ATTRIBUTE: string =
  'data-auth-validation-enhanced';

const RESET_EVENT_NAME: string =
  'auth-validation-reset';

const MODE_SWITCH_LABELS: readonly string[] = [
  'login',
  'register',
  'registration',
];

function createErrorElement(
  input: HTMLInputElement,
  fieldName: AuthFieldName,
): HTMLParagraphElement {
  const errorElement: HTMLParagraphElement =
    document.createElement('p');

  const errorId: string =
    `auth-${fieldName}-error-${globalThis.crypto.randomUUID()}`;

  errorElement.id = errorId;
  errorElement.className = 'auth-dialog__field-error';
  errorElement.hidden = true;
  errorElement.setAttribute('aria-live', 'polite');

  input.setAttribute('aria-describedby', errorId);
  input.after(errorElement);

  return errorElement;
}

function createFieldBinding(
  input: HTMLInputElement,
  fieldName: AuthFieldName,
): FieldBinding {
  return {
    errorElement: createErrorElement(input, fieldName),
    fieldName,
    input,
  };
}

function setFieldError(
  binding: FieldBinding,
  errorMessage: string | undefined,
): void {
  const isInvalid: boolean = errorMessage !== undefined;

  binding.errorElement.textContent = errorMessage ?? '';
  binding.errorElement.hidden = !isInvalid;

  binding.input.classList.toggle(
    'auth-dialog__input--invalid',
    isInvalid,
  );

  binding.input.setAttribute(
    'aria-invalid',
    String(isInvalid),
  );
}

function clearFieldError(binding: FieldBinding): void {
  binding.errorElement.textContent = '';
  binding.errorElement.hidden = true;

  binding.input.classList.remove(
    'auth-dialog__input--invalid',
  );

  binding.input.setAttribute('aria-invalid', 'false');
}

function getAuthMode(
  confirmPasswordInput: HTMLInputElement | undefined,
): AuthValidationMode {
  return confirmPasswordInput === undefined
    ? 'login'
    : 'register';
}

function getFormValues(
  bindings: Map<AuthFieldName, FieldBinding>,
): AuthFormValues {
  return {
    email: bindings.get('email')?.input.value ?? '',
    username: bindings.get('username')?.input.value ?? '',
    password: bindings.get('password')?.input.value ?? '',
    confirmPassword:
      bindings.get('confirmPassword')?.input.value ?? '',
  };
}

function enhanceAuthForm(form: HTMLFormElement): void {
  if (form.hasAttribute(ENHANCED_ATTRIBUTE)) {
    return;
  }

  const emailInput: HTMLInputElement | undefined =
    form.querySelector<HTMLInputElement>(
      'input[type="email"]',
    ) ?? undefined;

  const passwordInputs: HTMLInputElement[] = [
    ...form.querySelectorAll<HTMLInputElement>(
      'input[type="password"]',
    ),
  ];

  const passwordInput: HTMLInputElement | undefined =
    passwordInputs.at(0);

  const confirmPasswordInput:
    | HTMLInputElement
    | undefined = passwordInputs.at(1);

  const submitButton: HTMLButtonElement | undefined =
    form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    ) ?? undefined;

  if (
    emailInput === undefined ||
    passwordInput === undefined ||
    submitButton === undefined
  ) {
    return;
  }

  const mode: AuthValidationMode = getAuthMode(
    confirmPasswordInput,
  );

  const usernameInput: HTMLInputElement | undefined =
    mode === 'register'
      ? (form.querySelector<HTMLInputElement>(
          'input[name="username"], input[type="text"]',
        ) ?? undefined)
      : undefined;

  if (
    mode === 'register' &&
    (usernameInput === undefined ||
      confirmPasswordInput === undefined)
  ) {
    return;
  }

  form.setAttribute(ENHANCED_ATTRIBUTE, '');

  emailInput.name = 'email';
  passwordInput.name = 'password';

  const bindings: Map<AuthFieldName, FieldBinding> =
    new Map<AuthFieldName, FieldBinding>();

  bindings.set(
    'email',
    createFieldBinding(emailInput, 'email'),
  );

  bindings.set(
    'password',
    createFieldBinding(passwordInput, 'password'),
  );

  if (usernameInput !== undefined) {
    usernameInput.name = 'username';

    bindings.set(
      'username',
      createFieldBinding(usernameInput, 'username'),
    );
  }

  if (confirmPasswordInput !== undefined) {
    confirmPasswordInput.name = 'confirmPassword';

    bindings.set(
      'confirmPassword',
      createFieldBinding(
        confirmPasswordInput,
        'confirmPassword',
      ),
    );
  }

  const touchedFields: Set<AuthFieldName> =
    new Set<AuthFieldName>();

  const updateValidation = (
    shouldShowAllErrors: boolean,
  ): void => {
    const values: AuthFormValues = getFormValues(bindings);

    const errors: AuthValidationErrors =
      validateAuthValues(mode, values);

    for (const [fieldName, binding] of bindings) {
      const shouldShowError: boolean =
        shouldShowAllErrors ||
        touchedFields.has(fieldName);

      const errorMessage: string | undefined =
        shouldShowError
          ? errors[fieldName]
          : undefined;

      setFieldError(binding, errorMessage);
    }

    const isFormValid: boolean =
      Object.keys(errors).length === 0;

    submitButton.disabled = !isFormValid;
    submitButton.setAttribute(
      'aria-disabled',
      String(!isFormValid),
    );
  };

  const handleFieldInteraction = (
    fieldName: AuthFieldName,
  ): void => {
    touchedFields.add(fieldName);
    updateValidation(false);
  };

  for (const [fieldName, binding] of bindings) {
    binding.input.addEventListener(
      'input',
      (): void => {
        handleFieldInteraction(fieldName);
      },
    );

    binding.input.addEventListener(
      'change',
      (): void => {
        handleFieldInteraction(fieldName);
      },
    );

    binding.input.addEventListener(
      'blur',
      (): void => {
        handleFieldInteraction(fieldName);
      },
    );
  }

  form.addEventListener(
    'submit',
    (event: SubmitEvent): void => {
      for (const fieldName of bindings.keys()) {
        touchedFields.add(fieldName);
      }

      const values: AuthFormValues =
        getFormValues(bindings);

      const errors: AuthValidationErrors =
        validateAuthValues(mode, values);

      updateValidation(true);

      const isFormValid: boolean =
        Object.keys(errors).length === 0;

      if (!isFormValid) {
        event.preventDefault();
      }
    },
  );

  form.addEventListener(
    RESET_EVENT_NAME,
    (): void => {
      form.reset();
      touchedFields.clear();

      for (const binding of bindings.values()) {
        clearFieldError(binding);
      }

      updateValidation(false);
    },
  );

  updateValidation(false);
}

function enhanceAvailableAuthForms(): void {
  const forms: NodeListOf<HTMLFormElement> =
    document.querySelectorAll<HTMLFormElement>(
      AUTH_DIALOG_FORM_SELECTOR,
    );

  for (const form of forms) {
    enhanceAuthForm(form);
  }
}

function isAuthModeSwitchControl(
  target: Element,
): boolean {
  const control: HTMLElement | undefined =
    target.closest<HTMLElement>(
      'button, a, [role="tab"]',
    ) ?? undefined;

  if (control === undefined) {
    return false;
  }

  if (
    control instanceof HTMLButtonElement &&
    control.type === 'submit'
  ) {
    return false;
  }

  const declaredMode: string =
    control.dataset.authMode?.toLowerCase() ?? '';

  if (
    declaredMode === 'login' ||
    declaredMode === 'register' ||
    declaredMode === 'registration'
  ) {
    return true;
  }

  const label: string =
    control.textContent?.trim().toLowerCase() ?? '';

  return MODE_SWITCH_LABELS.includes(label);
}

function resetAuthForms(): void {
  const forms: NodeListOf<HTMLFormElement> =
    document.querySelectorAll<HTMLFormElement>(
      AUTH_DIALOG_FORM_SELECTOR,
    );

  for (const form of forms) {
    form.dispatchEvent(new Event(RESET_EVENT_NAME));
  }
}

export function initializeAuthFormValidation(): void {
  const documentElement: HTMLElement =
    document.documentElement;

  if (
    documentElement.hasAttribute(
      INITIALIZED_ATTRIBUTE,
    )
  ) {
    return;
  }

  documentElement.setAttribute(
    INITIALIZED_ATTRIBUTE,
    '',
  );

  enhanceAvailableAuthForms();

  const observer: MutationObserver =
    new MutationObserver((): void => {
      enhanceAvailableAuthForms();
    });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  document.addEventListener(
    'click',
    (event: MouseEvent): void => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (isAuthModeSwitchControl(event.target)) {
        resetAuthForms();
      }
    },
    {
      capture: true,
    },
  );
}
