import type {
  GameComment,
  GameCommentsResponse,
  GameDetails,
  GameRecord,
} from '../../services/game-details-api';
import { fetchGameComments, fetchGameDetails } from '../../services/game-details-api';
import { formatRelativeTime } from '../../utils/relative-time';
import {
  createCardSkeleton,
  createEmptyState,
  createErrorBanner,
} from '../ui/data-state/data-state';
import type { Snackbar } from '../ui/snackbar/snackbar';
import './game-details-dialog.scss';
import { getGameHeroImage } from './game-details-images';

export interface GameDetailsDialogOptions {
  onNotify: Snackbar['show'];
}

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: (gameSlug: string, userEmail?: string) => void;
}

interface CommentFormElements {
  element: HTMLFormElement;
  textarea: HTMLTextAreaElement;
}

const TEXTAREA_MAX_HEIGHT: number = 88;
const CLOSE_ANIMATION_DURATION: number = 220;
const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('en-US');
const compactNumberFormatter: Intl.NumberFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function createBadge(label: string): HTMLSpanElement {
  const badge: HTMLSpanElement = document.createElement('span');
  badge.className = 'game-details-dialog__badge';
  badge.textContent = label;
  return badge;
}

function createSectionHeading(id: string, label: string): HTMLHeadingElement {
  const heading: HTMLHeadingElement = document.createElement('h3');
  heading.id = id;
  heading.className = 'game-details-dialog__section-title';
  heading.textContent = label;
  return heading;
}

function createLoadingState(label: string): HTMLElement {
  const state: HTMLElement = createCardSkeleton(2, label);
  state.classList.add('data-state--game-dialog-skeleton');
  return state;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function createInformationSection(game: GameDetails): HTMLElement {
  const information: HTMLElement = document.createElement('section');
  information.className = 'game-details-dialog__information';
  information.setAttribute('aria-labelledby', 'game-details-title');

  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'game-details-title';
  title.textContent = game.name;

  const badges: HTMLDivElement = document.createElement('div');
  badges.className = 'game-details-dialog__badges';
  badges.append(
    createBadge(game.specs.genre),
    createBadge(game.specs.players),
    createBadge(game.specs.duration),
    createBadge(game.specs.price),
    createBadge(`★ ${game.rating.toFixed(1)}`),
    createBadge(`♥ ${compactNumberFormatter.format(game.likesCount)}`),
  );

  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'game-details-dialog__description';
  description.textContent = game.fullDescription;

  const actions: HTMLDivElement = document.createElement('div');
  actions.className = 'game-details-dialog__actions';
  const play: HTMLButtonElement = document.createElement('button');
  play.type = 'button';
  play.className = 'game-details-dialog__play';
  play.textContent =
    game.specs.price.toLowerCase() === 'free' ? 'Play Now' : `Buy Now: ${game.specs.price}`;

  const favorite: HTMLButtonElement = document.createElement('button');
  favorite.type = 'button';
  favorite.className = 'game-details-dialog__favorite';
  favorite.setAttribute('aria-pressed', String(game.isLikedByCurrentUser));

  const renderFavorite: () => void = (): void => {
    const isFavorite: boolean = favorite.getAttribute('aria-pressed') === 'true';
    favorite.textContent = isFavorite ? '♥ Added to Favorites' : '♡ Add to Favorites';
  };

  favorite.addEventListener('click', (): void => {
    const isFavorite: boolean = favorite.getAttribute('aria-pressed') === 'true';
    favorite.setAttribute('aria-pressed', String(!isFavorite));
    renderFavorite();
  });
  renderFavorite();
  actions.append(play, favorite);
  information.append(title, badges, description, actions);
  return information;
}

function createRecordItem(record: GameRecord): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = `game-details-dialog__record game-details-dialog__record--${record.position}`;

  const rank: HTMLSpanElement = document.createElement('span');
  rank.className = 'game-details-dialog__record-rank';
  rank.textContent = String(record.position);
  rank.setAttribute('aria-label', `Rank ${record.position}`);

  const player: HTMLSpanElement = document.createElement('span');
  player.className = 'game-details-dialog__record-player';
  player.textContent = record.playerName;

  const score: HTMLSpanElement = document.createElement('span');
  score.className = 'game-details-dialog__record-score';
  score.textContent = numberFormatter.format(record.score);

  item.append(rank, player, score);
  return item;
}

function createRecordsSection(records: GameRecord[]): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'game-details-dialog__records';
  section.setAttribute('aria-labelledby', 'game-records-title');
  const heading: HTMLHeadingElement = createSectionHeading('game-records-title', 'Top Records');

  if (records.length === 0) {
    section.append(
      heading,
      createEmptyState('No records yet', 'This game does not have any player records yet.'),
    );
    return section;
  }

  const list: HTMLOListElement = document.createElement('ol');
  list.className = 'game-details-dialog__records-list';
  list.append(...records.map((record: GameRecord): HTMLLIElement => createRecordItem(record)));
  section.append(heading, list);
  return section;
}

function createComment(comment: GameComment): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = 'game-details-dialog__comment';

  const avatar: HTMLSpanElement = document.createElement('span');
  avatar.className = 'game-details-dialog__comment-avatar';
  avatar.textContent = comment.authorName.slice(0, 1).toUpperCase();
  avatar.setAttribute('aria-hidden', 'true');

  const body: HTMLDivElement = document.createElement('div');
  body.className = 'game-details-dialog__comment-body';
  const header: HTMLDivElement = document.createElement('div');
  header.className = 'game-details-dialog__comment-header';
  const author: HTMLSpanElement = document.createElement('span');
  author.className = 'game-details-dialog__comment-author';
  author.textContent = comment.authorName;
  const date: HTMLTimeElement = document.createElement('time');
  date.dateTime = comment.createdAt;
  date.textContent = formatRelativeTime(comment.createdAt);
  header.append(author, date);

  const message: HTMLParagraphElement = document.createElement('p');
  message.textContent = comment.text;

  const like: HTMLButtonElement = document.createElement('button');
  like.type = 'button';
  like.className = 'game-details-dialog__like';
  like.setAttribute('aria-label', `Like comment by ${comment.authorName}`);
  like.setAttribute('aria-pressed', String(comment.isLikedByCurrentUser));
  let displayedLikes: number = comment.likesCount;

  const renderLike: () => void = (): void => {
    const isLiked: boolean = like.getAttribute('aria-pressed') === 'true';
    like.textContent = `${isLiked ? '♥' : '♡'} ${displayedLikes}`;
  };

  like.addEventListener('click', (): void => {
    const isLiked: boolean = like.getAttribute('aria-pressed') === 'true';
    displayedLikes = Math.max(0, displayedLikes + (isLiked ? -1 : 1));
    like.setAttribute('aria-pressed', String(!isLiked));
    renderLike();
  });
  renderLike();

  body.append(header, message, like);
  item.append(avatar, body);
  return item;
}

function createCommentForm(): CommentFormElements {
  const form: HTMLFormElement = document.createElement('form');
  form.className = 'game-details-dialog__comment-form';
  const label: HTMLLabelElement = document.createElement('label');
  label.htmlFor = 'game-comment';
  label.textContent = 'Leave a comment';
  const formRow: HTMLDivElement = document.createElement('div');
  formRow.className = 'game-details-dialog__comment-form-row';
  const textarea: HTMLTextAreaElement = document.createElement('textarea');
  textarea.id = 'game-comment';
  textarea.name = 'comment';
  textarea.rows = 1;
  textarea.placeholder = 'Share your thoughts about this game…';
  const submit: HTMLButtonElement = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Submit';

  textarea.addEventListener('input', (): void => {
    textarea.style.height = 'auto';
    const height: number = Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT);
    textarea.style.height = `${height}px`;
    textarea.style.overflowY = textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  });
  form.addEventListener('submit', (event: SubmitEvent): void => event.preventDefault());
  formRow.append(textarea, submit);
  form.append(label, formRow);
  return { element: form, textarea };
}

function createCommentsSection(response: GameCommentsResponse): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'game-details-dialog__comments';
  section.setAttribute('aria-labelledby', 'game-comments-title');
  const heading: HTMLHeadingElement = createSectionHeading(
    'game-comments-title',
    `Comments (${response.meta.totalComments})`,
  );
  const form: CommentFormElements = createCommentForm();

  if (response.data.length === 0) {
    section.append(
      heading,
      form.element,
      createEmptyState('No comments yet', 'Be the first player to share a comment.'),
    );
    return section;
  }

  const list: HTMLUListElement = document.createElement('ul');
  list.className = 'game-details-dialog__comment-list';
  list.append(
    ...response.data.map((comment: GameComment): HTMLLIElement => createComment(comment)),
  );
  section.append(heading, form.element, list);
  return section;
}

export function createGameDetailsDialog(options: GameDetailsDialogOptions): GameDetailsDialog {
  const element: HTMLDialogElement = document.createElement('dialog');
  element.className = 'game-details-dialog';
  element.setAttribute('aria-label', 'Game details');

  const hero: HTMLElement = document.createElement('header');
  hero.className = 'game-details-dialog__hero';
  const heroMedia: HTMLDivElement = document.createElement('div');
  heroMedia.className = 'game-details-dialog__hero-media';
  const close: HTMLButtonElement = document.createElement('button');
  close.type = 'button';
  close.className = 'game-details-dialog__close';
  close.setAttribute('aria-label', 'Close game details');
  close.textContent = '×';
  hero.append(heroMedia, close);

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-details-dialog__content';
  const detailsRegion: HTMLDivElement = document.createElement('div');
  detailsRegion.className = 'game-details-dialog__details-region';
  const commentsRegion: HTMLDivElement = document.createElement('div');
  commentsRegion.className = 'game-details-dialog__comments-region';
  content.append(detailsRegion, commentsRegion);
  element.append(hero, content);

  let isClosing: boolean = false;
  let closeTimer: number | undefined;
  let openFrame: number | undefined;
  let previousOverflow: string = '';
  let previouslyFocused: HTMLElement | undefined;
  let requestVersion: number = 0;
  let detailsRequest: AbortController | undefined;
  let commentsRequest: AbortController | undefined;
  let hasDetailsFailed: boolean = false;
  let hasCommentsFailed: boolean = false;

  const renderLoading: () => void = (): void => {
    const heroSkeleton: HTMLDivElement = document.createElement('div');
    heroSkeleton.className = 'game-details-dialog__hero-skeleton';
    heroSkeleton.setAttribute('aria-hidden', 'true');
    heroMedia.replaceChildren(heroSkeleton);
    detailsRegion.replaceChildren(createLoadingState('Loading game details'));
    commentsRegion.replaceChildren(createLoadingState('Loading latest comments'));
    element.removeAttribute('aria-labelledby');
    element.setAttribute('aria-label', 'Loading game details');
  };

  const renderDetails: (game: GameDetails) => void = (game: GameDetails): void => {
    const image: HTMLImageElement = document.createElement('img');
    image.src = getGameHeroImage(game.slug, game.heroImage);
    image.alt = `${game.name} artwork`;
    heroMedia.replaceChildren(image);
    detailsRegion.replaceChildren(
      createInformationSection(game),
      createRecordsSection(game.topRecords),
    );
    element.removeAttribute('aria-label');
    element.setAttribute('aria-labelledby', 'game-details-title');
  };

  const loadDetails: (
    gameSlug: string,
    userEmail: string | undefined,
    version: number,
  ) => Promise<void> = async (
    gameSlug: string,
    userEmail: string | undefined,
    version: number,
  ): Promise<void> => {
    detailsRequest?.abort();
    detailsRequest = new AbortController();
    detailsRegion.replaceChildren(createLoadingState('Loading game details'));

    try {
      const game: GameDetails = await fetchGameDetails(gameSlug, userEmail, detailsRequest.signal);

      if (version !== requestVersion || !element.open) {
        return;
      }

      renderDetails(game);

      if (hasDetailsFailed) {
        options.onNotify('Game details loaded successfully.', 'success');
        hasDetailsFailed = false;
      }
    } catch (error: unknown) {
      if (version !== requestVersion || !element.open || isAbortError(error)) {
        return;
      }

      hasDetailsFailed = true;
      detailsRegion.replaceChildren(
        createErrorBanner(
          'Game details could not be loaded. Check your connection and try again.',
          (): void => {
            void loadDetails(gameSlug, userEmail, version);
          },
          'Unable to load game details',
        ),
      );
      options.onNotify('Game details could not be loaded.', 'error');
    }
  };

  const loadComments: (gameSlug: string, version: number) => Promise<void> = async (
    gameSlug: string,
    version: number,
  ): Promise<void> => {
    commentsRequest?.abort();
    commentsRequest = new AbortController();
    commentsRegion.replaceChildren(createLoadingState('Loading latest comments'));

    try {
      const response: GameCommentsResponse = await fetchGameComments(
        gameSlug,
        commentsRequest.signal,
      );

      if (version !== requestVersion || !element.open) {
        return;
      }

      commentsRegion.replaceChildren(createCommentsSection(response));

      if (hasCommentsFailed) {
        options.onNotify('Latest comments loaded successfully.', 'success');
        hasCommentsFailed = false;
      }
    } catch (error: unknown) {
      if (version !== requestVersion || !element.open || isAbortError(error)) {
        return;
      }

      hasCommentsFailed = true;
      commentsRegion.replaceChildren(
        createErrorBanner(
          'Comments could not be loaded. Check your connection and try again.',
          (): void => {
            void loadComments(gameSlug, version);
          },
          'Unable to load comments',
        ),
      );
      options.onNotify('Latest comments could not be loaded.', 'error');
    }
  };

  function finishClose(): void {
    if (!isClosing) {
      return;
    }

    clearTimeout(closeTimer);
    element.close();
    isClosing = false;
    document.body.style.overflow = previousOverflow;
    previouslyFocused?.focus();
  }

  function closeDialog(): void {
    if (isClosing || !element.open) {
      return;
    }

    isClosing = true;
    requestVersion += 1;
    detailsRequest?.abort();
    commentsRequest?.abort();
    cancelAnimationFrame(openFrame ?? 0);
    element.classList.remove('game-details-dialog--open');
    closeTimer = setTimeout(finishClose, CLOSE_ANIMATION_DURATION);
  }

  function open(gameSlug: string, userEmail?: string): void {
    if (element.open || gameSlug.trim().length === 0) {
      return;
    }

    const normalizedSlug: string = gameSlug.trim();
    const version: number = ++requestVersion;
    hasDetailsFailed = false;
    hasCommentsFailed = false;
    renderLoading();
    isClosing = false;
    previousOverflow = document.body.style.overflow;
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    document.body.style.overflow = 'hidden';
    element.showModal();
    element.scrollTop = 0;
    element.getBoundingClientRect();
    openFrame = requestAnimationFrame((): void =>
      element.classList.add('game-details-dialog--open'),
    );
    void loadDetails(normalizedSlug, userEmail, version);
    void loadComments(normalizedSlug, version);
  }

  close.addEventListener('click', closeDialog);
  element.addEventListener('cancel', (event: Event): void => {
    event.preventDefault();
    closeDialog();
  });
  element.addEventListener('click', (event: MouseEvent): void => {
    const bounds: DOMRect = element.getBoundingClientRect();
    const isBackdropClick: boolean =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (isBackdropClick) {
      closeDialog();
    }
  });
  element.addEventListener('transitionend', (event: TransitionEvent): void => {
    if (event.target === element && event.propertyName === 'opacity') {
      finishClose();
    }
  });

  return { element, open };
}
