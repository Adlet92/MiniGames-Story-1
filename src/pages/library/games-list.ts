import heartIconUrl from '../../assets/icons/heart_icon.svg';
import starIconUrl from '../../assets/icons/star_icon.svg';
import {
  createCardGridSkeleton,
  createEmptyState,
  createErrorBanner,
} from '../../components/ui/data-state/data-state';
import type { Snackbar } from '../../components/ui/snackbar/snackbar';
import type { GamesListResponse, PublicGame } from '../../services/games-api';
import { fetchGames } from '../../services/games-api';
import { getGameImage } from './game-images';
import './games-list.scss';
import type { LibraryFilters, LibraryPagination } from './library-types';

export interface GamesListOptions {
  onDetails: (slug: string) => void;
  onNotify: Snackbar['show'];
  onPaginationChange: (pagination: LibraryPagination) => void;
}

export interface GamesListController {
  element: HTMLElement;
  updateFilters: (filters: LibraryFilters) => void;
  updatePage: (page: number) => void;
}

const PAGE_SIZE: number = 6;
const FIRST_PAGE: number = 1;
const likesFormatter: Intl.NumberFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function createMetric(iconUrl: string, value: string, label: string): HTMLSpanElement {
  const metric: HTMLSpanElement = document.createElement('span');
  metric.className = 'game-card__metric';
  metric.setAttribute('aria-label', label);
  const icon: HTMLImageElement = document.createElement('img');
  icon.src = iconUrl;
  icon.alt = '';
  icon.width = 18;
  icon.height = 18;
  const text: HTMLSpanElement = document.createElement('span');
  text.textContent = value;
  metric.append(icon, text);
  return metric;
}

function createGameCard(game: PublicGame, onDetails: (slug: string) => void): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = 'games-list__item';
  const card: HTMLElement = document.createElement('article');
  card.className = 'game-card';

  const image: HTMLImageElement = document.createElement('img');
  image.className = 'game-card__image';
  image.src = getGameImage(game.slug, game.cardImage);
  image.alt = `${game.name} game artwork`;
  image.loading = 'lazy';

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-card__content';
  const heading: HTMLHeadingElement = document.createElement('h2');
  heading.className = 'game-card__title';
  heading.textContent = game.name;

  const badges: HTMLDivElement = document.createElement('div');
  badges.className = 'game-card__badges';
  const category: HTMLSpanElement = document.createElement('span');
  category.className = 'game-card__badge';
  category.textContent = game.category;
  const price: HTMLSpanElement = document.createElement('span');
  price.className = 'game-card__price';
  price.textContent = game.price;
  badges.append(category, price);

  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'game-card__description';
  description.textContent = game.shortDescription;

  const footer: HTMLDivElement = document.createElement('div');
  footer.className = 'game-card__footer';
  const metrics: HTMLDivElement = document.createElement('div');
  metrics.className = 'game-card__metrics';
  metrics.append(
    createMetric(starIconUrl, game.rating.toFixed(1), `${game.rating.toFixed(1)} rating`),
    createMetric(
      heartIconUrl,
      likesFormatter.format(game.likesCount),
      `${game.likesCount.toLocaleString('en')} likes`,
    ),
  );
  const details: HTMLButtonElement = document.createElement('button');
  details.type = 'button';
  details.className = 'game-card__details';
  details.textContent = 'Details';
  details.setAttribute('aria-label', `View details for ${game.name}`);
  details.addEventListener('click', (): void => onDetails(game.slug));
  footer.append(metrics, details);

  content.append(heading, badges, description, footer);
  card.append(image, content);
  item.append(card);
  return item;
}

function createGamesGrid(games: PublicGame[], onDetails: (slug: string) => void): HTMLElement {
  const list: HTMLUListElement = document.createElement('ul');
  list.className = 'games-list__grid';
  list.append(...games.map((game: PublicGame): HTMLLIElement => createGameCard(game, onDetails)));
  return list;
}

function getLoadErrorMessage(error: unknown): string {
  return error instanceof Error
    ? 'The games request failed. Check your connection and try again.'
    : 'An unexpected error occurred while loading games.';
}

export function createGamesList(options: GamesListOptions): GamesListController {
  const section: HTMLElement = document.createElement('section');
  section.className = 'games-list';
  section.setAttribute('aria-label', 'Available games');
  const content: HTMLDivElement = document.createElement('div');
  content.className = 'games-list__content';
  section.append(content);

  let requestVersion: number = 0;
  let hasFailedRequest: boolean = false;
  let activeRequest: AbortController | undefined;
  let currentFilters: LibraryFilters | undefined;
  let currentPage: number = FIRST_PAGE;

  const loadGames: (filters: LibraryFilters, page: number) => Promise<void> = async (
    filters: LibraryFilters,
    page: number,
  ): Promise<void> => {
    const currentRequest: number = ++requestVersion;
    activeRequest?.abort();
    activeRequest = new AbortController();
    content.replaceChildren(createCardGridSkeleton(PAGE_SIZE, 'Loading Library games'));

    try {
      const response: GamesListResponse = await fetchGames(
        {
          category: filters.category,
          sort: filters.sort,
          page,
          limit: PAGE_SIZE,
        },
        activeRequest.signal,
      );

      if (currentRequest !== requestVersion || !section.isConnected) {
        return;
      }

      const totalPages: number = Math.max(FIRST_PAGE, Math.trunc(response.meta.totalPages));
      const responsePage: number = Math.max(FIRST_PAGE, Math.trunc(response.meta.page));
      const pagination: LibraryPagination = {
        page: Math.min(responsePage, totalPages),
        totalPages,
      };
      currentPage = pagination.page;
      options.onPaginationChange(pagination);

      if (hasFailedRequest) {
        options.onNotify('Library games loaded successfully.', 'success');
        hasFailedRequest = false;
      }

      if (response.data.length === 0) {
        content.replaceChildren(
          createEmptyState('Data Not Found', 'There are no games for the selected criteria.'),
        );
        return;
      }

      content.replaceChildren(createGamesGrid(response.data, options.onDetails));
    } catch (error: unknown) {
      if (
        currentRequest !== requestVersion ||
        !section.isConnected ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        return;
      }

      hasFailedRequest = true;
      content.replaceChildren(
        createErrorBanner(
          getLoadErrorMessage(error),
          (): void => {
            if (currentFilters !== undefined) {
              void loadGames(currentFilters, currentPage);
            }
          },
          'Unable to load Library games',
        ),
      );
      options.onNotify('Library games could not be loaded.', 'error');
    }
  };

  const updateFilters: (filters: LibraryFilters) => void = (filters: LibraryFilters): void => {
    currentFilters = filters;
    currentPage = FIRST_PAGE;
    void loadGames(filters, currentPage);
  };

  const updatePage: (page: number) => void = (page: number): void => {
    if (currentFilters === undefined || page === currentPage || page < FIRST_PAGE) {
      return;
    }

    currentPage = page;
    void loadGames(currentFilters, currentPage);
  };

  content.replaceChildren(createCardGridSkeleton(PAGE_SIZE, 'Loading Library games'));
  return { element: section, updateFilters, updatePage };
}
