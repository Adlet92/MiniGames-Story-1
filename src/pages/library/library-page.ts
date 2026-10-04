import { createGamesList } from './games-list';
import './library-page.scss';
import { createLibraryToolbar } from './library-toolbar';
import type { LibraryPageOptions } from './library-types';
import { createPagination } from './pagination';

export function createLibraryPage(options: LibraryPageOptions): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-labelledby', 'library-page-title');
  page.append(
    createLibraryToolbar(),
    createGamesList({ onDetails: options.onGameDetails, onNotify: options.onNotify }),
    createPagination(),
  );
  return page;
}
