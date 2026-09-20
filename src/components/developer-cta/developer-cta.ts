import './developer-cta.scss';

export interface DeveloperCtaAssets {
  illustrationUrl: string;
  uploadIconUrl: string;
}

export function createDeveloperCtaSection(assets: DeveloperCtaAssets): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'developer-cta';
  section.setAttribute('aria-labelledby', 'developer-cta-title');

  const illustration: HTMLImageElement = document.createElement('img');
  illustration.className = 'developer-cta__illustration';
  illustration.src = assets.illustrationUrl;
  illustration.alt = 'Illustration of a game developer at a desk';
  illustration.loading = 'lazy';

  const card: HTMLDivElement = document.createElement('div');
  card.className = 'developer-cta__card';

  const heading: HTMLHeadingElement = document.createElement('h2');
  heading.id = 'developer-cta-title';
  heading.className = 'developer-cta__heading';
  heading.textContent = 'Are You a Game Developer?';

  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'developer-cta__description';
  description.textContent =
    "Want to see your game on MiniGames? We're always looking for fun, engaging mini games to add to our platform. Submit your game and reach thousands of players!";

  // The layout task requires a visible button; form submission belongs to a later task.
  const button: HTMLButtonElement = document.createElement('button');
  button.className = 'developer-cta__button';
  button.type = 'button';
  const uploadIcon: HTMLImageElement = document.createElement('img');
  uploadIcon.className = 'developer-cta__upload-icon';
  uploadIcon.src = assets.uploadIconUrl;
  uploadIcon.alt = '';
  uploadIcon.setAttribute('aria-hidden', 'true');
  const buttonText: HTMLSpanElement = document.createElement('span');
  buttonText.textContent = 'Submit Form';
  button.append(uploadIcon, buttonText);

  const contact: HTMLParagraphElement = document.createElement('p');
  contact.className = 'developer-cta__contact';
  contact.textContent = 'or contact us at developers@minigames.com';

  card.append(heading, description, button, contact);
  section.append(illustration, card);
  return section;
}
