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
import type { AppSessionManager } from '../features/auth/app-session-manager';
import { createAppSessionManager } from '../features/auth/app-session-manager';
import { createLibraryPage } from '../pages/library/library-page';
import type {
  LibraryPageController,
  LibraryStateUpdate,
  LibraryViewState,
} from '../pages/library/library-types';
import { initializeFirebase } from '../services/firebase';
import '../shared/styles/globals.scss';
import type { AppSession } from '../state/app-session';
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
  initializeFirebase();

  const app: HTMLDivElement = document.createElement('div');

  app.id = 'app';

  const outlet: HTMLDivElement = document.createElement('div');

  outlet.id = 'page-content';

  const router: AppRouter = createRouter();
  const snackbar: Snackbar = createSnackbar();

  const checkSessionBeforeNavigation: () => void = (): void => {
    sessionManager.check();
  };

  const navigateToPage: (page: AppPage) => void = (page: AppPage): void => {
    checkSessionBeforeNavigation();
    router.navigate(page);
  };

  const openAuth: (mode: AuthMode) => void = (mode: AuthMode): void => {
    checkSessionBeforeNavigation();

    router.openAuth(toAuthRouteMode(mode));
  };

  const openGame: (gameSlug: string) => void = (gameSlug: string): void => {
    checkSessionBeforeNavigation();
    router.openGame(gameSlug);
  };

  const closeDialog: () => void = (): void => {
    checkSessionBeforeNavigation();
    router.closeDialog();
  };

  const headerOptions: HeaderOptions = {
    activePage: router.getState().page,
    onAuth: openAuth,
    onNavigate: navigateToPage,
  };

  let header: HTMLElement = createHeader(headerOptions);

  let renderedPage: AppPage | undefined;
  let libraryPage: LibraryPageController | undefined;

  let activeAuthMode: AuthRouteMode | undefined;

  let activeGameSlug: string | undefined;

  const applySessionToUi: (session: AppSession | undefined) => void = (
    session: AppSession | undefined,
  ): void => {
    app.classList.toggle('app--authenticated', session !== undefined);

    if (session === undefined) {
      delete app.dataset.userEmail;
      delete app.dataset.userName;
    } else {
      app.dataset.userEmail = session.email;
      app.dataset.userName = session.displayName;
    }

    const openMobileMenu: HTMLDialogElement | undefined =
      header.querySelector<HTMLDialogElement>('.mobile-menu[open]') ?? undefined;

    if (openMobileMenu !== undefined) {
      openMobileMenu.close();
      document.body.style.overflow = '';
    }

    const nextHeaderOptions: HeaderOptions = {
      ...headerOptions,
      activePage: router.getState().page,
      ...(session !== undefined && {
        session,
      }),
    };

    const nextHeader: HTMLElement = createHeader(nextHeaderOptions);

    header.replaceWith(nextHeader);
    header = nextHeader;

    const routeState: AppRouteState = router.getState();

    if (
      routeState.authMode === undefined &&
      routeState.gameSlug !== undefined &&
      activeGameSlug === routeState.gameSlug
    ) {
      gameDetailsDialog.open(routeState.gameSlug, session?.email);
    }
  };

  const sessionManager: AppSessionManager = createAppSessionManager({
    onSessionChange: applySessionToUi,

    onSessionExpired: (): void => {
      snackbar.show('Your session has expired. Please log in again.', 'error');
    },

    onSignOutFailure: (): void => {
      snackbar.show(
        'The local session was cleared, but Firebase sign-out could not be completed.',
        'error',
      );
    },
  });

  const authDialog: AuthDialog = createAuthDialog({
    onAuthenticated: (session: AppSession): void => {
      sessionManager.accept(session);
      router.closeDialog();
    },

    onModeChange: (mode: AuthMode): void => {
      checkSessionBeforeNavigation();

      const routeState: AppRouteState = router.getState();

      router.openAuth(toAuthRouteMode(mode), routeState.gameSlug !== undefined);
    },

    onNotify: snackbar.show,
    onRequestClose: closeDialog,
  });

  const canUseProtectedActions: () => boolean = (): boolean =>
    sessionManager.requireSession((): void => {
      router.openAuth('login', true);
    }) !== undefined;

  const gameDetailsDialog: GameDetailsDialog = createGameDetailsDialog({
    canUseProtectedActions,
    onNotify: snackbar.show,
    onRequestClose: closeDialog,
  });

  const updateLibraryRoute: (update: LibraryStateUpdate) => void = (
    update: LibraryStateUpdate,
  ): void => {
    checkSessionBeforeNavigation();

    const routeUpdate: LibraryRouteUpdate = {
      ...(update.category !== undefined && {
        category: update.category,
      }),
      ...(update.sort !== undefined && {
        sort: update.sort,
      }),
      ...(update.page !== undefined && {
        pageNumber: update.page,
      }),
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
        onGameDetails: openGame,
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
        onGameDetails: openGame,
        onNavigate: navigateToPage,
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
        gameDetailsDialog.open(state.gameSlug, sessionManager.getSession()?.email);

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
    sessionManager.check();
    renderPage(state);
    renderDialogs(state);
  });

  app.append(
    header,
    outlet,
    createFooter({
      onNavigate: navigateToPage,
    }),
    authDialog.element,
    gameDetailsDialog.element,
    snackbar.element,
  );

  document.body.append(app);

  sessionManager.start();
  router.start();
}

initializeApp();
