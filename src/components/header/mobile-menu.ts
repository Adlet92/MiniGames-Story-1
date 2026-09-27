import type { AppPage } from '../../app/router';
import brandUrl from '../../assets/icons/brand.png';
import type { AuthMode, HeaderOptions } from './header';
import './mobile-menu.scss';

export interface MobileMenu {
  element: HTMLDialogElement;
  open: () => void;
}

interface MobileNavigationItem {
  activePage?: AppPage;
  label: string;
  targetPage: AppPage;
}

const MOBILE_NAVIGATION_ITEMS: MobileNavigationItem[] = [
  { activePage: 'home', label: 'Home', targetPage: 'home' },
  { activePage: 'library', label: 'Library', targetPage: 'library' },
  { label: 'Tournaments', targetPage: 'home' },
  { label: 'Community', targetPage: 'home' },
];

function getPageHref(page: AppPage): string {
  return page === 'home' ? '#/' : '#/library';
}

export function createMobileMenu(trigger: HTMLButtonElement, options: HeaderOptions): MobileMenu {
  const element: HTMLDialogElement = document.createElement('dialog');
  element.id = 'mobile-navigation';
  element.className = 'mobile-menu';
  element.setAttribute('aria-label', 'Main navigation');
  const top: HTMLDivElement = document.createElement('div');
  top.className = 'mobile-menu__top';
  const brand: HTMLAnchorElement = document.createElement('a');
  brand.className = 'mobile-menu__brand';
  brand.href = '#/';
  const logo: HTMLImageElement = document.createElement('img');
  logo.src = brandUrl;
  logo.alt = '';
  logo.width = 32;
  logo.height = 32;
  const name: HTMLSpanElement = document.createElement('span');
  name.textContent = 'MiniGames';
  brand.append(logo, name);
  const close: HTMLButtonElement = document.createElement('button');
  close.type = 'button';
  close.className = 'mobile-menu__close';
  close.setAttribute('aria-label', 'Close navigation');
  close.autofocus = true;
  const cross: HTMLSpanElement = document.createElement('span');
  cross.textContent = '×';
  cross.setAttribute('aria-hidden', 'true');
  close.append(cross);
  top.append(brand, close);

  const nav: HTMLElement = document.createElement('nav');
  nav.className = 'mobile-menu__nav';
  nav.setAttribute('aria-label', 'Main navigation');
  const links: HTMLAnchorElement[] = MOBILE_NAVIGATION_ITEMS.map(
    (item: MobileNavigationItem): HTMLAnchorElement => {
      const link: HTMLAnchorElement = document.createElement('a');
      link.textContent = item.label;
      link.href = getPageHref(item.targetPage);
      link.dataset.targetPage = item.targetPage;
      if (item.activePage !== undefined) {
        link.dataset.activePage = item.activePage;
      }
      if (item.activePage === options.activePage) {
        link.setAttribute('aria-current', 'page');
      }
      return link;
    },
  );
  nav.append(...links);
  const buttons: HTMLDivElement = document.createElement('div');
  buttons.className = 'mobile-menu__buttons';
  element.append(top, nav, buttons);

  let isClosing: boolean = false;
  let previousOverflow: string = '';
  let pendingAuth: AuthMode | undefined;
  let pendingPage: AppPage | undefined;
  let closeTimer: number | undefined;
  let openFrame: number | undefined;

  function finishClose(): void {
    if (!isClosing) {
      return;
    }
    clearTimeout(closeTimer);
    element.close();
    isClosing = false;
    document.body.style.overflow = previousOverflow;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open navigation');
    trigger.classList.remove('header__burger--open');
    if (tablet.matches) {
      trigger.focus();
    }
    if (pendingAuth !== undefined) {
      const mode: AuthMode = pendingAuth;
      pendingAuth = undefined;
      options.onAuth(mode);
    } else if (pendingPage !== undefined) {
      const page: AppPage = pendingPage;
      pendingPage = undefined;
      options.onNavigate(page);
    }
  }

  function closeMenu(): void {
    if (isClosing || !element.open) {
      return;
    }
    isClosing = true;
    cancelAnimationFrame(openFrame ?? 0);
    element.classList.remove('mobile-menu--open');
    trigger.classList.remove('header__burger--open');
    const duration: number = Number(
      getComputedStyle(element).getPropertyValue('--menu-duration').replace('ms', '').trim(),
    );
    closeTimer = setTimeout(finishClose, duration);
  }

  function createAuthButton(label: string, mode: AuthMode): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement('button');
    button.type = 'button';
    button.className = `mobile-menu__button mobile-menu__button--${mode}`;
    button.textContent = label;
    button.addEventListener('click', (): void => {
      if (isClosing) {
        return;
      }
      pendingAuth = mode;
      closeMenu();
    });
    return button;
  }

  buttons.append(createAuthButton('Log In', 'login'), createAuthButton('Sign Up', 'signup'));
  close.addEventListener('click', closeMenu);
  brand.addEventListener('click', (event: MouseEvent): void => {
    event.preventDefault();
    pendingPage = 'home';
    closeMenu();
  });
  for (const link of links) {
    link.addEventListener('click', (event: MouseEvent): void => {
      event.preventDefault();
      const targetPage: string | undefined = link.dataset.targetPage;
      pendingPage = targetPage === 'library' ? 'library' : 'home';
      closeMenu();
    });
  }
  element.addEventListener('cancel', (event: Event): void => {
    event.preventDefault();
    closeMenu();
  });
  element.addEventListener('transitionend', (event: TransitionEvent): void => {
    if (event.target !== element || event.propertyName !== 'opacity') {
      return;
    }
    finishClose();
  });
  const breakpoint: string = getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint-tablet')
    .trim();
  const tablet: MediaQueryList = matchMedia(`(max-width: ${breakpoint})`);
  tablet.addEventListener('change', (event: MediaQueryListEvent): void => {
    if (event.matches || !element.open) {
      return;
    }
    closeMenu();
    finishClose();
  });

  function open(): void {
    if (isClosing || element.open || !tablet.matches) {
      return;
    }
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    close.focus();
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close navigation');
    trigger.classList.add('header__burger--open');
    // Force the initial opacity to resolve before transitioning to the open state.
    element.getBoundingClientRect();
    openFrame = requestAnimationFrame((): void => {
      element.classList.add('mobile-menu--open');
    });
  }

  return { element, open };
}
