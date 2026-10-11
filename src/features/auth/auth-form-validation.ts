import type {
  AuthFieldName,
  AuthFormValues,
  AuthValidationErrors,
  AuthValidationMode,
} from './auth-validation';
import { validateAuthValues } from './auth-validation';

interface FieldBinding {
  errorElement: HTMLParagraphElement;
  input: HTMLInputElement;
  name: AuthFieldName;
}

interface FormController {
  reset: () => void;
}

const formControllers: WeakMap<HTMLFormElement, FormController> = new WeakMap<
  HTMLFormElement,
  FormController
>();

let errorIdentifier: number = 0;
let isInitialized: boolean = false;

function createErrorElement(
  input: HTMLInputElement,
  name: AuthFieldName,
): HTMLParagraphElement {
  errorIdentifier += 1;

  const errorElement: HTMLParagraphElement = document.createElement('p');
  const errorId: string = `auth-${name}-error-${errorIdentifier}`;

  errorElement.id = errorId;
  errorElement.className = 'auth-dialog__field-error';
  errorElement.dataset.validationFor = name;
  errorElement.setAttribute('aria-live', 'polite');

  input.setAttribute('aria-describedby', errorId);
  input.insertAdjacentElement('afterend', errorElement);

  return errorElement;
}

function createBinding(input: HTMLInputElement, name: AuthFieldName): FieldBinding {
  return {
    input,
    name,
    errorElement: createErrorElement(input, name),
  };
}

function getFieldValue(
  bindings: Map<AuthFieldName, FieldBinding>,
  name: AuthFieldName,
): string {
  return bindings.get(name)?.input.value ?? '';
}

function readValues(bindings: Map<AuthFieldName, FieldBinding>): AuthFormValues {
  return {
    email: getFieldValue(bindings, 'email'),
    username: getFieldValue(bindings, 'username'),
    password: getFieldValue(bindings, 'password'),
    confirmPassword: getFieldValue(bindings, 'confirmPassword'),
  };
}

function renderFieldError(binding: FieldBinding, message: string): void {
  const isInvalid: boolean = message.length > 0;

  binding.errorElement.textContent = message;
  binding.input.classList.toggle('auth-dialog__input--invalid', isInvalid);
  binding.input.setAttribute('aria-invalid', String(isInvalid));
}

function findUsernameInput(form: HTMLFormElement): HTMLInputElement | null {
  return form.querySelector<HTMLInputElement>(
    'input[name="username"], input[type="text"]',
  );
}

function enhanceForm(form: HTMLFormElement): FormController | undefined {
  const emailInput: HTMLInputElement | null =
  form.querySelector<HTMLInputElement>('input[type="email"]');

const passwordInputs: HTMLInputElement[] = [
  ...form.querySelectorAll<HTMLInputElement>('input[type="password"]'),
];

const passwordInput: HTMLInputElement | undefined = passwordInputs.at(0);
const confirmPasswordInput: HTMLInputElement | undefined = passwordInputs.at(1);

const submitButton: HTMLButtonElement | null =
  form.querySelector<HTMLButtonElement>('button[type="submit"]');

if (emailInput === null || passwordInput === undefined || submitButton === null) {
  return undefined;
}

const isRegistration: boolean = confirmPasswordInput !== undefined;
  const mode: AuthValidationMode = isRegistration ? 'register' : 'login';
  const usernameInput: HTMLInputElement | null = isRegistration
    ? findUsernameInput(form)
    : null;

  if (isRegistration && usernameInput === null) {
    return undefined;
  }

  emailInput.name = 'email';
  passwordInput.name = 'password';

  const bindings: Map<AuthFieldName, FieldBinding> = new Map<
    AuthFieldName,
    FieldBinding
  >();

  if (usernameInput !== null) {
    usernameInput.name = 'username';
    bindings.set('username', createBinding(usernameInput, 'username'));
  }

  bindings.set('email', createBinding(emailInput, 'email'));
  bindings.set('password', createBinding(passwordInput, 'password'));

if (confirmPasswordInput !== undefined) {
  confirmPasswordInput.name = 'confirmPassword';
  bindings.set(
    'confirmPassword',
    createBinding(confirmPasswordInput, 'confirmPassword'),
  );
}

  const touchedFields: Set<AuthFieldName> = new Set<AuthFieldName>();

  const synchronizeValidation: () => boolean = (): boolean => {
    const values: AuthFormValues = readValues(bindings);
    const errors: AuthValidationErrors = validateAuthValues(mode, values);

    for (const binding of bindings.values()) {
      const message: string = touchedFields.has(binding.name)
        ? (errors[binding.name] ?? '')
        : '';

      renderFieldError(binding, message);
    }

    const isFormValid: boolean = Object.keys(errors).length === 0;
    submitButton.disabled = !isFormValid;

    return isFormValid;
  };

  for (const binding of bindings.values()) {
    const handleValueChange: () => void = (): void => {
      touchedFields.add(binding.name);

      if (binding.name === 'password') {
        const confirmationBinding: FieldBinding | undefined =
          bindings.get('confirmPassword');

        if (
          confirmationBinding !== undefined &&
          (confirmationBinding.input.value.length > 0 ||
            touchedFields.has('confirmPassword'))
        ) {
          touchedFields.add('confirmPassword');
        }
      }

      synchronizeValidation();
    };

    const handleBlur: () => void = (): void => {
      touchedFields.add(binding.name);
      synchronizeValidation();
    };

    binding.input.addEventListener('input', handleValueChange);
    binding.input.addEventListener('change', handleValueChange);
    binding.input.addEventListener('blur', handleBlur);
  }

  form.addEventListener('submit', (event: SubmitEvent): void => {
    for (const binding of bindings.values()) {
      touchedFields.add(binding.name);
    }

    if (!synchronizeValidation()) {
      event.preventDefault();
    }
  });

  const reset: () => void = (): void => {
    form.reset();
    touchedFields.clear();

    queueMicrotask((): void => {
      synchronizeValidation();
    });
  };

  form.addEventListener('reset', (): void => {
    touchedFields.clear();

    queueMicrotask((): void => {
      synchronizeValidation();
    });
  });

  synchronizeValidation();

  return { reset };
}

function scanAuthForms(): void {
  const forms: NodeListOf<HTMLFormElement> =
    document.querySelectorAll<HTMLFormElement>('.auth-dialog form');

  for (const form of forms) {
    if (formControllers.has(form)) {
      continue;
    }

    const controller: FormController | undefined = enhanceForm(form);

    if (controller !== undefined) {
      formControllers.set(form, controller);
    }
  }
}

function isModeSwitchControl(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const button: HTMLButtonElement | null = target.closest<HTMLButtonElement>('button');

  if (button === null || button.closest('.auth-dialog') === null) {
    return false;
  }

  if (button.getAttribute('role') === 'tab') {
    return true;
  }

  if (button.type === 'submit') {
    return false;
  }

  const buttonText: string = button.textContent?.trim().toLowerCase() ?? '';
  return buttonText === 'login' || buttonText === 'register';
}

function resetAuthForms(): void {
  const forms: NodeListOf<HTMLFormElement> =
    document.querySelectorAll<HTMLFormElement>('.auth-dialog form');

  for (const form of forms) {
    formControllers.get(form)?.reset();
  }
}

export function initializeAuthFormValidation(): void {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  const observer: MutationObserver = new MutationObserver((): void => {
    scanAuthForms();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  document.addEventListener(
    'click',
    (event: MouseEvent): void => {
      if (!isModeSwitchControl(event.target)) {
        return;
      }

      resetAuthForms();
    },
    true,
  );

  scanAuthForms();
}
