import type { Snackbar } from '../../components/ui/snackbar/snackbar';
import type { CategorySlug, GameSort } from '../../services/games-api';

export interface LibraryFilters {
  category: CategorySlug;
  sort: GameSort;
}

export interface LibraryPagination {
  page: number;
  totalPages: number;
}

export interface LibraryViewState extends LibraryFilters {
  page: number;
}

export interface LibraryStateUpdate {
  category?: CategorySlug;
  page?: number;
  sort?: GameSort;
}

export interface LibraryPageOptions {
  initialState: LibraryViewState;
  onGameDetails: (slug: string) => void;
  onNotify: Snackbar['show'];
  onStateChange: (update: LibraryStateUpdate) => void;
}

export interface LibraryPageController {
  element: HTMLElement;
  updateState: (state: LibraryViewState) => void;
}
