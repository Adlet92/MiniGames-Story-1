export type AppPage = 'home' | 'library';

export interface AppRoute {
  createPage: () => HTMLElement;
  title: string;
}

export interface AppRouter {
  getCurrentPage: () => AppPage;
  navigate: (page: AppPage) => void;
  subscribe: (listener: RouteListener) => () => void;
}

type RouteListener = (page: AppPage) => void;

export function createRouter(outlet: HTMLElement, routes: Record<AppPage, AppRoute>): AppRouter {
  const listeners: Set<RouteListener> = new Set<RouteListener>();
  let currentPage: AppPage = 'home';
  let hasRenderedPage: boolean = false;

  function getCurrentPage(): AppPage {
    return currentPage;
  }

  function navigate(page: AppPage): void {
    if (hasRenderedPage && page === currentPage) {
      return;
    }

    const route: AppRoute = routes[page];
    currentPage = page;
    hasRenderedPage = true;
    outlet.replaceChildren(route.createPage());
    document.title = route.title;

    for (const listener of listeners) {
      listener(page);
    }
  }

  function subscribe(listener: RouteListener): () => void {
    listeners.add(listener);
    return (): void => {
      listeners.delete(listener);
    };
  }

  return { getCurrentPage, navigate, subscribe };
}
