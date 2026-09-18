import type { AuthMode } from '../header/header';
import './auth-dialog.scss';

// Functional shell only: replace with the Auth dialog design in its own task.
export interface AuthDialog {
  element: HTMLDialogElement;
  open: (mode: AuthMode) => void;
}

export function createAuthDialog(): AuthDialog {
  const element: HTMLDialogElement = document.createElement('dialog');
  element.className = 'auth-dialog';
  element.setAttribute('aria-labelledby', 'auth-title');
  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'auth-title';
  const message: HTMLParagraphElement = document.createElement('p');
  message.textContent = 'Authentication will be implemented in the next stage.';
  const close: HTMLButtonElement = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', (): void => element.close());
  element.append(title, message, close);

  function open(mode: AuthMode): void {
    title.textContent = mode === 'login' ? 'Log In' : 'Sign Up';
    if (!element.open) {
      element.showModal();
    }
  }

  return { element, open };
}
