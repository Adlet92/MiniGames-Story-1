import type { AppSession } from '../../state/app-session';

const GENERIC_PROFILE_NAME: string = 'MiniGamer';
const GENERIC_AVATAR_INITIALS: string = 'MG';
const ALPHANUMERIC_CHARACTER: RegExp = /[\p{L}\p{N}]/u;

function getFirstAlphanumericCharacter(value: string): string {
  return value.match(ALPHANUMERIC_CHARACTER)?.at(0) ?? '';
}

export function getProfileName(session: AppSession): string {
  const displayName: string = session.displayName.trim();

  const emailName: string = session.email.split('@', 1)[0]?.trim() ?? '';

  return displayName || emailName || GENERIC_PROFILE_NAME;
}

export function getProfileInitials(profileName: string): string {
  const normalizedName: string = profileName.trim();

  const words: string[] = normalizedName.length === 0 ? [] : normalizedName.split(/\s+/u, 2);

  const initials: string = words
    .map((word: string): string => getFirstAlphanumericCharacter(word))
    .join('')
    .toUpperCase();

  return initials || GENERIC_AVATAR_INITIALS;
}
