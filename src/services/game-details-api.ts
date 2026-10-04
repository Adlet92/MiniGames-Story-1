import { getJson } from './api';

export interface GameDetailsSpecs {
  duration: string;
  genre: string;
  players: string;
  price: string;
}

export interface GameRecord {
  achievedAt: string;
  playerName: string;
  position: number;
  score: number;
}

export interface GameDetails {
  fullDescription: string;
  heroImage: string;
  isLikedByCurrentUser: boolean;
  likesCount: number;
  name: string;
  rating: number;
  slug: string;
  specs: GameDetailsSpecs;
  topRecords: GameRecord[];
}

export interface GameComment {
  authorName: string;
  commentId: string;
  createdAt: string;
  isLikedByCurrentUser: boolean;
  likesCount: number;
  text: string;
}

export interface GameCommentsResponse {
  data: GameComment[];
  meta: {
    returnedCount: number;
    sort: string;
    totalComments: number;
  };
}

const LATEST_COMMENTS_LIMIT: number = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value: unknown = record[key];

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid game details response: ${key} must be a string.`);
  }

  return value;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value: unknown = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Invalid game details response: ${key} must be a number.`);
  }

  return value;
}

function isBooleanValue(record: Record<string, unknown>, key: string): boolean {
  const value: unknown = record[key];

  if (typeof value !== 'boolean') {
    throw new TypeError(`Invalid game details response: ${key} must be a boolean.`);
  }

  return value;
}

function parseSpecs(value: unknown): GameDetailsSpecs {
  if (!isRecord(value)) {
    throw new TypeError('Invalid game details response: specs must be an object.');
  }

  return {
    genre: readString(value, 'genre'),
    players: readString(value, 'players'),
    duration: readString(value, 'duration'),
    price: readString(value, 'price'),
  };
}

function parseRecord(value: unknown): GameRecord {
  if (!isRecord(value)) {
    throw new TypeError('Invalid game details response: each record must be an object.');
  }

  return {
    position: readNumber(value, 'position'),
    playerName: readString(value, 'playerName'),
    score: readNumber(value, 'score'),
    achievedAt: readString(value, 'achievedAt'),
  };
}

function parseGameDetails(value: unknown): GameDetails {
  if (!isRecord(value) || !Array.isArray(value.topRecords)) {
    throw new TypeError('Invalid game details response: data or records are missing.');
  }

  return {
    slug: readString(value, 'slug'),
    name: readString(value, 'name'),
    heroImage: readString(value, 'heroImage'),
    rating: readNumber(value, 'rating'),
    likesCount: readNumber(value, 'likesCount'),
    isLikedByCurrentUser: isBooleanValue(value, 'isLikedByCurrentUser'),
    fullDescription: readString(value, 'fullDescription'),
    specs: parseSpecs(value.specs),
    topRecords: value.topRecords.map((record: unknown): GameRecord => parseRecord(record)),
  };
}

function parseComment(value: unknown): GameComment {
  if (!isRecord(value)) {
    throw new TypeError('Invalid comments response: each comment must be an object.');
  }

  return {
    commentId: readString(value, 'commentId'),
    authorName: readString(value, 'authorName'),
    text: readString(value, 'text'),
    likesCount: readNumber(value, 'likesCount'),
    isLikedByCurrentUser: isBooleanValue(value, 'isLikedByCurrentUser'),
    createdAt: readString(value, 'createdAt'),
  };
}

function parseCommentsResponse(value: unknown): GameCommentsResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.meta)) {
    throw new TypeError('Invalid comments response: data or metadata are missing.');
  }

  return {
    data: value.data.map((comment: unknown): GameComment => parseComment(comment)),
    meta: {
      totalComments: readNumber(value.meta, 'totalComments'),
      returnedCount: readNumber(value.meta, 'returnedCount'),
      sort: readString(value.meta, 'sort'),
    },
  };
}

export async function fetchGameDetails(
  gameSlug: string,
  userEmail?: string,
  signal?: AbortSignal,
): Promise<GameDetails> {
  const parameters: URLSearchParams = new URLSearchParams();
  const normalizedEmail: string = userEmail?.trim() ?? '';

  if (normalizedEmail.length > 0) {
    parameters.set('userEmail', normalizedEmail);
  }

  const query: string = parameters.size > 0 ? `?${parameters.toString()}` : '';
  const response: unknown = await getJson(`games/${encodeURIComponent(gameSlug)}${query}`, signal);

  if (!isRecord(response)) {
    throw new TypeError('Invalid game details response.');
  }

  return parseGameDetails(response.data);
}

export async function fetchGameComments(
  gameSlug: string,
  signal?: AbortSignal,
): Promise<GameCommentsResponse> {
  const parameters: URLSearchParams = new URLSearchParams({
    limit: String(LATEST_COMMENTS_LIMIT),
    sort: 'newest',
  });
  const response: unknown = await getJson(
    `games/${encodeURIComponent(gameSlug)}/comments?${parameters.toString()}`,
    signal,
  );
  return parseCommentsResponse(response);
}
