import { getJson } from './api';

export type CategorySlug = 'all' | 'puzzle' | 'card' | 'match' | 'farm' | 'strategy' | 'arcade';
export type GameSort = 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';

export const DEFAULT_GAME_SORT: GameSort = 'rating-desc';

export interface PublicGame {
  cardImage: string;
  category: string;
  likesCount: number;
  name: string;
  price: string;
  rating: number;
  shortDescription: string;
  slug: string;
}

interface GamesDataResponse {
  data: PublicGame[];
}

export interface GamesQuery {
  category?: CategorySlug;
  limit: number;
  page?: number;
  sort?: GameSort;
}

export interface GamesListResponse extends GamesDataResponse {
  meta: {
    limit: number;
    page: number;
    totalItems: number;
    totalPages: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value: unknown = record[key];

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid games response: ${key} must be a string.`);
  }

  return value;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value: unknown = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Invalid games response: ${key} must be a number.`);
  }

  return value;
}

function parseGame(value: unknown): PublicGame {
  if (!isRecord(value)) {
    throw new TypeError('Invalid games response: each game must be an object.');
  }

  return {
    slug: readString(value, 'slug'),
    name: readString(value, 'name'),
    category: readString(value, 'category'),
    price: readString(value, 'price'),
    shortDescription: readString(value, 'shortDescription'),
    rating: readNumber(value, 'rating'),
    likesCount: readNumber(value, 'likesCount'),
    cardImage: readString(value, 'cardImage'),
  };
}

function parseGamesDataResponse(value: unknown): GamesDataResponse {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    throw new TypeError('Invalid games response: data must be an array.');
  }

  return { data: value.data.map((game: unknown): PublicGame => parseGame(game)) };
}

function parseGamesListResponse(value: unknown): GamesListResponse {
  const parsed: GamesDataResponse = parseGamesDataResponse(value);

  if (!isRecord(value) || !isRecord(value.meta)) {
    throw new TypeError('Invalid games response: meta must be an object.');
  }

  return {
    data: parsed.data,
    meta: {
      page: readNumber(value.meta, 'page'),
      limit: readNumber(value.meta, 'limit'),
      totalItems: readNumber(value.meta, 'totalItems'),
      totalPages: readNumber(value.meta, 'totalPages'),
    },
  };
}

function addOptionalParameter(
  parameters: URLSearchParams,
  key: string,
  value?: string | number,
): void {
  if (value === undefined) {
    return;
  }

  parameters.set(key, String(value));
}

export async function fetchFeaturedGames(signal?: AbortSignal): Promise<PublicGame[]> {
  const response: unknown = await getJson('games?featured=true', signal);
  return parseGamesDataResponse(response).data;
}

export async function fetchGames(
  query: GamesQuery,
  signal?: AbortSignal,
): Promise<GamesListResponse> {
  const parameters: URLSearchParams = new URLSearchParams({ limit: String(query.limit) });
  addOptionalParameter(parameters, 'page', query.page);
  addOptionalParameter(parameters, 'category', query.category);
  addOptionalParameter(parameters, 'sort', query.sort);
  const response: unknown = await getJson(`games?${parameters.toString()}`, signal);
  return parseGamesListResponse(response);
}
