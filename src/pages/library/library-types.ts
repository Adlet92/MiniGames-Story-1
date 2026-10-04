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

export interface LibraryPageOptions {
  onGameDetails: (slug: string) => void;
  onNotify: Snackbar['show'];
}
