import type { GamesListController } from './games-list';
import { createGamesList } from './games-list';
import './library-page.scss';
import { createLibraryToolbar } from './library-toolbar';
import type { LibraryPageOptions, LibraryPagination } from './library-types';
import type { PaginationController } from './pagination';
import { createPagination } from './pagination';

export function createLibraryPage(options: LibraryPageOptions): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-labelledby', 'library-page-title');
  const paginationHost: { controller?: PaginationController } = {};
  const gamesList: GamesListController = createGamesList({
    onDetails: options.onGameDetails,
    onNotify: options.onNotify,
    onPaginationChange: (state: LibraryPagination): void =>
      paginationHost.controller?.update(state),
  });
  const pagination: PaginationController = createPagination({
    onPageChange: gamesList.updatePage,
  });
  paginationHost.controller = pagination;
  const toolbar: HTMLElement = createLibraryToolbar({
    onFiltersChange: gamesList.updateFilters,
    onNotify: options.onNotify,
  });
  page.append(toolbar, gamesList.element, pagination.element);
  return page;
}
