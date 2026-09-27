import './pagination.scss';

const TOTAL_PAGES: number = 8;
const DESKTOP_VISIBLE_PAGES: number = 4;
const MOBILE_VISIBLE_PAGES: number = 3;

function getVisiblePages(activePage: number, limit: number): number[] {
  const maximumStart: number = TOTAL_PAGES - limit + 1;
  const preferredStart: number = activePage - Math.floor(limit / 2);
  const start: number = Math.max(1, Math.min(preferredStart, maximumStart));
  return Array.from({ length: limit }, (_value: unknown, index: number): number => start + index);
}

function createArrow(label: string, symbol: string): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'pagination__button pagination__arrow';
  button.setAttribute('aria-label', label);
  button.textContent = symbol;
  return button;
}

export function createPagination(): HTMLElement {
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
  let activePage: number = 1;

  function render(): void {
    const limit: number = mobileQuery.matches ? MOBILE_VISIBLE_PAGES : DESKTOP_VISIBLE_PAGES;
    const visiblePages: number[] = getVisiblePages(activePage, limit);
    const buttons: HTMLButtonElement[] = visiblePages.map((page: number): HTMLButtonElement => {
      const button: HTMLButtonElement = document.createElement('button');
      button.type = 'button';
      button.className = 'pagination__button pagination__page';
      button.textContent = String(page);
      button.setAttribute('aria-label', `Page ${page}`);
      button.setAttribute('aria-current', page === activePage ? 'page' : 'false');
      button.addEventListener('click', (): void => {
        activePage = page;
        render();
      });
      return button;
    });
    pageButtons.replaceChildren(...buttons);
    previous.disabled = activePage === 1;
    next.disabled = activePage === TOTAL_PAGES;
  }

  previous.addEventListener('click', (): void => {
    if (activePage <= 1) {
      return;
    }
    activePage -= 1;
    render();
  });
  next.addEventListener('click', (): void => {
    if (activePage >= TOTAL_PAGES) {
      return;
    }
    activePage += 1;
    render();
  });
  mobileQuery.addEventListener('change', render);

  render();
  controls.append(previous, pageButtons, next);
  navigation.append(controls);
  return navigation;
}
