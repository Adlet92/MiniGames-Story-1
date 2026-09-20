import './slider.scss';

export interface SliderAssets {
  candyImage: string;
  islandersImage: string;
  cafeImage: string;
  winterImage: string;
  bubbleImage: string;
  previousIcon: string;
  nextIcon: string;
  starIcon: string;
  heartIcon: string;
}

interface GameCardData {
  title: string;
  imageUrl: string;
  rating: string;
  likes: string;
}

function createIcon(url: string, className: string): HTMLImageElement {
  const icon: HTMLImageElement = document.createElement('img');
  icon.src = url;
  icon.alt = '';
  icon.className = className;
  icon.width = 24;
  icon.height = 24;
  return icon;
}

function createMetric(iconUrl: string, value: string, label: string): HTMLSpanElement {
  const metric: HTMLSpanElement = document.createElement('span');
  metric.className = 'slider__metric';
  metric.setAttribute('aria-label', `${label}: ${value}`);

  const icon: HTMLImageElement = createIcon(iconUrl, 'slider__metric-icon');
  icon.setAttribute('aria-hidden', 'true');
  const text: HTMLSpanElement = document.createElement('span');
  text.textContent = value;
  metric.append(icon, text);
  return metric;
}

function createCard(game: GameCardData, assets: SliderAssets): HTMLElement {
  const card: HTMLElement = document.createElement('article');
  card.className = 'slider__card';
  card.setAttribute('aria-label', game.title);

  const image: HTMLImageElement = document.createElement('img');
  image.className = 'slider__image';
  image.src = game.imageUrl;
  image.alt = game.title;
  image.loading = 'lazy';

  const info: HTMLDivElement = document.createElement('div');
  info.className = 'slider__info';

  const title: HTMLHeadingElement = document.createElement('h3');
  title.className = 'slider__game-title';
  title.textContent = game.title;
  title.title = game.title;

  const stats: HTMLDivElement = document.createElement('div');
  stats.className = 'slider__stats';
  stats.append(
    createMetric(assets.starIcon, game.rating, 'Rating'),
    createMetric(assets.heartIcon, game.likes, 'Likes'),
  );

  info.append(title, stats);
  card.append(image, info);
  return card;
}

function createEdgeCard(imageUrl: string, title: string, position: string): HTMLElement {
  const card: HTMLElement = document.createElement('article');
  card.className = `slider__card slider__card--${position}`;
  card.setAttribute('aria-label', title);

  const image: HTMLImageElement = document.createElement('img');
  image.className = 'slider__image';
  image.src = imageUrl;
  image.alt = title;
  image.loading = 'lazy';
  card.append(image);
  return card;
}

function createArrow(iconUrl: string, direction: string): HTMLSpanElement {
  // Static visual only. Interactive arrow buttons belong to the later slider task.
  const arrow: HTMLSpanElement = document.createElement('span');
  arrow.className = `slider__arrow slider__arrow--${direction}`;
  arrow.setAttribute('aria-hidden', 'true');
  arrow.append(createIcon(iconUrl, 'slider__arrow-icon'));
  return arrow;
}
export function createSliderSection(assets: SliderAssets): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'slider';
  section.setAttribute('aria-labelledby', 'new-games-title');

  const header: HTMLDivElement = document.createElement('div');
  header.className = 'slider__header';
  const headingGroup: HTMLDivElement = document.createElement('div');
  headingGroup.className = 'slider__heading-group';
  const accent: HTMLSpanElement = document.createElement('span');
  accent.className = 'slider__accent';
  accent.setAttribute('aria-hidden', 'true');
  const heading: HTMLHeadingElement = document.createElement('h2');
  heading.id = 'new-games-title';
  heading.className = 'slider__heading';
  heading.textContent = 'New Games';
  headingGroup.append(accent, heading);

  const arrows: HTMLDivElement = document.createElement('div');
  arrows.className = 'slider__arrows';
  arrows.setAttribute('aria-hidden', 'true');
  arrows.append(createArrow(assets.previousIcon, 'previous'), createArrow(assets.nextIcon, 'next'));
  header.append(headingGroup, arrows);

  const track: HTMLDivElement = document.createElement('div');
  track.className = 'slider__track';
  track.append(
    createEdgeCard(assets.candyImage, 'Candy Crush', 'first'),
    createCard(
      {
        title: 'ISLANDERS: New Shores',
        imageUrl: assets.islandersImage,
        rating: '4.9',
        likes: '54.2K',
      },
      assets,
    ),
    createCard(
      {
        title: 'Vacation Cafe Simulator',
        imageUrl: assets.cafeImage,
        rating: '4.8',
        likes: '28.7K',
      },
      assets,
    ),
    createCard(
      {
        title: 'Winter Burrow',
        imageUrl: assets.winterImage,
        rating: '4.9',
        likes: '32.4K',
      },
      assets,
    ),
    createEdgeCard(assets.bubbleImage, 'Bubble Shooter', 'last'),
  );

  section.append(header, track);
  return section;
}
