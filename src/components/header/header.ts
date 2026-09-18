import brandUrl from '../../assets/icons/brand.png';
import burgerUrl from '../../assets/icons/burger.svg';
import './header.scss';

export type AuthMode = 'login' | 'signup';

export interface HeaderOptions {
  onAuth: (mode: AuthMode) => void;
}

function createAuthButton(
  label: string,
  mode: AuthMode,
  options: HeaderOptions,
): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = `header__button header__button--${mode}`;
  button.textContent = label;
  button.addEventListener('click', (): void => options.onAuth(mode));
  return button;
}

export function createHeader(options: HeaderOptions): HTMLElement {
  const header: HTMLElement = document.createElement('header');
  header.className = 'header';

  const brand: HTMLAnchorElement = document.createElement('a');
  brand.className = 'header__brand';
  brand.href = '#/';
  brand.setAttribute('aria-label', 'MiniGames home');
  const logo: HTMLImageElement = document.createElement('img');
  logo.src = brandUrl;
  logo.alt = '';
  logo.width = 32;
  logo.height = 32;
  const name: HTMLSpanElement = document.createElement('span');
  name.textContent = 'MiniGames';
  brand.append(logo, name);

  const actions: HTMLDivElement = document.createElement('div');
  actions.className = 'header__actions';
  const navigation: HTMLElement = document.createElement('nav');
  navigation.className = 'header__nav';
  navigation.id = 'header-navigation';
  navigation.setAttribute('aria-label', 'Main navigation');
  const labels: string[] = ['Home', 'Library', 'Tournaments', 'Community'];
  for (const label of labels) {
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = '#/';
    link.textContent = label;
    if (label === 'Home') {
      link.setAttribute('aria-current', 'page');
    }
    navigation.append(link);
  }

  const buttons: HTMLDivElement = document.createElement('div');
  buttons.className = 'header__buttons';
  buttons.append(
    createAuthButton('Log In', 'login', options),
    createAuthButton('Sign Up', 'signup', options),
  );

  const burger: HTMLButtonElement = document.createElement('button');
  burger.type = 'button';
  burger.className = 'header__burger';
  burger.setAttribute('aria-label', 'Open navigation');
  burger.setAttribute('aria-controls', navigation.id);
  burger.setAttribute('aria-expanded', 'false');
  const burgerIcon: HTMLImageElement = document.createElement('img');
  burgerIcon.src = burgerUrl;
  burgerIcon.alt = '';
  burgerIcon.width = 32;
  burgerIcon.height = 32;
  burger.append(burgerIcon);

  function closeMenu(): void {
    header.classList.remove('header--open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
  }

  burger.addEventListener('click', (): void => {
    const isOpen: boolean = header.classList.toggle('header--open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  navigation.addEventListener('click', closeMenu);
  header.addEventListener('keydown', (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      return;
    }
    closeMenu();
    burger.focus();
  });

  actions.append(navigation, buttons, burger);
  header.append(brand, actions);
  return header;
}
