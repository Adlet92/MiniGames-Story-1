export const API_BASE_URL: string = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

export class ApiError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function getJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const url: URL = new URL(path, `${API_BASE_URL}/`);
  const requestOptions: RequestInit = {
    headers: { Accept: 'application/json' },
    ...(signal && { signal }),
  };
  const response: Response = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }

  return response.json() as Promise<unknown>;
}
