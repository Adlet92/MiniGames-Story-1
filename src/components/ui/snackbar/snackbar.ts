// import './snackbar.scss';

export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

export interface Snackbar {
  element: HTMLElement;
  show: (message: string, variant?: SnackbarVariant, duration?: number) => void;
}

const DEFAULT_DURATION: number = 4000;

export function createSnackbar(): Snackbar {
  const region: HTMLDivElement = document.createElement('div');
  region.className = 'snackbar-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');

  const snackbar: HTMLDivElement = document.createElement('div');
  snackbar.className = 'snackbar';
  const messageElement: HTMLParagraphElement = document.createElement('p');
  messageElement.className = 'snackbar__message';
  const closeButton: HTMLButtonElement = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'snackbar__close';
  closeButton.setAttribute('aria-label', 'Dismiss notification');
  closeButton.textContent = '×';
  snackbar.append(messageElement, closeButton);
  region.append(snackbar);

  let dismissTimer: number | undefined;

  const hide: () => void = (): void => {
    if (dismissTimer !== undefined) {
      clearTimeout(dismissTimer);
      dismissTimer = undefined;
    }

    snackbar.classList.remove('snackbar--visible');
  };

  const show: Snackbar['show'] = (
    message: string,
    variant: SnackbarVariant = 'info',
    duration: number = DEFAULT_DURATION,
  ): void => {
    hide();
    messageElement.textContent = message;
    snackbar.className = `snackbar snackbar--${variant}`;
    snackbar.setAttribute('role', variant === 'error' ? 'alert' : 'status');
    requestAnimationFrame((): void => snackbar.classList.add('snackbar--visible'));
    dismissTimer = setTimeout(hide, duration);
  };

  closeButton.addEventListener('click', hide);
  return { element: region, show };
}
