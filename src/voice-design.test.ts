import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Fetch } from './elevenlabs.ts';
import { VoiceDesignSchema, designVoice, saveVoice, type VoiceDesign } from './voice-design.ts';
import { getVoiceRecord, makeProject } from './test-support.ts';
import { loadRegistry } from './voices.ts';

const SLUG = 'archivist';
const DESIGN_FILE = `voices/designs/${SLUG}.json`;
const NOW = () => new Date('2026-10-29T18:05:09.123Z');
const RUN = join('generated', 'voices', SLUG, '20261029-180509');

const getDesign = (overrides?: Partial<VoiceDesign>): VoiceDesign =>
  VoiceDesignSchema.parse({
    name: 'The Archivist',
    prompt: 'Elderly man, 70s, dry and precise. Speaks softly, as if every word is catalogued.',
    preview_text:
      'Every file in this building was once somebody. I keep them in order, because nobody else remembers that they were people.',
    model_id: 'eleven_ttv_v3',
    ...overrides,
  });

const audioOf = (preview: number) => new Uint8Array([0x49, 0x44, 0x33, preview]);

const previewsResponse = (count = 3) =>
  Response.json({
    previews: Array.from({ length: count }, (_, index) => ({
      audio_base_64: Buffer.from(audioOf(index + 1)).toString('base64'),
      generated_voice_id: `gen-${index + 1}`,
      media_type: 'audio/mpeg',
      duration_secs: 7.5,
      language: 'en',
    })),
    text: 'whatever ElevenLabs echoes back',
  });

type SentRequest = { url: string; init: RequestInit };

const fakeElevenLabs = (respond: () => Response = () => previewsResponse()) => {
  const sent: SentRequest[] = [];
  const fetch: Fetch = async (url, init) => {
    sent.push({ url, init });
    return respond();
  };
  return { fetch, sent };
};

const makeStudio = (design: unknown = getDesign(), voices: Record<string, unknown> = {}) =>
  makeProject({ voices, files: { [DESIGN_FILE]: JSON.stringify(design) } });

describe('designVoice', () => {
  it('asks ElevenLabs for previews of the draft voice and saves each one to listen to', async () => {
    const root = await makeStudio(getDesign({ seed: 42 }));
    const api = fakeElevenLabs();

    const result = await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: api.fetch, now: NOW });

    const run = join(root, RUN);
    expect(result).toEqual({
      ok: true,
      previews: [1, 2, 3].map((n) => join(run, `preview-${n}.mp3`)),
    });
    for (const n of [1, 2, 3]) {
      expect(new Uint8Array(await readFile(join(run, `preview-${n}.mp3`)))).toEqual(audioOf(n));
    }
    expect(api.sent).toHaveLength(1);
    expect(api.sent[0]?.url).toBe('https://api.elevenlabs.io/v1/text-to-voice/design?output_format=mp3_44100_128');
    expect(api.sent[0]?.init.method).toBe('POST');
    expect(api.sent[0]?.init.headers).toEqual({ 'xi-api-key': 'test-key', 'Content-Type': 'application/json' });
    expect(JSON.parse(String(api.sent[0]?.init.body))).toEqual({
      voice_description: getDesign().prompt,
      text: getDesign().preview_text,
      model_id: 'eleven_ttv_v3',
      seed: 42,
    });
  });

  it('designs with eleven_ttv_v3 and no fixed seed unless the draft says otherwise', async () => {
    const { model_id: _, ...draft } = getDesign();
    const root = await makeStudio(draft);
    const api = fakeElevenLabs();

    await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: api.fetch, now: NOW });

    expect(JSON.parse(String(api.sent[0]?.init.body))).toEqual({
      voice_description: getDesign().prompt,
      text: getDesign().preview_text,
      model_id: 'eleven_ttv_v3',
    });
  });

  describe('refuses before spending credits', () => {
    const attempt = async (options: { root: string; apiKey?: string | undefined }) => {
      const api = fakeElevenLabs();
      const result = await designVoice({
        root: options.root,
        slug: SLUG,
        apiKey: 'apiKey' in options ? options.apiKey : 'test-key',
        fetch: api.fetch,
        now: NOW,
      });
      return { result, sent: api.sent };
    };

    it.each([undefined, '', '  '])('when the API key is %j', async (apiKey) => {
      const { result, sent } = await attempt({ root: await makeStudio(), apiKey });

      expect(result).toEqual({ ok: false, error: expect.stringContaining('ELEVENLABS_API_KEY') });
      expect(sent).toEqual([]);
    });

    it('when there is no draft for the voice', async () => {
      const { result, sent } = await attempt({ root: await makeProject({}) });

      expect(result).toEqual({ ok: false, error: expect.stringContaining(join('voices', 'designs', `${SLUG}.json`)) });
      expect(sent).toEqual([]);
    });

    it('when a voice with that name already exists', async () => {
      const { result, sent } = await attempt({ root: await makeStudio(getDesign(), { [SLUG]: getVoiceRecord() }) });

      expect(result).toEqual({
        ok: false,
        error: `voices/${SLUG}.json already exists. Choose another name for the new voice.`,
      });
      expect(sent).toEqual([]);
    });

    it.each([
      ['a prompt under 20 characters', { prompt: 'p'.repeat(19) }],
      ['a prompt over 1,000 characters', { prompt: 'p'.repeat(1001) }],
      ['preview text under 100 characters', { preview_text: 't'.repeat(99) }],
      ['preview text over 1,000 characters', { preview_text: 't'.repeat(1001) }],
      ['a blank name', { name: ' ' }],
      ['an unknown model', { model_id: 'eleven_v3' }],
      ['a negative seed', { seed: -1 }],
      ['a fractional seed', { seed: 1.5 }],
      ['a seed above 2147483647', { seed: 2147483648 }],
      ['an unrecognised field', { loudnes: 0.2 }],
    ])('when the draft has %s', async (_, overrides) => {
      const { result, sent } = await attempt({ root: await makeStudio({ ...getDesign(), ...overrides }) });

      expect(result).toEqual({ ok: false, error: expect.stringMatching(/^Invalid .*archivist\.json:\n/) });
      expect(sent).toEqual([]);
    });
  });

  it.each([
    ['a prompt of exactly 20 characters', { prompt: 'p'.repeat(20) }],
    ['a prompt of exactly 1,000 characters', { prompt: 'p'.repeat(1000) }],
    ['preview text of exactly 100 characters', { preview_text: 't'.repeat(100) }],
    ['preview text of exactly 1,000 characters', { preview_text: 't'.repeat(1000) }],
    ['the smallest seed', { seed: 0 }],
    ['the largest seed', { seed: 2147483647 }],
  ])('accepts a draft with %s', async (_, overrides) => {
    const root = await makeStudio({ ...getDesign(), ...overrides });
    const api = fakeElevenLabs();

    const result = await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: api.fetch, now: NOW });

    expect(result).toEqual({ ok: true, previews: expect.any(Array) });
  });

  it.each([
    ['an HTTP error', () => new Response('{"detail":"quota_exceeded"}', { status: 401 }), 'ElevenLabs returned HTTP 401: {"detail":"quota_exceeded"}'],
    ['an unexpected response', () => Response.json({ previews: [] }), 'Unexpected response from ElevenLabs'],
  ])('reports %s and saves nothing', async (_, respond, error) => {
    const root = await makeStudio();
    const api = fakeElevenLabs(respond);

    const result = await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: api.fetch, now: NOW });

    expect(result).toEqual({ ok: false, error: expect.stringContaining(error) });
    expect(existsSync(join(root, 'generated'))).toBe(false);
  });

  it('reports a network failure', async () => {
    const root = await makeStudio();
    const fetch: Fetch = async () => {
      throw new TypeError('fetch failed');
    };

    const result = await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch, now: NOW });

    expect(result).toEqual({ ok: false, error: 'Could not reach ElevenLabs: TypeError: fetch failed' });
  });

  it('keeps every design run separately', async () => {
    const root = await makeStudio();
    const api = fakeElevenLabs();

    await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: api.fetch, now: NOW });
    await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: api.fetch, now: () => new Date('2026-10-30T09:00:00Z') });

    expect(await readdir(join(root, 'generated', 'voices', SLUG))).toEqual(['20261029-180509', '20261030-090000']);
  });
});

describe('saveVoice', () => {
  const savedResponse = () => Response.json({ voice_id: 'NewVoiceId0123456789', name: 'The Archivist' });
  const LATER = () => new Date('2026-10-31T10:00:00Z');

  const designed = async (design: VoiceDesign = getDesign()) => {
    const root = await makeStudio(design);
    await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: fakeElevenLabs().fetch, now: NOW });
    return root;
  };

  it('saves the chosen preview as a voice and records it in the registry with its full prompt', async () => {
    const root = await designed(getDesign({ seed: 42 }));
    const api = fakeElevenLabs(savedResponse);

    const result = await saveVoice({ root, slug: SLUG, preview: 2, apiKey: 'test-key', fetch: api.fetch, now: LATER });

    expect(result).toEqual({ ok: true, voiceFile: join(root, 'voices', `${SLUG}.json`), voiceId: 'NewVoiceId0123456789' });
    expect(api.sent).toHaveLength(1);
    expect(api.sent[0]?.url).toBe('https://api.elevenlabs.io/v1/text-to-voice');
    expect(api.sent[0]?.init.headers).toEqual({ 'xi-api-key': 'test-key', 'Content-Type': 'application/json' });
    expect(JSON.parse(String(api.sent[0]?.init.body))).toEqual({
      voice_name: 'The Archivist',
      voice_description: getDesign().prompt,
      generated_voice_id: 'gen-2',
    });
    expect(await loadRegistry(root)).toEqual({
      ok: true,
      voices: [
        {
          slug: SLUG,
          appearances: [],
          record: {
            voice_id: 'NewVoiceId0123456789',
            name: 'The Archivist',
            prompt: getDesign().prompt,
            created: '2026-10-31',
            origin: 'voice-design-api',
            status: 'active',
            design: { model_id: 'eleven_ttv_v3', preview_text: getDesign().preview_text, seed: 42 },
          },
        },
      ],
    });
  });

  it('records the prompt the previews were designed from, even if the draft changed afterwards', async () => {
    const root = await designed();
    await writeFile(join(root, DESIGN_FILE), JSON.stringify(getDesign({ prompt: 'A completely different voice, rewritten later.' })));

    await saveVoice({ root, slug: SLUG, preview: 1, apiKey: 'test-key', fetch: fakeElevenLabs(savedResponse).fetch, now: LATER });

    const saved = JSON.parse(await readFile(join(root, 'voices', `${SLUG}.json`), 'utf8'));
    expect(saved.prompt).toBe(getDesign().prompt);
  });

  it('chooses from the most recent design run', async () => {
    const root = await designed();
    const secondRun = fakeElevenLabs(() =>
      Response.json({ previews: [{ audio_base_64: 'SUQz', generated_voice_id: 'newer-1' }], text: 'x' }),
    );
    await designVoice({ root, slug: SLUG, apiKey: 'test-key', fetch: secondRun.fetch, now: LATER });
    const api = fakeElevenLabs(savedResponse);

    await saveVoice({ root, slug: SLUG, preview: 1, apiKey: 'test-key', fetch: api.fetch, now: LATER });

    expect(JSON.parse(String(api.sent[0]?.init.body))).toEqual(expect.objectContaining({ generated_voice_id: 'newer-1' }));
  });

  describe('refuses before sending anything', () => {
    const attempt = async (root: string, options: { preview?: number; apiKey?: string | undefined } = {}) => {
      const api = fakeElevenLabs(savedResponse);
      const result = await saveVoice({
        root,
        slug: SLUG,
        preview: options.preview ?? 1,
        apiKey: 'apiKey' in options ? options.apiKey : 'test-key',
        fetch: api.fetch,
        now: LATER,
      });
      return { result, sent: api.sent };
    };

    it.each([undefined, ''])('when the API key is %j', async (apiKey) => {
      const { result, sent } = await attempt(await designed(), { apiKey });

      expect(result).toEqual({ ok: false, error: expect.stringContaining('ELEVENLABS_API_KEY') });
      expect(sent).toEqual([]);
    });

    it('when the voice has not been designed yet', async () => {
      const { result, sent } = await attempt(await makeStudio());

      expect(result).toEqual({
        ok: false,
        error: `There are no previews for ${SLUG} yet. Run npm run voice:design -- ${SLUG} first.`,
      });
      expect(sent).toEqual([]);
    });

    it.each([0, 4, 1.5])('when preview %d is not one of the previews', async (preview) => {
      const { result, sent } = await attempt(await designed(), { preview });

      expect(result).toEqual({
        ok: false,
        error: expect.stringMatching(/^There is no preview \S+ in the latest design\. Choose 1-3 from .*20261029-180509$/),
      });
      expect(sent).toEqual([]);
    });

    it('when the voice has already been saved', async () => {
      const root = await designed();
      await writeFile(join(root, 'voices', `${SLUG}.json`), JSON.stringify(getVoiceRecord()));

      const { result, sent } = await attempt(root);

      expect(result).toEqual({
        ok: false,
        error: `voices/${SLUG}.json already exists. Choose another name for the new voice.`,
      });
      expect(sent).toEqual([]);
    });
  });

  it.each([
    ['an HTTP error', () => new Response('{"detail":"voice_limit_reached"}', { status: 400 }), 'ElevenLabs returned HTTP 400: {"detail":"voice_limit_reached"}'],
    ['a response without a voice ID', () => Response.json({ name: 'The Archivist' }), 'Unexpected response from ElevenLabs'],
  ])('reports %s and records nothing', async (_, respond, error) => {
    const root = await designed();

    const result = await saveVoice({ root, slug: SLUG, preview: 1, apiKey: 'test-key', fetch: fakeElevenLabs(respond).fetch, now: LATER });

    expect(result).toEqual({ ok: false, error: expect.stringContaining(error) });
    expect(existsSync(join(root, 'voices', `${SLUG}.json`))).toBe(false);
  });
});

describe('voice names', () => {
  it.each(['../escape', 'Archivist', 'old archivist', 'archivist-', ''])(
    'refuses %j before reading or sending anything',
    async (slug) => {
      const root = await makeStudio();
      const api = fakeElevenLabs();
      const options = { root, slug, apiKey: 'test-key', fetch: api.fetch, now: NOW };

      const results = [await designVoice(options), await saveVoice({ ...options, preview: 1 })];

      const error = `Voice name "${slug}" must be lowercase words joined by hyphens, such as old-archivist.`;
      expect(results).toEqual([
        { ok: false, error },
        { ok: false, error },
      ]);
      expect(api.sent).toEqual([]);
    },
  );

  it('accepts lowercase words and digits joined by hyphens', async () => {
    const root = await makeProject({ files: { 'voices/designs/old-archivist-2.json': JSON.stringify(getDesign()) } });

    const result = await designVoice({ root, slug: 'old-archivist-2', apiKey: 'test-key', fetch: fakeElevenLabs().fetch, now: NOW });

    expect(result).toEqual({ ok: true, previews: expect.any(Array) });
  });
});
