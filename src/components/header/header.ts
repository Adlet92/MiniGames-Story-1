import type { AppPage } from '../../app/router';
import brandUrl from '../../assets/icons/brand.png';
import burgerUrl from '../../assets/icons/burger.svg';
import './header.scss';
import type { MobileMenu } from './mobile-menu';
import { createMobileMenu } from './mobile-menu';

export type AuthMode = 'login' | 'signup';

export interface HeaderOptions {
  activePage: AppPage;
  onAuth: (mode: AuthMode) => void;
  onNavigate: (page: AppPage) => void;
}

interface NavigationItem {
  activePage?: AppPage;
  label: string;
  targetPage: AppPage;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { activePage: 'home', label: 'Home', targetPage: 'home' },
  { activePage: 'library', label: 'Library', targetPage: 'library' },
  { label: 'Tournaments', targetPage: 'home' },
  { label: 'Community', targetPage: 'home' },
];

function getPageHref(page: AppPage): string {
  return page === 'home' ? '#/' : '#/library';
}

export function setHeaderActivePage(header: HTMLElement, page: AppPage): void {
  const links: NodeListOf<HTMLAnchorElement> =
    header.querySelectorAll<HTMLAnchorElement>('[data-active-page]');
  for (const link of links) {
    link.setAttribute('aria-current', link.dataset.activePage === page ? 'page' : 'false');
  }
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
  brand.addEventListener('click', (event: MouseEvent): void => {
    event.preventDefault();
    options.onNavigate('home');
  });
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
  const links: HTMLAnchorElement[] = NAVIGATION_ITEMS.map(
    (item: NavigationItem): HTMLAnchorElement => {
      const link: HTMLAnchorElement = document.createElement('a');
      link.href = getPageHref(item.targetPage);
      link.textContent = item.label;
      link.dataset.targetPage = item.targetPage;
      if (item.activePage !== undefined) {
        link.dataset.activePage = item.activePage;
      }
      if (item.activePage === options.activePage) {
        link.setAttribute('aria-current', 'page');
      }
      link.addEventListener('click', (event: MouseEvent): void => {
        event.preventDefault();
        options.onNavigate(item.targetPage);
      });
      return link;
    },
  );
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
