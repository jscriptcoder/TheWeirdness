import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DialogueRequestSchema,
  generateDialogue,
  type DialogueRequest,
  type Fetch,
} from './dialogue.ts';
import { makeWorkspace } from './test-support.ts';

const NARRATOR = 'QdMPtN6UaliUKoCqMvVS';
const MARA = 'MatREvRtc5MgJoZ9A2cZ';
const AUDIO = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00]);

const getDialogueRequest = (overrides?: Partial<DialogueRequest>): DialogueRequest =>
  DialogueRequestSchema.parse({
    inputs: [
      { text: 'Mara stood very still.', voice_id: NARRATOR },
      { text: 'It isn\'t working.', voice_id: MARA },
    ],
    ...overrides,
  });

type SentRequest = { url: string; init: RequestInit };

const fakeElevenLabs = (response: () => Response = () => new Response(AUDIO)) => {
  const sent: SentRequest[] = [];
  const fetch: Fetch = async (url, init) => {
    sent.push({ url, init });
    return response();
  };
  return { fetch, sent };
};

const writeRequestFile = async (dir: string, body: unknown, name = 'audition-request.json') => {
  const path = join(dir, name);
  await writeFile(path, JSON.stringify(body));
  return path;
};

const NOW = () => new Date('2026-10-29T18:05:09.123Z');

describe('generateDialogue', () => {
  it('posts the request file to the Text to Dialogue endpoint and saves the returned audio', async () => {
    const dir = await makeWorkspace();
    const requestFile = await writeRequestFile(dir, getDialogueRequest());
    const outputDir = join(dir, 'generated', 'takes');
    const api = fakeElevenLabs();

    const result = await generateDialogue({
      requestFile,
      outputDir,
      apiKey: 'test-key',
      fetch: api.fetch,
      now: NOW,
    });

    const audioFile = join(outputDir, 'audition-request-20261029-180509.mp3');
    expect(result).toEqual({ ok: true, audioFile, characters: 39 });
    expect(new Uint8Array(await readFile(audioFile))).toEqual(AUDIO);
    expect(api.sent).toHaveLength(1);
    const [request] = api.sent;
    expect(request?.url).toBe(
      'https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128',
    );
    expect(request?.init.method).toBe('POST');
    expect(request?.init.headers).toEqual({
      'xi-api-key': 'test-key',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(request?.init.body))).toEqual(getDialogueRequest());
  });

  it('forwards optional API fields such as model_id unchanged', async () => {
    const dir = await makeWorkspace();
    const body = { ...getDialogueRequest(), model_id: 'eleven_v3', seed: 7 };
    const requestFile = await writeRequestFile(dir, body);
    const api = fakeElevenLabs();

    await generateDialogue({ requestFile, outputDir: dir, apiKey: 'test-key', fetch: api.fetch, now: NOW });

    expect(JSON.parse(String(api.sent[0]?.init.body))).toEqual(body);
  });

  describe('refuses before spending credits', () => {
    const attempt = async (options: { body?: unknown; apiKey?: string | undefined; requestFile?: string }) => {
      const dir = await makeWorkspace();
      const requestFile =
        options.requestFile ?? (await writeRequestFile(dir, options.body ?? getDialogueRequest()));
      const api = fakeElevenLabs();
      const result = await generateDialogue({
        requestFile,
        outputDir: join(dir, 'generated'),
        apiKey: 'apiKey' in options ? options.apiKey : 'test-key',
        fetch: api.fetch,
        now: NOW,
      });
      return { result, sent: api.sent };
    };

    it.each([undefined, '', '   '])('when the API key is %j', async (apiKey) => {
      const { result, sent } = await attempt({ apiKey });

      expect(result).toEqual({ ok: false, error: expect.stringContaining('ELEVENLABS_API_KEY') });
      expect(sent).toEqual([]);
    });

    it('when the request file cannot be read', async () => {
      const { result, sent } = await attempt({ requestFile: join(tmpdir(), 'missing-weirdness.json') });

      expect(result).toEqual({ ok: false, error: expect.stringContaining('missing-weirdness.json') });
      expect(sent).toEqual([]);
    });

    it('when the request file is not JSON', async () => {
      const dir = await makeWorkspace();
      const requestFile = join(dir, 'broken.json');
      await writeFile(requestFile, '{ "inputs": [');

      const { result, sent } = await attempt({ requestFile });

      expect(result).toEqual({ ok: false, error: expect.stringContaining('broken.json') });
      expect(sent).toEqual([]);
    });

    it.each([
      ['has no passages', { inputs: [] }],
      ['has a passage without a voice', { inputs: [{ text: 'Today was Wednesday.' }] }],
      ['has a passage with a blank voice', { inputs: [{ text: 'Today was Wednesday.', voice_id: ' ' }] }],
      ['has a passage with no text', { inputs: [{ text: '', voice_id: NARRATOR }] }],
    ])('when the request %s', async (_, body) => {
      const { result, sent } = await attempt({ body });

      expect(result).toEqual({ ok: false, error: expect.stringContaining('Invalid dialogue request') });
      expect(sent).toEqual([]);
    });

    it('when the passages exceed 2,000 characters in total', async () => {
      const body = getDialogueRequest({
        inputs: [
          { text: 'a'.repeat(1000), voice_id: NARRATOR },
          { text: 'b'.repeat(1001), voice_id: MARA },
        ],
      });

      const { result, sent } = await attempt({ body });

      expect(result).toEqual({ ok: false, error: expect.stringContaining('2001 characters') });
      expect(sent).toEqual([]);
    });
  });

  describe('when ElevenLabs does not return audio', () => {
    const attempt = async (fetch: Fetch) => {
      const dir = await makeWorkspace();
      const requestFile = await writeRequestFile(dir, getDialogueRequest());
      const outputDir = join(dir, 'generated');
      const result = await generateDialogue({ requestFile, outputDir, apiKey: 'test-key', fetch, now: NOW });
      return { result, outputDir };
    };

    it('reports the status and response body, and saves nothing', async () => {
      const api = fakeElevenLabs(
        () => new Response('{"detail":{"status":"quota_exceeded"}}', { status: 401 }),
      );

      const { result, outputDir } = await attempt(api.fetch);

      expect(result).toEqual({
        ok: false,
        error: 'ElevenLabs returned HTTP 401: {"detail":{"status":"quota_exceeded"}}',
      });
      expect(existsSync(outputDir)).toBe(false);
    });

    it('reports a network failure, and saves nothing', async () => {
      const { result, outputDir } = await attempt(async () => {
        throw new TypeError('fetch failed');
      });

      expect(result).toEqual({
        ok: false,
        error: expect.stringContaining('Could not reach ElevenLabs: TypeError: fetch failed'),
      });
      expect(existsSync(outputDir)).toBe(false);
    });
  });

  it.each([
    'audition-request.json',
    'requests/part-01.json',
    'requests/part-02.json',
    'requests/part-03.json',
    'requests/part-04.json',
  ])('accepts the prepared pilot request %s', async (file) => {
    const dir = await makeWorkspace();
    const api = fakeElevenLabs();

    const result = await generateDialogue({
      requestFile: join('episodes', '001-universe-customer-support', 'api', file),
      outputDir: dir,
      apiKey: 'test-key',
      fetch: api.fetch,
      now: NOW,
    });

    expect(result).toEqual({ ok: true, audioFile: expect.any(String), characters: expect.any(Number) });
  });

  it('sends a request of exactly 2,000 characters', async () => {
    const dir = await makeWorkspace();
    const body = getDialogueRequest({
      inputs: [
        { text: 'a'.repeat(1000), voice_id: NARRATOR },
        { text: 'b'.repeat(1000), voice_id: MARA },
      ],
    });
    const requestFile = await writeRequestFile(dir, body);
    const api = fakeElevenLabs();

    const result = await generateDialogue({ requestFile, outputDir: dir, apiKey: 'test-key', fetch: api.fetch, now: NOW });

    expect(result).toEqual({ ok: true, audioFile: expect.any(String), characters: 2000 });
    expect(api.sent).toHaveLength(1);
  });
});
