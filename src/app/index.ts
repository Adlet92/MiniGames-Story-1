import type { AuthDialog } from '../components/dialogs/auth-dialog';
import { createAuthDialog } from '../components/dialogs/auth-dialog';
import type { GameDetailsDialog } from '../components/dialogs/game-details-dialog';
import { createGameDetailsDialog } from '../components/dialogs/game-details-dialog';
import { createFooter } from '../components/footer/footer';
import type { HeaderOptions } from '../components/header/header';
import { createHeader, setHeaderActivePage } from '../components/header/header';
import { createHomePage } from '../components/home/home-page';
import type { Snackbar } from '../components/ui/snackbar/snackbar';
import { createSnackbar } from '../components/ui/snackbar/snackbar';
import { createLibraryPage } from '../pages/library/library-page';
import '../shared/styles/globals.scss';
import type { AppPage, AppRouter } from './router';
import { createRouter } from './router';

const authDialog: AuthDialog = createAuthDialog();
const snackbar: Snackbar = createSnackbar();
const gameDetailsDialog: GameDetailsDialog = createGameDetailsDialog({ onNotify: snackbar.show });
const app: HTMLDivElement = document.createElement('div');
app.id = 'app';
const outlet: HTMLDivElement = document.createElement('div');
outlet.id = 'page-content';

const router: AppRouter = createRouter(outlet, {
  home: {
    createPage: (): HTMLElement =>
      createHomePage({
        onGameDetails: gameDetailsDialog.open,
        onNotify: snackbar.show,
      }),
    title: 'MiniGames | Home',
  },
  library: {
    createPage: (): HTMLElement =>
      createLibraryPage({
        onGameDetails: gameDetailsDialog.open,
        onNotify: snackbar.show,
      }),
    title: 'MiniGames | Library',
  },
});
const options: HeaderOptions = {
  activePage: router.getCurrentPage(),
  onAuth: authDialog.open,
  onNavigate: router.navigate,
};
const header: HTMLElement = createHeader(options);
router.subscribe((page: AppPage): void => setHeaderActivePage(header, page));

app.append(
  header,
  outlet,
  createFooter({ onNavigate: router.navigate }),
  authDialog.element,
  gameDetailsDialog.element,
  snackbar.element,
);
document.body.append(app);
router.navigate('home');
