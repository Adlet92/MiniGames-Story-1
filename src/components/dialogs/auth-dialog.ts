import type { AuthMode } from '../header/header';
import './auth-dialog.scss';

interface AuthField {
  autocomplete: AutoFill;
  icon: 'email' | 'lock' | 'person';
  id: string;
  label: string;
  placeholder: string;
  type: 'email' | 'password' | 'text';
}

interface AuthContent {
  fields: AuthField[];
  heading: string;
  submitLabel: string;
  subtitle: string;
}

export interface AuthDialog {
  element: HTMLDialogElement;
  open: (mode: AuthMode) => void;
}

const AUTH_CONTENT: Record<AuthMode, AuthContent> = {
  login: {
    heading: 'Welcome Back!',
    subtitle: 'Log in to continue your MiniGames journey.',
    submitLabel: 'Login',
    fields: [
      {
        autocomplete: 'email',
        icon: 'email',
        id: 'login-email',
        label: 'Email Address',
        placeholder: 'your.email@domain.com',
        type: 'email',
      },
      {
        autocomplete: 'current-password',
        icon: 'lock',
        id: 'login-password',
        label: 'Password',
        placeholder: 'Enter your password',
        type: 'password',
      },
    ],
  },
  signup: {
    heading: 'Create Account',
    subtitle: 'Join MiniGames to track your score & streak.',
    submitLabel: 'Create Account',
    fields: [
      {
        autocomplete: 'username',
        icon: 'person',
        id: 'register-username',
        label: 'Username',
        placeholder: 'e.g. CozyGamer_99',
        type: 'text',
      },
      {
        autocomplete: 'email',
        icon: 'email',
        id: 'register-email',
        label: 'Email Address',
        placeholder: 'your.email@domain.com',
        type: 'email',
      },
      {
        autocomplete: 'new-password',
        icon: 'lock',
        id: 'register-password',
        label: 'Password',
        placeholder: 'Min. 8 characters',
        type: 'password',
      },
      {
        autocomplete: 'new-password',
        icon: 'lock',
        id: 'register-confirm-password',
        label: 'Confirm Password',
        placeholder: 'Repeat your password',
        type: 'password',
      },
    ],
  },
};

function createTab(label: string, mode: AuthMode): HTMLButtonElement {
  const tab: HTMLButtonElement = document.createElement('button');
  tab.type = 'button';
  tab.className = 'auth-dialog__tab';
  tab.id = `auth-${mode}-tab`;
  tab.dataset.mode = mode;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', 'auth-form-panel');
  tab.textContent = label;
  return tab;
}

function createField(field: AuthField): HTMLLabelElement {
  const label: HTMLLabelElement = document.createElement('label');
  label.className = 'auth-dialog__field';
  label.htmlFor = field.id;

  const labelText: HTMLSpanElement = document.createElement('span');
  labelText.className = 'auth-dialog__label';
  labelText.textContent = field.label;

  const inputWrapper: HTMLSpanElement = document.createElement('span');
  inputWrapper.className = 'auth-dialog__input-wrapper';
  const icon: HTMLSpanElement = document.createElement('span');
  icon.className = `auth-dialog__field-icon auth-dialog__field-icon--${field.icon}`;
  icon.setAttribute('aria-hidden', 'true');
  const input: HTMLInputElement = document.createElement('input');
  input.id = field.id;
  input.name = field.id;
  input.type = field.type;
  input.autocomplete = field.autocomplete;
  input.placeholder = field.placeholder;
  input.required = true;
  if (field.id === 'register-password') {
    input.minLength = 8;
  }
  inputWrapper.append(icon, input);
  label.append(labelText, inputWrapper);
  return label;
}

export function createAuthDialog(): AuthDialog {
  const element: HTMLDialogElement = document.createElement('dialog');
  element.className = 'auth-dialog';
  element.setAttribute('aria-labelledby', 'auth-title');

  const tabs: HTMLDivElement = document.createElement('div');
  tabs.className = 'auth-dialog__tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Choose authentication form');
  const loginTab: HTMLButtonElement = createTab('Login', 'login');
  const signupTab: HTMLButtonElement = createTab('Register', 'signup');
  tabs.append(loginTab, signupTab);

  const panel: HTMLDivElement = document.createElement('div');
  panel.className = 'auth-dialog__panel';
  panel.id = 'auth-form-panel';
  panel.setAttribute('role', 'tabpanel');

  const headingGroup: HTMLDivElement = document.createElement('div');
  headingGroup.className = 'auth-dialog__heading-group';
  const title: HTMLHeadingElement = document.createElement('h2');
  title.className = 'auth-dialog__title';
  title.id = 'auth-title';
  const subtitle: HTMLParagraphElement = document.createElement('p');
  subtitle.className = 'auth-dialog__subtitle';
  headingGroup.append(title, subtitle);

  const form: HTMLFormElement = document.createElement('form');
  form.className = 'auth-dialog__form';
  form.noValidate = true;
  const fields: HTMLDivElement = document.createElement('div');
  fields.className = 'auth-dialog__fields';
  const loginOptions: HTMLDivElement = document.createElement('div');
  loginOptions.className = 'auth-dialog__login-options';
  const rememberLabel: HTMLLabelElement = document.createElement('label');
  rememberLabel.className = 'auth-dialog__remember';
  const rememberInput: HTMLInputElement = document.createElement('input');
  rememberInput.type = 'checkbox';
  rememberInput.name = 'remember-me';
  const rememberText: HTMLSpanElement = document.createElement('span');
  rememberText.textContent = 'Remember me';
  rememberLabel.append(rememberInput, rememberText);
  const forgotLink: HTMLAnchorElement = document.createElement('a');
  forgotLink.href = '#/';
  forgotLink.textContent = 'Forgot password?';
  loginOptions.append(rememberLabel, forgotLink);

  const submit: HTMLButtonElement = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'auth-dialog__submit';

  const divider: HTMLDivElement = document.createElement('div');
  divider.className = 'auth-dialog__divider';
  const dividerText: HTMLSpanElement = document.createElement('span');
  dividerText.textContent = 'or';
  divider.append(dividerText);

  const google: HTMLButtonElement = document.createElement('button');
  google.type = 'button';
  google.className = 'auth-dialog__google';
  const googleMark: HTMLSpanElement = document.createElement('span');
  googleMark.className = 'auth-dialog__google-mark';
  googleMark.setAttribute('aria-hidden', 'true');
  googleMark.textContent = 'G';
  const googleLabel: HTMLSpanElement = document.createElement('span');
  google.append(googleMark, googleLabel);

  const footer: HTMLParagraphElement = document.createElement('p');
  footer.className = 'auth-dialog__footer';
  const footerText: HTMLSpanElement = document.createElement('span');
  const footerSwitch: HTMLButtonElement = document.createElement('button');
  footerSwitch.type = 'button';
  footerSwitch.className = 'auth-dialog__footer-switch';
  footer.append(footerText, document.createTextNode(' '), footerSwitch);

  form.append(fields, loginOptions, submit, divider, google, footer);
  panel.append(headingGroup, form);
  element.append(tabs, panel);

  let activeMode: AuthMode = 'login';
  let isClosing: boolean = false;
  let closeTimer: number | undefined;
  let switchTimer: number | undefined;
  let openFrame: number | undefined;
  let previousOverflow: string = '';
  let previouslyFocused: HTMLElement | undefined;

  function renderMode(mode: AuthMode): void {
    const content: AuthContent = AUTH_CONTENT[mode];
    activeMode = mode;
    element.dataset.mode = mode;
    panel.setAttribute('aria-labelledby', `auth-${mode}-tab`);
    title.textContent = content.heading;
    subtitle.textContent = content.subtitle;
    fields.replaceChildren(
      ...content.fields.map((field: AuthField): HTMLLabelElement => createField(field)),
    );
    loginOptions.hidden = mode !== 'login';
    submit.textContent = content.submitLabel;
    googleLabel.textContent = mode === 'login' ? 'Login with Google' : 'Sign up with Google';
    footerText.textContent =
      mode === 'login' ? "Don't have an account?" : 'Already have an account?';
    footerSwitch.textContent = mode === 'login' ? 'Register' : 'Login';
    loginTab.setAttribute('aria-selected', String(mode === 'login'));
    signupTab.setAttribute('aria-selected', String(mode === 'signup'));
    loginTab.tabIndex = mode === 'login' ? 0 : -1;
    signupTab.tabIndex = mode === 'signup' ? 0 : -1;
  }

  function switchMode(mode: AuthMode): void {
    if (mode === activeMode) {
      return;
    }
    clearTimeout(switchTimer);
    panel.classList.remove('auth-dialog__panel--entering');
    panel.classList.add('auth-dialog__panel--leaving');
    switchTimer = setTimeout((): void => {
      renderMode(mode);
      panel.classList.remove('auth-dialog__panel--leaving');
      panel.classList.add('auth-dialog__panel--entering');
      requestAnimationFrame((): void => panel.classList.remove('auth-dialog__panel--entering'));
    }, 120);
  }

  function finishClose(): void {
    if (!isClosing) {
      return;
    }
    clearTimeout(closeTimer);
    element.close();
    element.classList.remove('auth-dialog--open');
    isClosing = false;
    document.body.style.overflow = previousOverflow;
    previouslyFocused?.focus();
  }

  function closeDialog(): void {
    if (isClosing || !element.open) {
      return;
    }
    isClosing = true;
    cancelAnimationFrame(openFrame ?? 0);
    element.classList.remove('auth-dialog--open');
    closeTimer = setTimeout(finishClose, 220);
  }

  function open(mode: AuthMode): void {
    if (element.open) {
      switchMode(mode);
      return;
    }
    renderMode(mode);
    isClosing = false;
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    element.getBoundingClientRect();
    openFrame = requestAnimationFrame((): void => element.classList.add('auth-dialog--open'));
  }

  loginTab.addEventListener('click', (): void => switchMode('login'));
  signupTab.addEventListener('click', (): void => switchMode('signup'));
  footerSwitch.addEventListener('click', (): void =>
    switchMode(activeMode === 'login' ? 'signup' : 'login'),
  );
  form.addEventListener('submit', (event: SubmitEvent): void => event.preventDefault());
  forgotLink.addEventListener('click', (event: MouseEvent): void => event.preventDefault());
  element.addEventListener('cancel', (event: Event): void => {
    event.preventDefault();
    closeDialog();
  });
  element.addEventListener('click', (event: MouseEvent): void => {
    const bounds: DOMRect = element.getBoundingClientRect();
    const isBackdropClick: boolean =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (isBackdropClick) {
      closeDialog();
    }
  });
  element.addEventListener('transitionend', (event: TransitionEvent): void => {
    if (event.target === element && event.propertyName === 'opacity') {
      finishClose();
    }
  });

  renderMode('login');
  return { element, open };
}
