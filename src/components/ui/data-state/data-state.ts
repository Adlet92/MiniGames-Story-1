import './data-state.scss';

export function createCardSkeleton(count: number, label: string): HTMLElement {
  const container: HTMLDivElement = document.createElement('div');
  container.className = 'data-state data-state--skeleton';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-label', label);

  for (let index: number = 0; index < count; index += 1) {
    const card: HTMLDivElement = document.createElement('div');
    card.className = 'data-state__skeleton-card';
    card.setAttribute('aria-hidden', 'true');
    container.append(card);
  }

  const text: HTMLSpanElement = document.createElement('span');
  text.className = 'data-state__visually-hidden';
  text.textContent = label;
  container.append(text);
  return container;
}

export function createErrorBanner(message: string, onRetry: () => void): HTMLElement {
  const banner: HTMLDivElement = document.createElement('div');
  banner.className = 'data-state data-state--error';
  banner.setAttribute('role', 'alert');
  const title: HTMLHeadingElement = document.createElement('h3');
  title.className = 'data-state__title';
  title.textContent = 'Unable to load featured games';
  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'data-state__message';
  description.textContent = message;
  const retryButton: HTMLButtonElement = document.createElement('button');
  retryButton.type = 'button';
  retryButton.className = 'data-state__retry';
  retryButton.textContent = 'Try again';
  retryButton.addEventListener('click', onRetry);
  banner.append(title, description, retryButton);
  return banner;
}

export function createEmptyState(titleText: string, message: string): HTMLElement {
  const placeholder: HTMLDivElement = document.createElement('div');
  placeholder.className = 'data-state data-state--empty';
  placeholder.setAttribute('role', 'status');
  const title: HTMLHeadingElement = document.createElement('h3');
  title.className = 'data-state__title';
  title.textContent = titleText;
  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'data-state__message';
  description.textContent = message;
  placeholder.append(title, description);
  return placeholder;
}
