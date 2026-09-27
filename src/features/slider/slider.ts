import './slider.scss';

export interface SliderAssets {
  vacationCafeImage: string;
  winterBurrowImage: string;
  shelvePotionsImage: string;
  heartopiaImage: string;
  paliaImage: string;
  catMailImage: string;
  tinyGladeImage: string;
  tailsideImage: string;
  islandersImage: string;
  previousIcon: string;
  nextIcon: string;
  starIcon: string;
  heartIcon: string;
}

export interface SliderOptions {
  onGameDetails: () => void;
}

interface GameCardData {
  title: string;
  imageUrl: string;
  rating: string;
  likes: string;
}

interface CardGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  layer: number;
}

const AUTOPLAY_DURATION: number = 4000;
const WIDE_LAYOUT_BREAKPOINT: number = 1280;
const MOBILE_BREAKPOINT: number = 375;
const TABLET_BREAKPOINT: number = 768;
const CARD_GAP: number = 8;
const MINIMUM_SWIPE: number = 40;

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

  const iconFrame: HTMLSpanElement = document.createElement('span');
  iconFrame.className = 'slider__metric-icon';
  iconFrame.setAttribute('aria-hidden', 'true');
  const icon: HTMLImageElement = createIcon(iconUrl, 'slider__metric-art');
  const text: HTMLSpanElement = document.createElement('span');
  text.textContent = value;
  iconFrame.append(icon);
  metric.append(iconFrame, text);
  return metric;
}

function createCard(
  game: GameCardData,
  assets: SliderAssets,
  onGameDetails: () => void,
): HTMLButtonElement {
  const card: HTMLButtonElement = document.createElement('button');
  card.type = 'button';
  card.className = 'slider__card';
  card.setAttribute('aria-label', `View details for ${game.title}`);

  const image: HTMLImageElement = document.createElement('img');
  image.className = 'slider__image';
  image.src = game.imageUrl;
  image.alt = game.title;
  image.loading = 'lazy';
  image.draggable = false;

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
  card.addEventListener('click', onGameDetails);
  return card;
}

function createArrow(iconUrl: string, direction: 'previous' | 'next'): HTMLButtonElement {
  const arrow: HTMLButtonElement = document.createElement('button');
  arrow.type = 'button';
  arrow.className = `slider__arrow slider__arrow--${direction}`;
  arrow.setAttribute('aria-label', `Show ${direction} game`);
  arrow.append(createIcon(iconUrl, 'slider__arrow-icon'));
  return arrow;
}

function getCircularDistance(index: number, activeIndex: number, total: number): number {
  let distance: number = index - activeIndex;
  const halfway: number = Math.floor(total / 2);

  if (distance > halfway) {
    distance -= total;
  }

  if (distance < -halfway) {
    distance += total;
  }

  return distance;
}

function getCompactGeometry(distance: number, trackWidth: number): CardGeometry {
  const range: number = TABLET_BREAKPOINT - MOBILE_BREAKPOINT;
  const progress: number = Math.min(
    1,
    Math.max(0, (window.innerWidth - MOBILE_BREAKPOINT) / range),
  );
  const peekWidth: number = 56 + (104 - 56) * progress;
  const centerWidth: number = trackWidth - peekWidth * 2 - CARD_GAP * 2;
  const centerHeight: number = window.innerWidth <= MOBILE_BREAKPOINT ? 200 : 280;
  const edgeHeight: number = centerHeight * 0.86;
  const edgeY: number = (centerHeight - edgeHeight) / 2;

  if (distance === -1) {
    return { x: 0, y: edgeY, width: peekWidth, height: edgeHeight, opacity: 1, layer: 1 };
  }

  if (distance === 0) {
    return {
      x: peekWidth + CARD_GAP,
      y: 0,
      width: centerWidth,
      height: centerHeight,
      opacity: 1,
      layer: 3,
    };
  }

  return distance === 1
    ? {
        x: peekWidth + CARD_GAP + centerWidth + CARD_GAP,
        y: edgeY,
        width: peekWidth,
        height: edgeHeight,
        opacity: 1,
        layer: 1,
      }
    : {
        x: distance < 0 ? -peekWidth - CARD_GAP : trackWidth + CARD_GAP,
        y: edgeY,
        width: peekWidth,
        height: edgeHeight,
        opacity: 0,
        layer: 0,
      };
}

function getWideGeometry(distance: number, trackWidth: number): CardGeometry {
  const edgeWidth: number = Math.min(120, Math.max(72, trackWidth * 0.075));
  const sideWidth: number = 288;
  const centerWidth: number = Math.max(
    sideWidth,
    trackWidth - edgeWidth * 2 - sideWidth * 2 - CARD_GAP * 4,
  );
  const edgeHeight: number = 328;

  if (distance === -2) {
    return { x: 0, y: 28, width: edgeWidth, height: edgeHeight, opacity: 1, layer: 1 };
  }

  const sideHeight: number = 360;

  if (distance === -1) {
    return {
      x: edgeWidth + CARD_GAP,
      y: 12,
      width: sideWidth,
      height: sideHeight,
      opacity: 1,
      layer: 2,
    };
  }

  if (distance === 0) {
    const centerHeight: number = 384;
    return {
      x: edgeWidth + sideWidth + CARD_GAP * 2,
      y: 0,
      width: centerWidth,
      height: centerHeight,
      opacity: 1,
      layer: 3,
    };
  }

  if (distance === 1) {
    return {
      x: edgeWidth + sideWidth + centerWidth + CARD_GAP * 3,
      y: 12,
      width: sideWidth,
      height: sideHeight,
      opacity: 1,
      layer: 2,
    };
  }

  return distance === 2
    ? {
        x: edgeWidth + sideWidth * 2 + centerWidth + CARD_GAP * 4,
        y: 28,
        width: edgeWidth,
        height: edgeHeight,
        opacity: 1,
        layer: 1,
      }
    : {
        x: distance < 0 ? -edgeWidth - CARD_GAP : trackWidth + CARD_GAP,
        y: 28,
        width: edgeWidth,
        height: edgeHeight,
        opacity: 0,
        layer: 0,
      };
}

function applyGeometry(card: HTMLButtonElement, geometry: CardGeometry): void {
  card.style.setProperty('--card-x', `${geometry.x}px`);
  card.style.setProperty('--card-y', `${geometry.y}px`);
  card.style.setProperty('--card-width', `${geometry.width}px`);
  card.style.setProperty('--card-height', `${geometry.height}px`);
  card.style.setProperty('--card-opacity', String(geometry.opacity));
  card.style.setProperty('--card-layer', String(geometry.layer));
  card.tabIndex = geometry.opacity === 1 ? 0 : -1;
  card.setAttribute('aria-hidden', String(geometry.opacity === 0));
}

function getFeaturedGames(assets: SliderAssets): GameCardData[] {
  return [
    {
      title: 'Vacation Cafe Simulator',
      imageUrl: assets.vacationCafeImage,
      rating: '4.8',
      likes: '28.8K',
    },
    { title: 'Winter Burrow', imageUrl: assets.winterBurrowImage, rating: '4.9', likes: '32.4K' },
    {
      title: 'Shelve the Potions!',
      imageUrl: assets.shelvePotionsImage,
      rating: '4.7',
      likes: '21.3K',
    },
    { title: 'Heartopia', imageUrl: assets.heartopiaImage, rating: '4.6', likes: '46.8K' },
    { title: 'Palia', imageUrl: assets.paliaImage, rating: '4.8', likes: '89.5K' },
    { title: 'Cat Mail Co.', imageUrl: assets.catMailImage, rating: '4.9', likes: '38.2K' },
    { title: 'Tiny Glade', imageUrl: assets.tinyGladeImage, rating: '4.9', likes: '67.3K' },
    {
      title: 'Tailside: Cozy Cafe Sim',
      imageUrl: assets.tailsideImage,
      rating: '4.8',
      likes: '35.6K',
    },
    {
      title: 'ISLANDERS: New Shores',
      imageUrl: assets.islandersImage,
      rating: '4.9',
      likes: '54.2K',
    },
  ];
}

export function createSliderSection(assets: SliderAssets, options: SliderOptions): HTMLElement {
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

  const previousButton: HTMLButtonElement = createArrow(assets.previousIcon, 'previous');
  const nextButton: HTMLButtonElement = createArrow(assets.nextIcon, 'next');
  const arrows: HTMLDivElement = document.createElement('div');
  arrows.className = 'slider__arrows';
  arrows.append(previousButton, nextButton);
  header.append(headingGroup, arrows);

  const track: HTMLDivElement = document.createElement('div');
  track.className = 'slider__track';
  track.setAttribute('aria-roledescription', 'carousel');
  track.setAttribute('aria-label', 'Featured games');

  let isClickSuppressed: boolean = false;
  const cards: HTMLButtonElement[] = getFeaturedGames(assets).map(
    (game: GameCardData): HTMLButtonElement =>
      createCard(game, assets, (): void => {
        if (!isClickSuppressed) {
          options.onGameDetails();
        }
      }),
  );
  track.append(...cards);

  const status: HTMLParagraphElement = document.createElement('p');
  status.className = 'slider__status';
  status.setAttribute('aria-live', 'polite');

  let activeIndex: number = 0;
  let autoplayTimer: number | undefined;
  let autoplayDeadline: number = 0;
  let remainingAutoplay: number = AUTOPLAY_DURATION;
  let pointerStartX: number = 0;
  let pointerDeltaX: number = 0;
  let activePointerId: number | undefined;

  const render: () => void = (): void => {
    const trackWidth: number = track.clientWidth;
    const isWideLayout: boolean = window.innerWidth >= WIDE_LAYOUT_BREAKPOINT;

    for (const [index, card] of cards.entries()) {
      const distance: number = getCircularDistance(index, activeIndex, cards.length);
      const geometry: CardGeometry = isWideLayout
        ? getWideGeometry(distance, trackWidth)
        : getCompactGeometry(distance, trackWidth);
      applyGeometry(card, geometry);
      card.dataset.active = String(distance === 0);
    }

    const activeCard: HTMLButtonElement | undefined = cards[activeIndex];
    status.textContent = activeCard?.getAttribute('aria-label') ?? '';
  };

  const clearAutoplay: () => void = (): void => {
    if (autoplayTimer === undefined) {
      return;
    }

    clearTimeout(autoplayTimer);
    autoplayTimer = undefined;
  };

  const move: (step: number) => void = (step: number): void => {
    activeIndex = (activeIndex + step + cards.length) % cards.length;
    render();
  };

  const scheduleAutoplay: (delay?: number) => void = (delay: number = AUTOPLAY_DURATION): void => {
    clearAutoplay();
    remainingAutoplay = delay;
    autoplayDeadline = performance.now() + delay;
    autoplayTimer = setTimeout((): void => {
      autoplayTimer = undefined;
      if (!section.isConnected) {
        return;
      }

      move(1);
      scheduleAutoplay();
    }, delay);
  };

  const pauseAutoplay: () => void = (): void => {
    if (autoplayTimer === undefined) {
      return;
    }

    remainingAutoplay = Math.max(0, autoplayDeadline - performance.now());
    clearAutoplay();
  };

  const moveManually: (step: number) => void = (step: number): void => {
    move(step);
    scheduleAutoplay();
  };

  previousButton.addEventListener('click', (): void => moveManually(-1));
  nextButton.addEventListener('click', (): void => moveManually(1));

  track.addEventListener('pointerdown', (event: PointerEvent): void => {
    if (event.button !== 0) {
      return;
    }

    activePointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerDeltaX = 0;
    track.classList.add('slider__track--dragging');
    track.setPointerCapture(event.pointerId);
    pauseAutoplay();
  });

  track.addEventListener('pointermove', (event: PointerEvent): void => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    pointerDeltaX = event.clientX - pointerStartX;
    track.style.setProperty('--drag-offset', `${pointerDeltaX}px`);
  });

  const finishPointerInteraction: (event: PointerEvent, isCancelled: boolean) => void = (
    event: PointerEvent,
    isCancelled: boolean,
  ): void => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    const swipeThreshold: number = Math.max(MINIMUM_SWIPE, track.clientWidth * 0.08);
    const isSwipe: boolean = !isCancelled && Math.abs(pointerDeltaX) >= swipeThreshold;
    activePointerId = undefined;
    track.classList.remove('slider__track--dragging');
    track.style.removeProperty('--drag-offset');

    if (isSwipe) {
      isClickSuppressed = true;
      moveManually(pointerDeltaX < 0 ? 1 : -1);
      setTimeout((): void => {
        isClickSuppressed = false;
      }, 0);
      return;
    }

    scheduleAutoplay(remainingAutoplay);
  };

  track.addEventListener('pointerup', (event: PointerEvent): void =>
    finishPointerInteraction(event, false),
  );
  track.addEventListener('pointercancel', (event: PointerEvent): void =>
    finishPointerInteraction(event, true),
  );

  const resizeObserver: ResizeObserver = new ResizeObserver(render);
  resizeObserver.observe(track);
  section.addEventListener('keydown', (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft': {
        event.preventDefault();
        moveManually(-1);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        moveManually(1);
        break;
      }
    }
  });

  section.append(header, track, status);
  requestAnimationFrame((): void => {
    render();
    scheduleAutoplay();
  });
  return section;
}
