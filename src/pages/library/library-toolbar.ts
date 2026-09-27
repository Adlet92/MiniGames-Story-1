import categoriesJson from '../../data/categories.json';
import type { CategoriesResponse } from './library-types';
import './library-toolbar.scss';

interface SortOption {
  label: string;
  value: string;
}

const CATEGORIES: CategoriesResponse = categoriesJson;
const SORT_OPTIONS: SortOption[] = [
  { label: 'Rating ↓', value: 'rating-desc' },
  { label: 'Rating ↑', value: 'rating-asc' },
  { label: 'Most Liked', value: 'likes-desc' },
  { label: 'Name A–Z', value: 'name-asc' },
];

export function createLibraryToolbar(): HTMLElement {
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
  let activeChip: HTMLButtonElement | undefined;

  for (const category of CATEGORIES.data) {
    const chip: HTMLButtonElement = document.createElement('button');
    chip.type = 'button';
    chip.className = 'library-toolbar__chip';
    chip.dataset.category = category.slug;
    chip.textContent = category.label;
    chip.setAttribute('aria-pressed', String(category.isDefault));
    if (category.isDefault) {
      activeChip = chip;
    }
    chip.addEventListener('click', (): void => {
      activeChip?.setAttribute('aria-pressed', 'false');
      chip.setAttribute('aria-pressed', 'true');
      activeChip = chip;
    });
    chips.append(chip);
  }

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
  let selectedSort: SortOption = SORT_OPTIONS[0] as SortOption;

  function closeSort(): void {
    sortList.hidden = true;
    sortButton.setAttribute('aria-expanded', 'false');
  }

  function updateSortLabel(): void {
    sortLabel.textContent = `Sort by: ${selectedSort.label}`;
  }

  for (const option of SORT_OPTIONS) {
    const item: HTMLLIElement = document.createElement('li');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(option.value === selectedSort.value));
    const button: HTMLButtonElement = document.createElement('button');
    button.type = 'button';
    button.className = 'library-toolbar__sort-option';
    button.textContent = option.label;
    button.addEventListener('click', (): void => {
      selectedSort = option;
      const items: NodeListOf<HTMLLIElement> = sortList.querySelectorAll('[role="option"]');
      for (const listItem of items) {
        listItem.setAttribute('aria-selected', String(listItem === item));
      }
      updateSortLabel();
      closeSort();
      sortButton.focus();
    });
    item.append(button);
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

  updateSortLabel();
  sort.append(sortButton, sortList);
  controls.append(chips, sort);
  section.append(heading, controls);
  return section;
}
