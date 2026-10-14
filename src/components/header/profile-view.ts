import { getProfileInitials, getProfileName } from '../../features/auth/profile';
import type { AppSession } from '../../state/app-session';

export type ProfileViewVariant = 'header' | 'mobile-menu';

export function createProfileView(session: AppSession, variant: ProfileViewVariant): HTMLElement {
  const profileName: string = getProfileName(session);
  const initials: string = getProfileInitials(profileName);

  const profile: HTMLDivElement = document.createElement('div');

  profile.className = `${variant}__profile`;
  profile.setAttribute('aria-label', `Signed in as ${profileName}`);

  const avatar: HTMLSpanElement = document.createElement('span');

  avatar.className = `${variant}__avatar`;

  const initialsElement: HTMLSpanElement = document.createElement('span');

  initialsElement.className = `${variant}__avatar-initials`;
  initialsElement.textContent = initials;
  initialsElement.setAttribute('aria-hidden', 'true');

  avatar.append(initialsElement);

  const avatarUrl: string = session.avatarUrl?.trim() ?? '';

  if (avatarUrl.length > 0) {
    const image: HTMLImageElement = document.createElement('img');

    image.className = `${variant}__avatar-image`;
    image.alt = '';
    image.decoding = 'async';

    image.addEventListener(
      'error',
      (): void => {
        image.remove();
      },
      { once: true },
    );

    image.src = avatarUrl;
    avatar.append(image);
  }

  const name: HTMLSpanElement = document.createElement('span');

  name.className = `${variant}__profile-name`;
  name.textContent = profileName;
  name.title = profileName;

  profile.append(avatar, name);

  return profile;
}
