import type { AuthDialog } from '../components/dialogs/auth-dialog';
import { createAuthDialog } from '../components/dialogs/auth-dialog';
import { createFooter } from '../components/footer/footer';
import type { HeaderOptions } from '../components/header/header';
import { createHeader } from '../components/header/header';
import { createHomePage } from '../components/home/home-page';
import '../shared/styles/globals.scss';

const authDialog: AuthDialog = createAuthDialog();
const options: HeaderOptions = { onAuth: authDialog.open };
const app: HTMLDivElement = document.createElement('div');
app.id = 'app';
app.append(createHeader(options), createHomePage(), createFooter(), authDialog.element);
document.body.append(app);
