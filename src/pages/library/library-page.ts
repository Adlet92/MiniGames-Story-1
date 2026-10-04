import type { GamesListController } from './games-list';
import { createGamesList } from './games-list';
import './library-page.scss';
import type { LibraryToolbarController } from './library-toolbar';
import { createLibraryToolbar } from './library-toolbar';
import type {
  LibraryFilters,
  LibraryPageController,
  LibraryPageOptions,
  LibraryPagination,
  LibraryViewState,
} from './library-types';
import type { PaginationController } from './pagination';
import { createPagination } from './pagination';

export function createLibraryPage(options: LibraryPageOptions): LibraryPageController {
  const page: HTMLElement = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-labelledby', 'library-page-title');
  const paginationHost: { controller?: PaginationController } = {};
  let currentState: LibraryViewState = options.initialState;
  const gamesList: GamesListController = createGamesList({
    onDetails: options.onGameDetails,
    onNotify: options.onNotify,
    onPaginationChange: (state: LibraryPagination): void => {
      paginationHost.controller?.update(state);

      if (state.page !== currentState.page) {
        options.onStateChange({ page: state.page });
      }
    },
  });
  const pagination: PaginationController = createPagination({
    onPageChange: (pageNumber: number): void => options.onStateChange({ page: pageNumber }),
  });
  paginationHost.controller = pagination;
  const toolbar: LibraryToolbarController = createLibraryToolbar({
    initialFilters: options.initialState,
    onFiltersChange: (filters: LibraryFilters): void => options.onStateChange(filters),
    onNotify: options.onNotify,
  });

  const updateState: (state: LibraryViewState) => void = (state: LibraryViewState): void => {
    currentState = state;
    toolbar.updateFilters(state);
    pagination.setPage(state.page);
    gamesList.updateState(state);
  };

  page.append(toolbar.element, gamesList.element, pagination.element);
  updateState(options.initialState);
  return { element: page, updateState };
}
