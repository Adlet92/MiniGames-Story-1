import tukoniHeroUrl from '../../assets/tukoni-forest-keepers-hero.jpg';
import './game-details-dialog.scss';

interface RecordData {
  player: string;
  rank: number;
  score: number;
}

interface CommentData {
  author: string;
  date: string;
  likes: number;
  message: string;
}

export interface GameDetailsDialog {
  element: HTMLDialogElement;
  open: () => void;
}

const TOP_RECORDS: RecordData[] = [
  { player: 'Alex_Pro99', rank: 1, score: 94_250 },
  { player: 'CozyGamer_x', rank: 2, score: 81_400 },
  { player: 'MatchMaster', rank: 3, score: 72_110 },
];

const COMMENTS: CommentData[] = [
  {
    author: 'CozyGamer_x',
    date: '2 days ago',
    likes: 12,
    message: 'The hand-drawn forest is beautiful. Every puzzle feels calm and thoughtful.',
  },
  {
    author: 'LeafLover',
    date: '5 days ago',
    likes: 8,
    message: 'I came for the cute characters and stayed for the tea recipes!',
  },
];

const TEXTAREA_MAX_HEIGHT: number = 88;
const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('en-US');

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

function createRecordsSection(): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'game-details-dialog__records';
  section.setAttribute('aria-labelledby', 'game-records-title');
  const heading: HTMLHeadingElement = createSectionHeading('game-records-title', 'Top Records');
  const list: HTMLOListElement = document.createElement('ol');
  list.className = 'game-details-dialog__records-list';

  for (const record of TOP_RECORDS) {
    const item: HTMLLIElement = document.createElement('li');
    item.className = `game-details-dialog__record game-details-dialog__record--${record.rank}`;
    const rank: HTMLSpanElement = document.createElement('span');
    rank.className = 'game-details-dialog__record-rank';
    rank.textContent = String(record.rank);
    rank.setAttribute('aria-label', `Rank ${record.rank}`);
    const player: HTMLSpanElement = document.createElement('span');
    player.className = 'game-details-dialog__record-player';
    player.textContent = record.player;
    const score: HTMLSpanElement = document.createElement('span');
    score.className = 'game-details-dialog__record-score';
    score.textContent = numberFormatter.format(record.score);
    item.append(rank, player, score);
    list.append(item);
  }

  section.append(heading, list);
  return section;
}

function createComment(comment: CommentData, likeButtons: HTMLButtonElement[]): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = 'game-details-dialog__comment';
  const avatar: HTMLSpanElement = document.createElement('span');
  avatar.className = 'game-details-dialog__comment-avatar';
  avatar.textContent = comment.author.slice(0, 1).toUpperCase();
  avatar.setAttribute('aria-hidden', 'true');

  const body: HTMLDivElement = document.createElement('div');
  body.className = 'game-details-dialog__comment-body';
  const header: HTMLDivElement = document.createElement('div');
  header.className = 'game-details-dialog__comment-header';
  const author: HTMLSpanElement = document.createElement('span');
  author.className = 'game-details-dialog__comment-author';
  author.textContent = comment.author;
  const date: HTMLTimeElement = document.createElement('time');
  date.textContent = comment.date;
  header.append(author, date);
  const message: HTMLParagraphElement = document.createElement('p');
  message.textContent = comment.message;

  const like: HTMLButtonElement = document.createElement('button');
  like.type = 'button';
  like.className = 'game-details-dialog__like';
  like.dataset.likes = String(comment.likes);
  like.setAttribute('aria-label', `Like comment by ${comment.author}`);
  like.setAttribute('aria-pressed', 'false');
  like.textContent = `♡ ${comment.likes}`;
  like.addEventListener('click', (): void => {
    const isLiked: boolean = like.getAttribute('aria-pressed') === 'true';
    like.setAttribute('aria-pressed', String(!isLiked));
    like.textContent = `${isLiked ? '♡' : '♥'} ${comment.likes + (isLiked ? 0 : 1)}`;
  });
  likeButtons.push(like);

  body.append(header, message, like);
  item.append(avatar, body);
  return item;
}

function resetLikeButton(button: HTMLButtonElement): void {
  const likes: string = button.dataset.likes ?? '0';
  button.setAttribute('aria-pressed', 'false');
  button.textContent = `♡ ${likes}`;
}

export function createGameDetailsDialog(): GameDetailsDialog {
  const element: HTMLDialogElement = document.createElement('dialog');
  element.className = 'game-details-dialog';
  element.setAttribute('aria-labelledby', 'game-details-title');

  const hero: HTMLElement = document.createElement('header');
  hero.className = 'game-details-dialog__hero';
  const image: HTMLImageElement = document.createElement('img');
  image.src = tukoniHeroUrl;
  image.alt = 'Tukoni: Forest Keepers artwork';
  const close: HTMLButtonElement = document.createElement('button');
  close.type = 'button';
  close.className = 'game-details-dialog__close';
  close.setAttribute('aria-label', 'Close game details');
  close.textContent = '×';
  hero.append(image, close);

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-details-dialog__content';
  const information: HTMLElement = document.createElement('section');
  information.className = 'game-details-dialog__information';
  information.setAttribute('aria-labelledby', 'game-details-title');
  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'game-details-title';
  title.textContent = 'Tukoni: Forest Keepers';
  const badges: HTMLDivElement = document.createElement('div');
  badges.className = 'game-details-dialog__badges';
  badges.append(
    createBadge('Puzzle'),
    createBadge('Single Player'),
    createBadge('Free'),
    createBadge('★ 4.9'),
  );
  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'game-details-dialog__description';
  description.textContent =
    'A cute cozy puzzle adventure. Play as a forest spirit exploring hand-drawn magical locations, meet charming characters, solve puzzles, collect herbs and tea recipes.';
  const actions: HTMLDivElement = document.createElement('div');
  actions.className = 'game-details-dialog__actions';
  const play: HTMLButtonElement = document.createElement('button');
  play.type = 'button';
  play.className = 'game-details-dialog__play';
  play.textContent = 'Play Now';
  const favorite: HTMLButtonElement = document.createElement('button');
  favorite.type = 'button';
  favorite.className = 'game-details-dialog__favorite';
  favorite.textContent = '♡ Add to Favorites';
  favorite.setAttribute('aria-pressed', 'false');
  actions.append(play, favorite);
  information.append(title, badges, description, actions);

  const likeButtons: HTMLButtonElement[] = [];
  const comments: HTMLElement = document.createElement('section');
  comments.className = 'game-details-dialog__comments';
  comments.setAttribute('aria-labelledby', 'game-comments-title');
  const commentsHeading: HTMLHeadingElement = createSectionHeading(
    'game-comments-title',
    'Comments',
  );
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
  formRow.append(textarea, submit);
  form.append(label, formRow);

  const commentList: HTMLUListElement = document.createElement('ul');
  commentList.className = 'game-details-dialog__comment-list';
  commentList.append(
    ...COMMENTS.map((comment: CommentData): HTMLLIElement => createComment(comment, likeButtons)),
  );
  comments.append(commentsHeading, form, commentList);
  content.append(information, createRecordsSection(), comments);
  element.append(hero, content);

  let isClosing: boolean = false;
  let closeTimer: number | undefined;
  let openFrame: number | undefined;
  let previousOverflow: string = '';
  let previouslyFocused: HTMLElement | undefined;

  function resizeTextarea(): void {
    textarea.style.height = 'auto';
    const height: number = Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT);
    textarea.style.height = `${height}px`;
    textarea.style.overflowY = textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  }

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
    cancelAnimationFrame(openFrame ?? 0);
    element.classList.remove('game-details-dialog--open');
    closeTimer = setTimeout(finishClose, 220);
  }

  function resetState(): void {
    favorite.setAttribute('aria-pressed', 'false');
    favorite.textContent = '♡ Add to Favorites';
    for (const button of likeButtons) {
      resetLikeButton(button);
    }
    textarea.value = '';
    textarea.style.height = '';
    textarea.style.overflowY = 'hidden';
    element.scrollTop = 0;
  }

  function open(): void {
    if (element.open) {
      return;
    }
    resetState();
    isClosing = false;
    previousOverflow = document.body.style.overflow;
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    document.body.style.overflow = 'hidden';
    element.showModal();
    element.getBoundingClientRect();
    openFrame = requestAnimationFrame((): void =>
      element.classList.add('game-details-dialog--open'),
    );
  }

  favorite.addEventListener('click', (): void => {
    const isFavorite: boolean = favorite.getAttribute('aria-pressed') === 'true';
    favorite.setAttribute('aria-pressed', String(!isFavorite));
    favorite.textContent = isFavorite ? '♡ Add to Favorites' : '♥ Added to Favorites';
  });
  textarea.addEventListener('input', resizeTextarea);
  form.addEventListener('submit', (event: SubmitEvent): void => event.preventDefault());
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
