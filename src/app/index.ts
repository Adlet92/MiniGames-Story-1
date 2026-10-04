import type { AuthDialog } from '../components/dialogs/auth-dialog';
import { createAuthDialog } from '../components/dialogs/auth-dialog';
import type { GameDetailsDialog } from '../components/dialogs/game-details-dialog';
import { createGameDetailsDialog } from '../components/dialogs/game-details-dialog';
import { createFooter } from '../components/footer/footer';
import type { AuthMode, HeaderOptions } from '../components/header/header';
import { createHeader, setHeaderActivePage } from '../components/header/header';
import { createHomePage } from '../components/home/home-page';
import type { Snackbar } from '../components/ui/snackbar/snackbar';
import { createSnackbar } from '../components/ui/snackbar/snackbar';
import { createLibraryPage } from '../pages/library/library-page';
import type {
  LibraryPageController,
  LibraryStateUpdate,
  LibraryViewState,
} from '../pages/library/library-types';
import '../shared/styles/globals.scss';
import type {
  AppPage,
  AppRouteState,
  AppRouter,
  AuthRouteMode,
  LibraryRouteUpdate,
} from './router';
import { createRouter } from './router';

function toLibraryState(state: AppRouteState): LibraryViewState {
  return {
    category: state.category,
    sort: state.sort,
    page: state.pageNumber,
  };
}

function toAuthRouteMode(mode: AuthMode): AuthRouteMode {
  return mode === 'signup' ? 'register' : 'login';
}

function toAuthMode(mode: AuthRouteMode): AuthMode {
  return mode === 'register' ? 'signup' : 'login';
}

function initializeApp(): void {
  const app: HTMLDivElement = document.createElement('div');
  app.id = 'app';
  const outlet: HTMLDivElement = document.createElement('div');
  outlet.id = 'page-content';
  const router: AppRouter = createRouter();
  const snackbar: Snackbar = createSnackbar();
  const authDialog: AuthDialog = createAuthDialog({
    onModeChange: (mode: AuthMode): void => router.openAuth(toAuthRouteMode(mode)),
    onRequestClose: router.closeDialog,
  });
  const gameDetailsDialog: GameDetailsDialog = createGameDetailsDialog({
    onNotify: snackbar.show,
    onRequestClose: router.closeDialog,
  });
  const headerOptions: HeaderOptions = {
    activePage: router.getState().page,
    onAuth: (mode: AuthMode): void => router.openAuth(toAuthRouteMode(mode)),
    onNavigate: router.navigate,
  };
  const header: HTMLElement = createHeader(headerOptions);

  let renderedPage: AppPage | undefined;
  let libraryPage: LibraryPageController | undefined;
  let activeAuthMode: AuthRouteMode | undefined;
  let activeGameSlug: string | undefined;

  const updateLibraryRoute: (update: LibraryStateUpdate) => void = (
    update: LibraryStateUpdate,
  ): void => {
    const routeUpdate: LibraryRouteUpdate = {
      ...(update.category !== undefined && { category: update.category }),
      ...(update.sort !== undefined && { sort: update.sort }),
      ...(update.page !== undefined && { pageNumber: update.page }),
    };
    router.updateLibrary(routeUpdate);
  };

  const renderPage: (state: AppRouteState) => void = (state: AppRouteState): void => {
    if (renderedPage === state.page) {
      if (state.page === 'library') {
        libraryPage?.updateState(toLibraryState(state));
      }
      return;
    }

    renderedPage = state.page;
    setHeaderActivePage(header, state.page);

    if (state.page === 'library') {
      libraryPage = createLibraryPage({
        initialState: toLibraryState(state),
        onGameDetails: router.openGame,
        onNotify: snackbar.show,
        onStateChange: updateLibraryRoute,
      });
      outlet.replaceChildren(libraryPage.element);
      document.title = 'MiniGames | Library';
      return;
    }

    libraryPage = undefined;
    outlet.replaceChildren(
      createHomePage({
        onGameDetails: router.openGame,
        onNavigate: router.navigate,
        onNotify: snackbar.show,
      }),
    );
    document.title = 'MiniGames | Home';
  };

  const renderDialogs: (state: AppRouteState) => void = (state: AppRouteState): void => {
    if (state.authMode !== undefined) {
      if (activeGameSlug !== undefined) {
        gameDetailsDialog.close();
        activeGameSlug = undefined;
      }

      if (activeAuthMode !== state.authMode) {
        authDialog.open(toAuthMode(state.authMode));
        activeAuthMode = state.authMode;
      }
      return;
    }

    if (activeAuthMode !== undefined) {
      authDialog.close();
      activeAuthMode = undefined;
    }

    if (state.gameSlug !== undefined) {
      if (activeGameSlug !== state.gameSlug) {
        gameDetailsDialog.open(state.gameSlug);
        activeGameSlug = state.gameSlug;
      }
      return;
    }

    if (activeGameSlug === undefined) {
      return;
    }

    gameDetailsDialog.close();
    activeGameSlug = undefined;
  };

  router.subscribe((state: AppRouteState): void => {
    renderPage(state);
    renderDialogs(state);
  });

  app.append(
    header,
    outlet,
    createFooter({ onNavigate: router.navigate }),
    authDialog.element,
    gameDetailsDialog.element,
    snackbar.element,
  );
  document.body.append(app);
  router.start();
}

initializeApp();
