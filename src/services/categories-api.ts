import { getJson } from './api';
import type { CategorySlug } from './games-api';

export interface Category {
  isDefault: boolean;
  label: string;
  slug: CategorySlug;
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    description: string;
    totalItems: number;
  };
}

const CATEGORY_SLUGS: ReadonlySet<string> = new Set([
  'all',
  'puzzle',
  'card',
  'match',
  'farm',
  'strategy',
  'arcade',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value: unknown = record[key];

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid categories response: ${key} must be a string.`);
  }

  return value;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value: unknown = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Invalid categories response: ${key} must be a number.`);
  }

  return value;
}

function isBooleanValue(record: Record<string, unknown>, key: string): boolean {
  const value: unknown = record[key];

  if (typeof value !== 'boolean') {
    throw new TypeError(`Invalid categories response: ${key} must be a boolean.`);
  }

  return value;
}

function parseCategory(value: unknown): Category {
  if (!isRecord(value)) {
    throw new TypeError('Invalid categories response: each category must be an object.');
  }

  const slug: string = readString(value, 'slug');

  if (!CATEGORY_SLUGS.has(slug)) {
    throw new TypeError(`Invalid categories response: unsupported category ${slug}.`);
  }

  return {
    slug: slug as CategorySlug,
    label: readString(value, 'label'),
    isDefault: isBooleanValue(value, 'isDefault'),
  };
}

function parseResponse(value: unknown): CategoriesResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.meta)) {
    throw new TypeError('Invalid categories response structure.');
  }

  return {
    data: value.data.map((category: unknown): Category => parseCategory(category)),
    meta: {
      totalItems: readNumber(value.meta, 'totalItems'),
      description: readString(value.meta, 'description'),
    },
  };
}

export async function fetchCategories(signal?: AbortSignal): Promise<CategoriesResponse> {
  const response: unknown = await getJson('categories', signal);
  return parseResponse(response);
}
