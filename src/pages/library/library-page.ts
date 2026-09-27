import './library-page.scss';

export function createLibraryPage(): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'library-page';
  page.setAttribute('aria-labelledby', 'library-page-title');

  const heading: HTMLHeadingElement = document.createElement('h1');
  heading.id = 'library-page-title';
  heading.textContent = 'Game Library';

  const description: HTMLParagraphElement = document.createElement('p');
  description.textContent = 'Browse all MiniGames.';

  page.append(heading, description);
  return page;
}
