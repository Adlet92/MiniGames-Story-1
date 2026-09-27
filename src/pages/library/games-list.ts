import heartIconUrl from '../../assets/icons/heart_icon.svg';
import starIconUrl from '../../assets/icons/star_icon.svg';
import gamesJson from '../../data/games.json';
import { getGameImage } from './game-images';
import type { GameData, GamesResponse } from './library-types';
import './games-list.scss';

const GAMES: GamesResponse = gamesJson;
const VISIBLE_CARD_COUNT: number = 12;
const likesFormatter: Intl.NumberFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function createMetric(iconUrl: string, value: string, label: string): HTMLSpanElement {
  const metric: HTMLSpanElement = document.createElement('span');
  metric.className = 'game-card__metric';
  metric.setAttribute('aria-label', label);
  const icon: HTMLImageElement = document.createElement('img');
  icon.src = iconUrl;
  icon.alt = '';
  icon.width = 18;
  icon.height = 18;
  const text: HTMLSpanElement = document.createElement('span');
  text.textContent = value;
  metric.append(icon, text);
  return metric;
}

function createGameCard(game: GameData, onDetails: () => void): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = 'games-list__item';
  const card: HTMLElement = document.createElement('article');
  card.className = 'game-card';

  const image: HTMLImageElement = document.createElement('img');
  image.className = 'game-card__image';
  image.src = getGameImage(game.slug, game.cardImage);
  image.alt = `${game.name} game artwork`;
  image.loading = 'lazy';

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-card__content';
  const heading: HTMLHeadingElement = document.createElement('h2');
  heading.className = 'game-card__title';
  heading.textContent = game.name;

  const badges: HTMLDivElement = document.createElement('div');
  badges.className = 'game-card__badges';
  const category: HTMLSpanElement = document.createElement('span');
  category.className = 'game-card__badge';
  category.textContent = game.category;
  const price: HTMLSpanElement = document.createElement('span');
  price.className = 'game-card__price';
  price.textContent = game.price;
  badges.append(category, price);

  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'game-card__description';
  description.textContent = game.shortDescription;

  const footer: HTMLDivElement = document.createElement('div');
  footer.className = 'game-card__footer';
  const metrics: HTMLDivElement = document.createElement('div');
  metrics.className = 'game-card__metrics';
  metrics.append(
    createMetric(starIconUrl, game.rating.toFixed(1), `${game.rating.toFixed(1)} rating`),
    createMetric(
      heartIconUrl,
      likesFormatter.format(game.likesCount),
      `${game.likesCount.toLocaleString('en')} likes`,
    ),
  );
  const details: HTMLButtonElement = document.createElement('button');
  details.type = 'button';
  details.className = 'game-card__details';
  details.textContent = 'Details';
  details.setAttribute('aria-label', `View details for ${game.name}`);
  details.addEventListener('click', onDetails);
  footer.append(metrics, details);

  content.append(heading, badges, description, footer);
  card.append(image, content);
  item.append(card);
  return item;
}

export function createGamesList(onDetails: () => void): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'games-list';
  section.setAttribute('aria-label', 'Available games');
  const list: HTMLUListElement = document.createElement('ul');
  list.className = 'games-list__grid';
  const visibleGames: GameData[] = GAMES.data.slice(0, VISIBLE_CARD_COUNT);
  list.append(
    ...visibleGames.map((game: GameData): HTMLLIElement => createGameCard(game, onDetails)),
  );
  section.append(list);
  return section;
}
