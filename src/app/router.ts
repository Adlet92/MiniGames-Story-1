import type { CategorySlug, GameSort } from '../services/games-api';
import { DEFAULT_GAME_SORT } from '../services/games-api';

export type AppPage = 'home' | 'library';
export type AuthRouteMode = 'login' | 'register';

export interface AppRouteState {
  authMode?: AuthRouteMode;
  category: CategorySlug;
  gameSlug?: string;
  page: AppPage;
  pageNumber: number;
  sort: GameSort;
}

export interface LibraryRouteUpdate {
  category?: CategorySlug;
  pageNumber?: number;
  sort?: GameSort;
}

export interface AppRouter {
  closeDialog: () => void;
  getState: () => AppRouteState;
  navigate: (page: AppPage) => void;
  openAuth: (mode: AuthRouteMode) => void;
  openGame: (gameSlug: string) => void;
  start: () => void;
  subscribe: (listener: RouteListener) => () => void;
  updateLibrary: (update: LibraryRouteUpdate) => void;
}

interface HistoryEntryState {
  dialogEntry?: boolean;
  returnUrl?: string;
}

type RouteListener = (state: AppRouteState) => void;

const CATEGORY_VALUES: ReadonlySet<string> = new Set<string>([
  'all',
  'puzzle',
  'card',
  'match',
  'farm',
  'strategy',
  'arcade',
]);
const SORT_VALUES: ReadonlySet<string> = new Set<string>([
  'rating-desc',
  'rating-asc',
  'name-asc',
  'name-desc',
]);
const GAME_SLUG_PATTERN: RegExp = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FIRST_PAGE: number = 1;

function isCategorySlug(value: string | null): value is CategorySlug {
  return value !== null && CATEGORY_VALUES.has(value);
}

function isGameSort(value: string | null): value is GameSort {
  return value !== null && SORT_VALUES.has(value);
}

function readPageNumber(value: string | null): number {
  return value === null || !/^\d+$/.test(value) ? FIRST_PAGE : Math.max(FIRST_PAGE, Number(value));
}

function readAuthMode(value: string | null): AuthRouteMode | undefined {
  return value === 'login' || value === 'register' ? value : undefined;
}

function readGameSlug(value: string | null): string | undefined {
  return value !== null && GAME_SLUG_PATTERN.test(value) ? value : undefined;
}

export function parseRoute(url: URL = new URL(location.href)): AppRouteState {
  const page: AppPage = url.pathname === '/library' ? 'library' : 'home';
  const categoryValue: string | null = url.searchParams.get('category');
  const sortValue: string | null = url.searchParams.get('sort');
  const authMode: AuthRouteMode | undefined = readAuthMode(url.searchParams.get('auth'));
  const gameSlug: string | undefined = readGameSlug(url.searchParams.get('game'));

  return {
    page,
    category: isCategorySlug(categoryValue) ? categoryValue : 'all',
    sort: isGameSort(sortValue) ? sortValue : DEFAULT_GAME_SORT,
    pageNumber: readPageNumber(url.searchParams.get('page')),
    ...(gameSlug !== undefined && authMode === undefined && { gameSlug }),
    ...(authMode !== undefined && { authMode }),
  };
}

export function buildRouteUrl(state: AppRouteState): string {
  const path: string = state.page === 'library' ? '/library' : '/';
  const parameters: URLSearchParams = new URLSearchParams();

  if (state.page === 'library') {
    parameters.set('category', state.category);
    parameters.set('sort', state.sort);
    parameters.set('page', String(state.pageNumber));
  }

  if (state.gameSlug !== undefined) {
    parameters.set('game', state.gameSlug);
  } else if (state.authMode !== undefined) {
    parameters.set('auth', state.authMode);
  }

  const query: string = parameters.toString();
  return query.length > 0 ? `${path}?${query}` : path;
}

function hasSameState(first: AppRouteState, second: AppRouteState): boolean {
  return (
    first.page === second.page &&
    first.category === second.category &&
    first.sort === second.sort &&
    first.pageNumber === second.pageNumber &&
    first.gameSlug === second.gameSlug &&
    first.authMode === second.authMode
  );
}

function withoutDialogs(state: AppRouteState): AppRouteState {
  const nextState: AppRouteState = { ...state };
  delete nextState.gameSlug;
  delete nextState.authMode;
  return nextState;
}

function getCurrentHistoryState(): HistoryEntryState {
  return isHistoryEntryState(history.state) ? history.state : {};
}

export function createRouter(): AppRouter {
  const listeners: Set<RouteListener> = new Set<RouteListener>();
  let currentState: AppRouteState = parseRoute();
  let hasStarted: boolean = false;

  const notify: () => void = (): void => {
    for (const listener of listeners) {
      listener({ ...currentState });
    }
  };

  const commit: (
    nextState: AppRouteState,
    mode?: 'push' | 'replace',
    historyState?: HistoryEntryState,
  ) => void = (
    nextState: AppRouteState,
    mode: 'push' | 'replace' = 'push',
    historyState: HistoryEntryState = {},
  ): void => {
    if (hasSameState(currentState, nextState)) {
      return;
    }

    currentState = nextState;
    const url: string = buildRouteUrl(nextState);

    if (mode === 'replace') {
      history.replaceState(historyState, '', url);
    } else {
      history.pushState(historyState, '', url);
    }

    notify();
  };

  const getState: () => AppRouteState = (): AppRouteState => ({ ...currentState });

  const navigate: (page: AppPage) => void = (page: AppPage): void => {
    const nextState: AppRouteState = {
      page,
      category: 'all',
      sort: DEFAULT_GAME_SORT,
      pageNumber: FIRST_PAGE,
    };
    commit(nextState);
  };

  const updateLibrary: (update: LibraryRouteUpdate) => void = (
    update: LibraryRouteUpdate,
  ): void => {
    if (currentState.page !== 'library') {
      return;
    }

    const hasFilterChange: boolean = update.category !== undefined || update.sort !== undefined;
    const nextState: AppRouteState = {
      ...currentState,
      category: update.category ?? currentState.category,
      sort: update.sort ?? currentState.sort,
      pageNumber: hasFilterChange ? FIRST_PAGE : (update.pageNumber ?? currentState.pageNumber),
    };
    commit(nextState);
  };

  const openGame: (gameSlug: string) => void = (gameSlug: string): void => {
    const normalizedSlug: string = gameSlug.trim();

    if (!GAME_SLUG_PATTERN.test(normalizedSlug)) {
      return;
    }

    const baseState: AppRouteState = withoutDialogs(currentState);
    const returnUrl: string = buildRouteUrl(baseState);
    const mode: 'push' | 'replace' = currentState.gameSlug === undefined ? 'push' : 'replace';
    const historyState: HistoryEntryState =
      mode === 'replace' ? getCurrentHistoryState() : { dialogEntry: true, returnUrl };
    commit(
      {
        ...baseState,
        gameSlug: normalizedSlug,
      },
      mode,
      historyState,
    );
  };

  const openAuth: (mode: AuthRouteMode) => void = (mode: AuthRouteMode): void => {
    const baseState: AppRouteState = withoutDialogs(currentState);
    const returnUrl: string = buildRouteUrl(baseState);
    const historyMode: 'push' | 'replace' =
      currentState.authMode === undefined ? 'push' : 'replace';
    const historyState: HistoryEntryState =
      historyMode === 'replace' ? getCurrentHistoryState() : { dialogEntry: true, returnUrl };
    commit(
      {
        ...baseState,
        authMode: mode,
      },
      historyMode,
      historyState,
    );
  };

  const closeDialog: () => void = (): void => {
    if (currentState.gameSlug === undefined && currentState.authMode === undefined) {
      return;
    }

    const entry: HistoryEntryState | undefined = isHistoryEntryState(history.state)
      ? history.state
      : undefined;

    if (entry?.dialogEntry === true && entry.returnUrl !== undefined) {
      history.back();
      return;
    }

    commit(withoutDialogs(currentState), 'replace');
  };

  const subscribe: (listener: RouteListener) => () => void = (
    listener: RouteListener,
  ): (() => void) => {
    listeners.add(listener);
    return (): void => {
      listeners.delete(listener);
    };
  };

  const start: () => void = (): void => {
    if (hasStarted) {
      return;
    }

    hasStarted = true;
    currentState = parseRoute();
    history.replaceState(history.state, '', location.href);
    addEventListener('popstate', (): void => {
      currentState = parseRoute();
      notify();
    });
    notify();
  };

  return {
    closeDialog,
    getState,
    navigate,
    openAuth,
    openGame,
    start,
    subscribe,
    updateLibrary,
  };
}

function isHistoryEntryState(value: unknown): value is HistoryEntryState {
  return typeof value === 'object' && value !== null;
}
