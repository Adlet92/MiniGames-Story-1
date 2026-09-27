import tukoniHeroUrl from '../../assets/tukoni-forest-keepers-hero.jpg';
import './game-details-dialog.scss';

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: () => void;
}

export function createGameDetailsDialog(): GameDetailsDialog {
  const element: HTMLDialogElement = document.createElement('dialog');
  element.className = 'game-details-dialog';
  element.setAttribute('aria-labelledby', 'game-details-title');

  const hero: HTMLDivElement = document.createElement('div');
  hero.className = 'game-details-dialog__hero';
  const image: HTMLImageElement = document.createElement('img');
  image.src = tukoniHeroUrl;
  image.alt = 'Tukoni: Forest Keepers artwork';
  const close: HTMLButtonElement = document.createElement('button');
  close.type = 'button';
  close.className = 'game-details-dialog__close';
  close.setAttribute('aria-label', 'Close game details');
  close.textContent = '×';
  hero.append(image, close);

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-details-dialog__content';
  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'game-details-title';
  title.textContent = 'Tukoni: Forest Keepers';
  const badges: HTMLDivElement = document.createElement('div');
  badges.className = 'game-details-dialog__badges';
  for (const label of ['Puzzle', 'Free', '★ 4.9', '♥ 31.2K']) {
    const badge: HTMLSpanElement = document.createElement('span');
    badge.textContent = label;
    badges.append(badge);
  }
  const description: HTMLParagraphElement = document.createElement('p');
  description.textContent =
    'A cute cozy puzzle adventure. Play as a forest spirit exploring hand-drawn magical locations, meet charming characters, solve puzzles, collect herbs and tea recipes.';
  const actions: HTMLDivElement = document.createElement('div');
  actions.className = 'game-details-dialog__actions';
  const play: HTMLButtonElement = document.createElement('button');
  play.type = 'button';
  play.className = 'game-details-dialog__play';
  play.textContent = 'Play Now';
  const favorite: HTMLButtonElement = document.createElement('button');
  favorite.type = 'button';
  favorite.className = 'game-details-dialog__favorite';
  favorite.textContent = '♡ Add to Favorites';
  favorite.setAttribute('aria-pressed', 'false');
  actions.append(play, favorite);
  content.append(title, badges, description, actions);
  element.append(hero, content);

  let isClosing: boolean = false;
  let closeTimer: number | undefined;
  let openFrame: number | undefined;
  let previousOverflow: string = '';
  let previouslyFocused: HTMLElement | undefined;

  function finishClose(): void {
    if (!isClosing) {
      return;
    }
    clearTimeout(closeTimer);
    element.close();
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
    element.classList.remove('game-details-dialog--open');
    closeTimer = setTimeout(finishClose, 220);
  }

  function resetState(): void {
    favorite.setAttribute('aria-pressed', 'false');
    favorite.textContent = '♡ Add to Favorites';
  }

  function open(): void {
    if (element.open) {
      return;
    }
    resetState();
    isClosing = false;
    previousOverflow = document.body.style.overflow;
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    document.body.style.overflow = 'hidden';
    element.showModal();
    element.getBoundingClientRect();
    openFrame = requestAnimationFrame((): void =>
      element.classList.add('game-details-dialog--open'),
    );
  }

  favorite.addEventListener('click', (): void => {
    const isFavorite: boolean = favorite.getAttribute('aria-pressed') === 'true';
    favorite.setAttribute('aria-pressed', String(!isFavorite));
    favorite.textContent = isFavorite ? '♡ Add to Favorites' : '♥ Added to Favorites';
  });
  close.addEventListener('click', closeDialog);
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

  return { element, open };
}
