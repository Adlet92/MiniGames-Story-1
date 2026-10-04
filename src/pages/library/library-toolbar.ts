import {
  createChipSkeleton,
  createEmptyState,
  createErrorBanner,
} from '../../components/ui/data-state/data-state';
import type { Snackbar } from '../../components/ui/snackbar/snackbar';
import type { CategoriesResponse, Category } from '../../services/categories-api';
import { fetchCategories } from '../../services/categories-api';
import type { CategorySlug, GameSort } from '../../services/games-api';
import './library-toolbar.scss';
import type { LibraryFilters } from './library-types';

interface SortOption {
  label: string;
  value: GameSort;
}

export interface LibraryToolbarOptions {
  initialFilters: LibraryFilters;
  onFiltersChange: (filters: LibraryFilters) => void;
  onNotify: Snackbar['show'];
}

export interface LibraryToolbarController {
  element: HTMLElement;
  updateFilters: (filters: LibraryFilters) => void;
}

const CATEGORY_SKELETON_COUNT: number = 7;
const SORT_OPTIONS: SortOption[] = [
  { label: 'Rating ↓', value: 'rating-desc' },
  { label: 'Rating ↑', value: 'rating-asc' },
  { label: 'Name A–Z', value: 'name-asc' },
  { label: 'Name Z–A', value: 'name-desc' },
];

function getLoadErrorMessage(error: unknown): string {
  return error instanceof Error
    ? 'The categories request failed. Check your connection and try again.'
    : 'An unexpected error occurred while loading categories.';
}

export function createLibraryToolbar(options: LibraryToolbarOptions): LibraryToolbarController {
  const section: HTMLElement = document.createElement('section');
  section.className = 'library-toolbar';
  section.setAttribute('aria-labelledby', 'library-page-title');

  const heading: HTMLHeadingElement = document.createElement('h1');
  heading.className = 'library-toolbar__title';
  heading.id = 'library-page-title';
  heading.textContent = 'Game Library';

  const controls: HTMLDivElement = document.createElement('div');
  controls.className = 'library-toolbar__controls';
  const chips: HTMLDivElement = document.createElement('div');
  chips.className = 'library-toolbar__chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Filter games by category');

  const categoryButtons: Map<CategorySlug, HTMLButtonElement> = new Map<
    CategorySlug,
    HTMLButtonElement
  >();
  const sortItems: Map<GameSort, HTMLLIElement> = new Map<GameSort, HTMLLIElement>();
  let selectedCategory: CategorySlug = options.initialFilters.category;
  let selectedSort: GameSort = options.initialFilters.sort;
  let requestVersion: number = 0;
  let hasFailedRequest: boolean = false;

  const renderCategories: (categories: Category[]) => void = (categories: Category[]): void => {
    const defaultCategory: Category | undefined =
      categories.find((category: Category): boolean => category.isDefault) ?? categories[0];

    if (defaultCategory === undefined) {
      chips.replaceChildren(
        createEmptyState('No categories found', 'No game categories are available right now.'),
      );
      return;
    }

    const hasSelectedCategory: boolean = categories.some(
      (category: Category): boolean => category.slug === selectedCategory,
    );
    const fallbackCategory: CategorySlug = defaultCategory.slug;
    const shouldCorrectCategory: boolean = !hasSelectedCategory;

    if (shouldCorrectCategory) {
      selectedCategory = fallbackCategory;
    }

    categoryButtons.clear();
    const fragment: DocumentFragment = document.createDocumentFragment();

    for (const category of categories) {
      const chip: HTMLButtonElement = document.createElement('button');
      const isActive: boolean = category.slug === selectedCategory;
      chip.type = 'button';
      chip.className = 'library-toolbar__chip';
      chip.dataset.category = category.slug;
      chip.textContent = category.label;
      chip.setAttribute('aria-pressed', String(isActive));

      chip.addEventListener('click', (): void => {
        if (selectedCategory === category.slug) {
          return;
        }

        options.onFiltersChange({ category: category.slug, sort: selectedSort });
      });
      categoryButtons.set(category.slug, chip);
      fragment.append(chip);
    }

    chips.replaceChildren(fragment);

    if (shouldCorrectCategory) {
      options.onFiltersChange({ category: fallbackCategory, sort: selectedSort });
    }
  };

  const sort: HTMLDivElement = document.createElement('div');
  sort.className = 'library-toolbar__sort';
  const sortButton: HTMLButtonElement = document.createElement('button');
  sortButton.type = 'button';
  sortButton.className = 'library-toolbar__sort-button';
  sortButton.setAttribute('aria-haspopup', 'listbox');
  sortButton.setAttribute('aria-expanded', 'false');
  sortButton.setAttribute('aria-controls', 'library-sort-options');
  const sortLabel: HTMLSpanElement = document.createElement('span');
  const sortArrow: HTMLSpanElement = document.createElement('span');
  sortArrow.className = 'library-toolbar__sort-arrow';
  sortArrow.setAttribute('aria-hidden', 'true');
  sortArrow.textContent = '▾';
  sortButton.append(sortLabel, sortArrow);

  const sortList: HTMLUListElement = document.createElement('ul');
  sortList.className = 'library-toolbar__sort-list';
  sortList.id = 'library-sort-options';
  sortList.setAttribute('role', 'listbox');
  sortList.hidden = true;

  function closeSort(): void {
    sortList.hidden = true;
    sortButton.setAttribute('aria-expanded', 'false');
  }

  function updateSortLabel(): void {
    const option: SortOption =
      SORT_OPTIONS.find((item: SortOption): boolean => item.value === selectedSort) ??
      (SORT_OPTIONS[0] as SortOption);
    sortLabel.textContent = `Sort by: ${option.label}`;
  }

  for (const option of SORT_OPTIONS) {
    const item: HTMLLIElement = document.createElement('li');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(option.value === selectedSort));
    const button: HTMLButtonElement = document.createElement('button');
    button.type = 'button';
    button.className = 'library-toolbar__sort-option';
    button.textContent = option.label;
    button.addEventListener('click', (): void => {
      const hasChanged: boolean = selectedSort !== option.value;
      closeSort();
      sortButton.focus();

      if (hasChanged) {
        options.onFiltersChange({ category: selectedCategory, sort: option.value });
      }
    });
    item.append(button);
    sortItems.set(option.value, item);
    sortList.append(item);
  }

  sortButton.addEventListener('click', (): void => {
    const isOpen: boolean = !sortList.hidden;
    sortList.hidden = isOpen;
    sortButton.setAttribute('aria-expanded', String(!isOpen));
  });
  sort.addEventListener('keydown', (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') {
      return;
    }

    closeSort();
    sortButton.focus();
  });
  sort.addEventListener('focusout', (event: FocusEvent): void => {
    if (event.relatedTarget instanceof Node && sort.contains(event.relatedTarget)) {
      return;
    }

    closeSort();
  });

  const loadCategories: () => Promise<void> = async (): Promise<void> => {
    const currentRequest: number = ++requestVersion;
    chips.setAttribute('aria-busy', 'true');
    chips.replaceChildren(createChipSkeleton(CATEGORY_SKELETON_COUNT, 'Loading game categories'));

    try {
      const response: CategoriesResponse = await fetchCategories();

      if (currentRequest !== requestVersion || !section.isConnected) {
        return;
      }

      chips.removeAttribute('aria-busy');
      renderCategories(response.data);

      if (hasFailedRequest) {
        options.onNotify('Game categories loaded successfully.', 'success');
        hasFailedRequest = false;
      }
    } catch (error: unknown) {
      if (currentRequest !== requestVersion || !section.isConnected) {
        return;
      }

      chips.removeAttribute('aria-busy');
      hasFailedRequest = true;
      chips.replaceChildren(
        createErrorBanner(
          getLoadErrorMessage(error),
          (): void => {
            void loadCategories();
          },
          'Unable to load categories',
        ),
      );
      options.onNotify('Game categories could not be loaded.', 'error');
    }
  };

  const updateFilters: (filters: LibraryFilters) => void = (filters: LibraryFilters): void => {
    selectedCategory = filters.category;
    selectedSort = filters.sort;

    for (const [category, button] of categoryButtons) {
      button.setAttribute('aria-pressed', String(category === selectedCategory));
    }

    for (const [sortValue, item] of sortItems) {
      item.setAttribute('aria-selected', String(sortValue === selectedSort));
    }

    updateSortLabel();
  };

  updateFilters(options.initialFilters);
  sort.append(sortButton, sortList);
  controls.append(chips, sort);
  section.append(heading, controls);
  requestAnimationFrame((): void => {
    void loadCategories();
  });
  return { element: section, updateFilters };
}
