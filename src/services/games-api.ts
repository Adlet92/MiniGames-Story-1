import { getJson } from './api';

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

interface FeaturedGamesResponse {
  data: PublicGame[];
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

function parseFeaturedGamesResponse(value: unknown): FeaturedGamesResponse {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    throw new TypeError('Invalid games response: data must be an array.');
  }

  return { data: value.data.map((game: unknown): PublicGame => parseGame(game)) };
}

export async function fetchFeaturedGames(signal?: AbortSignal): Promise<PublicGame[]> {
  const response: unknown = await getJson('games?featured=true', signal);
  return parseFeaturedGamesResponse(response).data;
}
