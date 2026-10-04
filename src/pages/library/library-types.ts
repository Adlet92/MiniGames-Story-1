export interface CategoryData {
  isDefault: boolean;
  label: string;
  slug: string;
}

export interface CategoriesResponse {
  data: CategoryData[];
  meta: {
    description: string;
    totalItems: number;
  };
}

export interface LibraryPageOptions {
  onGameDetails: (slug: string) => void;
  onNotify: Snackbar['show'];
}
import type { Snackbar } from '../../components/ui/snackbar/snackbar';
