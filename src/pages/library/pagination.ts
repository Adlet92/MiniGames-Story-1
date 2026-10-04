import type { LibraryPagination } from './library-types';
import './pagination.scss';

const DESKTOP_VISIBLE_PAGES: number = 4;
const MOBILE_VISIBLE_PAGES: number = 3;
const FIRST_PAGE: number = 1;

export interface PaginationOptions {
  onPageChange: (page: number) => void;
}

export interface PaginationController {
  element: HTMLElement;
  update: (pagination: LibraryPagination) => void;
}

function normalizeTotalPages(totalPages: number): number {
  return Math.max(FIRST_PAGE, Math.trunc(totalPages));
}

function normalizePage(page: number, totalPages: number): number {
  return Math.min(Math.max(FIRST_PAGE, Math.trunc(page)), totalPages);
}

function getVisiblePages(activePage: number, totalPages: number, limit: number): number[] {
  const visibleCount: number = Math.min(limit, totalPages);
  const maximumStart: number = totalPages - visibleCount + FIRST_PAGE;
  const preferredStart: number = activePage - Math.floor(visibleCount / 2);
  const start: number = Math.max(FIRST_PAGE, Math.min(preferredStart, maximumStart));

  return Array.from(
    { length: visibleCount },
    (_value: unknown, index: number): number => start + index,
  );
}

function createArrow(label: string, symbol: string): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'pagination__button pagination__arrow';
  button.setAttribute('aria-label', label);
  button.textContent = symbol;
  return button;
}

export function createPagination(options: PaginationOptions): PaginationController {
  const navigation: HTMLElement = document.createElement('nav');
  navigation.className = 'pagination';
  navigation.setAttribute('aria-label', 'Game library pagination');

  const controls: HTMLDivElement = document.createElement('div');
  controls.className = 'pagination__controls';
  const previous: HTMLButtonElement = createArrow('Previous page', '‹');
  const next: HTMLButtonElement = createArrow('Next page', '›');
  const pageButtons: HTMLDivElement = document.createElement('div');
  pageButtons.className = 'pagination__pages';
  const mobileQuery: MediaQueryList = matchMedia('(max-width: 375px)');
  let activePage: number = FIRST_PAGE;
  let totalPages: number = FIRST_PAGE;

  const requestPage: (page: number) => void = (page: number): void => {
    const nextPage: number = normalizePage(page, totalPages);

    if (nextPage === activePage) {
      return;
    }

    activePage = nextPage;
    render();
    options.onPageChange(nextPage);
  };

  function render(): void {
    const visibleLimit: number = mobileQuery.matches ? MOBILE_VISIBLE_PAGES : DESKTOP_VISIBLE_PAGES;
    const visiblePages: number[] = getVisiblePages(activePage, totalPages, visibleLimit);
    const buttons: HTMLButtonElement[] = visiblePages.map((page: number): HTMLButtonElement => {
      const button: HTMLButtonElement = document.createElement('button');
      button.type = 'button';
      button.className = 'pagination__button pagination__page';
      button.textContent = String(page);
      button.setAttribute('aria-label', `Page ${page} of ${totalPages}`);
      button.setAttribute('aria-current', page === activePage ? 'page' : 'false');
      button.addEventListener('click', (): void => requestPage(page));
      return button;
    });

    pageButtons.replaceChildren(...buttons);
    previous.disabled = activePage === FIRST_PAGE;
    next.disabled = activePage === totalPages;
    navigation.setAttribute(
      'aria-label',
      `Game library pagination, page ${activePage} of ${totalPages}`,
    );
  }

  previous.addEventListener('click', (): void => requestPage(activePage - 1));
  next.addEventListener('click', (): void => requestPage(activePage + 1));
  mobileQuery.addEventListener('change', render);

  const update: (pagination: LibraryPagination) => void = (pagination: LibraryPagination): void => {
    totalPages = normalizeTotalPages(pagination.totalPages);
    activePage = normalizePage(pagination.page, totalPages);
    render();
  };

  render();
  controls.append(previous, pageButtons, next);
  navigation.append(controls);
  return { element: navigation, update };
}
