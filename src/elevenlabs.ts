import type { Result } from './json-file.ts';

export const API = 'https://api.elevenlabs.io/v1';

export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export const requireApiKey = (apiKey: string | undefined): Result<string> => {
  const key = apiKey?.trim();
  return key
    ? { ok: true, value: key }
    : { ok: false, error: 'ELEVENLABS_API_KEY is not set. Add it to your environment or a local .env file.' };
};

type PostOptions<T> = {
  fetch: Fetch;
  apiKey: string;
  url: string;
  body: unknown;
  // Reads the successful response; it runs inside the same failure handling as the request.
  read: (response: Response) => Promise<T>;
};

export const post = async <T>({ fetch, apiKey, url, body, read }: PostOptions<T>): Promise<Result<T>> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return { ok: false, error: `ElevenLabs returned HTTP ${response.status}: ${await response.text()}` };
    }
    return { ok: true, value: await read(response) };
  } catch (error) {
    return { ok: false, error: `Could not reach ElevenLabs: ${String(error)}` };
  }
};

// A body that is not JSON is reported by the caller's schema check, not as a network failure.
export const readJsonBody = (response: Response): Promise<unknown> => response.json().catch(() => undefined);
