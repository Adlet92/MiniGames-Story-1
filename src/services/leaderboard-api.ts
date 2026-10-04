import { getJson } from './api';

export interface LeaderboardEntry {
  favoriteGameName: string;
  favoriteGameSlug: string;
  gamesPlayed: number;
  playerName: string;
  rank: number;
  streakDays: number;
  totalScore: number;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: {
    description: string;
    totalItems: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value: unknown = record[key];

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid leaderboard response: ${key} must be a string.`);
  }

  return value;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value: unknown = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Invalid leaderboard response: ${key} must be a number.`);
  }

  return value;
}

function parseEntry(value: unknown): LeaderboardEntry {
  if (!isRecord(value)) {
    throw new TypeError('Invalid leaderboard response: each entry must be an object.');
  }

  return {
    rank: readNumber(value, 'rank'),
    playerName: readString(value, 'playerName'),
    gamesPlayed: readNumber(value, 'gamesPlayed'),
    totalScore: readNumber(value, 'totalScore'),
    streakDays: readNumber(value, 'streakDays'),
    favoriteGameSlug: readString(value, 'favoriteGameSlug'),
    favoriteGameName: readString(value, 'favoriteGameName'),
  };
}

function parseResponse(value: unknown): LeaderboardResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.meta)) {
    throw new TypeError('Invalid leaderboard response structure.');
  }

  return {
    data: value.data.map((entry: unknown): LeaderboardEntry => parseEntry(entry)),
    meta: {
      totalItems: readNumber(value.meta, 'totalItems'),
      description: readString(value.meta, 'description'),
    },
  };
}

export async function fetchLeaderboard(signal?: AbortSignal): Promise<LeaderboardResponse> {
  const response: unknown = await getJson('leaderboard', signal);
  return parseResponse(response);
}
