import type { GamesListController } from './games-list';
import { createGamesList } from './games-list';
import './library-page.scss';
import { createLibraryToolbar } from './library-toolbar';
import type { LibraryPageOptions } from './library-types';
import { createPagination } from './pagination';

export function createLibraryPage(options: LibraryPageOptions): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-labelledby', 'library-page-title');
  const gamesList: GamesListController = createGamesList({
    onDetails: options.onGameDetails,
    onNotify: options.onNotify,
  });
  const toolbar: HTMLElement = createLibraryToolbar({
    onFiltersChange: gamesList.updateFilters,
    onNotify: options.onNotify,
  });
  page.append(toolbar, gamesList.element, createPagination());
  return page;
}
