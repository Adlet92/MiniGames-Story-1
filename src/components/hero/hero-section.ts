import './hero-section.scss';

export function createHeroSection(backgroundImageUrl: string): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'hero';
  section.setAttribute('aria-labelledby', 'hero-title');

  const background: HTMLImageElement = document.createElement('img');
  background.className = 'hero__background';
  background.src = backgroundImageUrl;
  background.alt = '';
  background.setAttribute('aria-hidden', 'true');

  const card: HTMLDivElement = document.createElement('div');
  card.className = 'hero__card';

  const title: HTMLHeadingElement = document.createElement('h1');
  title.className = 'hero__title';
  title.id = 'hero-title';
  title.textContent = 'Take a Short Break & Have Fun';

  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'hero__description hero__description--large';
  description.textContent =
    'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.';

  const mobileDescription: HTMLParagraphElement = document.createElement('p');
  mobileDescription.className = 'hero__description hero__description--mobile';
  mobileDescription.textContent =
    'Discover hundreds of curated casual mini-games right in your browser.';

  const browseLink: HTMLAnchorElement = document.createElement('a');
  browseLink.className = 'hero__button';
  browseLink.href = '#/library';
  browseLink.textContent = 'Browse Library';

  card.append(title, description, mobileDescription, browseLink);
  section.append(background, card);
  return section;
}
