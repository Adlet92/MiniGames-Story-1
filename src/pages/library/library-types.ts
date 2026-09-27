export interface GameData {
  cardImage: string;
  category: string;
  featured: boolean;
  likesCount: number;
  name: string;
  price: string;
  rating: number;
  shortDescription: string;
  slug: string;
}

export interface GamesResponse {
  data: GameData[];
  meta: {
    description: string;
    featuredCount: number;
    totalItems: number;
  };
}

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
  onGameDetails: () => void;
}
