import type { LeaderboardEntry, LeaderboardResponse } from '../../services/leaderboard-api';
import { fetchLeaderboard } from '../../services/leaderboard-api';
import {
  createEmptyState,
  createErrorBanner,
  createTableSkeleton,
} from '../ui/data-state/data-state';
import type { SnackbarVariant } from '../ui/snackbar/snackbar';
import './leaderboard.scss';

export interface LeaderboardOptions {
  onNotify: (message: string, variant: SnackbarVariant) => void;
}

const TABLE_COLUMN_COUNT: number = 6;
const SKELETON_ROW_COUNT: number = 5;
const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('en-US');

function createCell(tagName: 'td' | 'th', className: string): HTMLTableCellElement {
  const cell: HTMLTableCellElement = document.createElement(tagName);
  cell.className = className;
  return cell;
}

function getInitials(playerName: string): string {
  const words: string[] = playerName.match(/[A-Z][a-z]*/g) ?? [];
  return words
    .slice(0, 2)
    .map((word: string): string => word[0] ?? '')
    .join('');
}

function createHeader(): HTMLTableSectionElement {
  const tableHead: HTMLTableSectionElement = document.createElement('thead');
  const row: HTMLTableRowElement = document.createElement('tr');
  const headings: { label: string; shortLabel?: string; className: string }[] = [
    { label: 'Rank', className: 'leaderboard__rank' },
    { label: 'Player', className: 'leaderboard__player' },
    { label: 'Games Played', shortLabel: 'Games', className: 'leaderboard__games' },
    { label: 'Total Score', shortLabel: 'Score', className: 'leaderboard__score' },
    { label: 'Streak', className: 'leaderboard__streak' },
    { label: 'Favorite Game', className: 'leaderboard__favorite' },
  ];

  for (const heading of headings) {
    const cell: HTMLTableCellElement = createCell('th', heading.className);
    cell.scope = 'col';
    const label: HTMLSpanElement = document.createElement('span');
    label.textContent = heading.label;

    if (heading.shortLabel) {
      label.className = 'leaderboard__long-label';
      const shortLabel: HTMLSpanElement = document.createElement('span');
      shortLabel.className = 'leaderboard__short-label';
      shortLabel.textContent = heading.shortLabel;
      cell.append(label, shortLabel);
    } else {
      cell.append(label);
    }

    row.append(cell);
  }

  tableHead.append(row);
  return tableHead;
}

function createPlayerCell(entry: LeaderboardEntry): HTMLTableCellElement {
  const cell: HTMLTableCellElement = createCell('td', 'leaderboard__player');
  const content: HTMLSpanElement = document.createElement('span');
  content.className = 'leaderboard__player-content';
  const avatar: HTMLSpanElement = document.createElement('span');
  avatar.className = `leaderboard__avatar leaderboard__avatar--${entry.rank}`;
  avatar.textContent = getInitials(entry.playerName);
  avatar.setAttribute('aria-hidden', 'true');
  const name: HTMLSpanElement = document.createElement('span');
  name.className = 'leaderboard__player-name';
  name.textContent = entry.playerName;
  name.title = entry.playerName;
  content.append(avatar, name);
  cell.append(content);
  return cell;
}

function createRow(entry: LeaderboardEntry): HTMLTableRowElement {
  const row: HTMLTableRowElement = document.createElement('tr');
  const rank: HTMLTableCellElement = createCell('th', 'leaderboard__rank');
  rank.scope = 'row';
  rank.textContent = `#${entry.rank}`;

  const games: HTMLTableCellElement = createCell('td', 'leaderboard__games');
  games.textContent = String(entry.gamesPlayed);
  const score: HTMLTableCellElement = createCell('td', 'leaderboard__score');
  const fullScore: HTMLSpanElement = document.createElement('span');
  fullScore.className = 'leaderboard__full-score';
  fullScore.textContent = numberFormatter.format(entry.totalScore);
  const compactScore: HTMLSpanElement = document.createElement('span');
  compactScore.className = 'leaderboard__compact-score';
  compactScore.textContent = `${(Math.trunc(entry.totalScore / 100) / 10).toFixed(1)}K`;
  score.append(fullScore, compactScore);

  const streak: HTMLTableCellElement = createCell('td', 'leaderboard__streak');
  const flame: HTMLSpanElement = document.createElement('span');
  flame.setAttribute('aria-hidden', 'true');
  flame.textContent = '🔥';
  const days: HTMLSpanElement = document.createElement('span');
  days.className = 'leaderboard__streak-days';
  days.textContent = `${entry.streakDays} days`;
  const shortDays: HTMLSpanElement = document.createElement('span');
  shortDays.className = 'leaderboard__streak-short';
  shortDays.textContent = `${entry.streakDays}d`;
  streak.append(flame, ' ', days, shortDays);

  const favorite: HTMLTableCellElement = createCell('td', 'leaderboard__favorite');
  const badge: HTMLSpanElement = document.createElement('span');
  badge.className = 'leaderboard__game-badge';
  badge.textContent = entry.favoriteGameName;
  badge.dataset.gameSlug = entry.favoriteGameSlug;
  favorite.append(badge);
  row.append(rank, createPlayerCell(entry), games, score, streak, favorite);
  return row;
}

function createTable(response: LeaderboardResponse): HTMLTableElement {
  const table: HTMLTableElement = document.createElement('table');
  table.className = 'leaderboard__table';
  table.setAttribute('aria-label', response.meta.description);
  const tableBody: HTMLTableSectionElement = document.createElement('tbody');

  for (const entry of response.data) {
    tableBody.append(createRow(entry));
  }

  table.append(createHeader(), tableBody);
  return table;
}

function getLoadErrorMessage(error: unknown): string {
  return error instanceof Error
    ? 'The leaderboard request failed. Check your connection and try again.'
    : 'An unexpected error occurred while loading the leaderboard.';
}

export function createLeaderboardSection(options: LeaderboardOptions): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'leaderboard';
  section.setAttribute('aria-labelledby', 'leaderboard-title');

  const headingGroup: HTMLDivElement = document.createElement('div');
  headingGroup.className = 'leaderboard__heading-group';
  const accent: HTMLSpanElement = document.createElement('span');
  accent.className = 'leaderboard__accent';
  accent.setAttribute('aria-hidden', 'true');
  const heading: HTMLHeadingElement = document.createElement('h2');
  heading.id = 'leaderboard-title';
  heading.className = 'leaderboard__heading';
  const fullHeading: HTMLSpanElement = document.createElement('span');
  fullHeading.className = 'leaderboard__full-heading';
  fullHeading.textContent = 'Top Players This Week';
  const mobileHeading: HTMLSpanElement = document.createElement('span');
  mobileHeading.className = 'leaderboard__mobile-heading';
  mobileHeading.textContent = 'Top Players';
  heading.append(fullHeading, mobileHeading);
  headingGroup.append(accent, heading);

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'leaderboard__content';
  section.append(headingGroup, content);

  let requestVersion: number = 0;
  let hasFailedRequest: boolean = false;

  const loadLeaderboard: () => Promise<void> = async (): Promise<void> => {
    const currentRequest: number = ++requestVersion;
    content.replaceChildren(
      createTableSkeleton(SKELETON_ROW_COUNT, TABLE_COLUMN_COUNT, 'Loading top players'),
    );

    try {
      const response: LeaderboardResponse = await fetchLeaderboard();

      if (currentRequest !== requestVersion || !section.isConnected) {
        return;
      }

      fullHeading.textContent = response.meta.description;

      if (response.data.length === 0) {
        content.replaceChildren(
          createEmptyState('No leaderboard data', 'No player records are available right now.'),
        );
        return;
      }

      content.replaceChildren(createTable(response));

      if (hasFailedRequest) {
        options.onNotify('Leaderboard loaded successfully.', 'success');
        hasFailedRequest = false;
      }
    } catch (error: unknown) {
      if (currentRequest !== requestVersion || !section.isConnected) {
        return;
      }

      hasFailedRequest = true;
      content.replaceChildren(
        createErrorBanner(
          getLoadErrorMessage(error),
          (): void => {
            void loadLeaderboard();
          },
          'Unable to load leaderboard',
        ),
      );
      options.onNotify('Leaderboard could not be loaded.', 'error');
    }
  };

  requestAnimationFrame((): void => {
    void loadLeaderboard();
  });
  return section;
}
