import brandUrl from '../../assets/icons/brand.png';
import burgerUrl from '../../assets/icons/burger.svg';
import './header.scss';
import type { MobileMenu } from './mobile-menu';
import { createMobileMenu } from './mobile-menu';

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
  const links: HTMLAnchorElement[] = labels.map((label: string): HTMLAnchorElement => {
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = '#/';
    link.textContent = label;
    if (label === 'Home') {
      link.setAttribute('aria-current', 'page');
    }
    return link;
  });
  navigation.append(...links);

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
  burger.setAttribute('aria-controls', 'mobile-navigation');
  burger.setAttribute('aria-haspopup', 'dialog');
  burger.setAttribute('aria-expanded', 'false');
  const burgerIcon: HTMLImageElement = document.createElement('img');
  burgerIcon.src = burgerUrl;
  burgerIcon.alt = '';
  burgerIcon.width = 32;
  burgerIcon.height = 32;
  const burgerCross: HTMLSpanElement = document.createElement('span');
  burgerCross.className = 'header__burger-cross';
  burgerCross.textContent = '×';
  burgerCross.setAttribute('aria-hidden', 'true');
  burger.append(burgerIcon, burgerCross);

  const menu: MobileMenu = createMobileMenu(burger, options);
  burger.addEventListener('click', menu.open);

  actions.append(navigation, buttons, burger);
  header.append(brand, actions, menu.element);
  return header;
}
