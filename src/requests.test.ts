import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildRequests, writeRequests } from './requests.ts';
import { getVoiceRecord, makeProject } from './test-support.ts';
import type { Voice } from './voices.ts';

const EPISODE = '001-universe-customer-support';
const NARRATOR_ID = 'QdMPtN6UaliUKoCqMvVS';
const MARA_ID = 'MatREvRtc5MgJoZ9A2cZ';

const getVoice = (overrides?: Partial<Voice>): Voice => ({
  slug: 'mara',
  record: getVoiceRecord(),
  appearances: [{ episode: EPISODE, role: 'MARA' }],
  ...overrides,
});

const pilotVoices = (): Voice[] => [
  getVoice(),
  getVoice({
    slug: 'the-weirdness-v1',
    record: getVoiceRecord({ voice_id: NARRATOR_ID, name: 'The Weirdness v1' }),
    appearances: [{ episode: EPISODE, role: 'NARRATOR' }],
  }),
];

const passage = (role: string, text: string) => `[${role}]\n${text}\n`;

describe('buildRequests', () => {
  it("turns each labelled passage into an input voiced by the role's cast voice, in script order", () => {
    const script = [
      passage('NARRATOR', 'Mara stood very still.\n\nThen she spoke.'),
      passage('MARA', 'It isn\'t working.'),
      passage('NARRATOR', 'Daniel took a breath.'),
    ].join('\n');

    const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices() });

    expect(result).toEqual({
      ok: true,
      requests: [
        {
          inputs: [
            { text: 'Mara stood very still.\n\nThen she spoke.', voice_id: NARRATOR_ID },
            { text: 'It isn\'t working.', voice_id: MARA_ID },
            { text: 'Daniel took a breath.', voice_id: NARRATOR_ID },
          ],
        },
      ],
    });
  });

  it('starts a new request rather than exceed 2,000 characters, never splitting a passage', () => {
    const script = [
      passage('NARRATOR', 'a'.repeat(1000)),
      passage('MARA', 'b'.repeat(1000)),
      passage('NARRATOR', 'c'),
      passage('MARA', 'd'.repeat(1999)),
    ].join('\n');

    const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices() });

    expect(result).toEqual({
      ok: true,
      requests: [
        {
          inputs: [
            { text: 'a'.repeat(1000), voice_id: NARRATOR_ID },
            { text: 'b'.repeat(1000), voice_id: MARA_ID },
          ],
        },
        {
          inputs: [
            { text: 'c', voice_id: NARRATOR_ID },
            { text: 'd'.repeat(1999), voice_id: MARA_ID },
          ],
        },
      ],
    });
  });

  it('reads scripts saved with Windows line endings the same way', () => {
    const script = [passage('NARRATOR', 'One.\n\nTwo.'), passage('MARA', 'Three.')].join('\n');

    const result = buildRequests({ script: script.replaceAll('\n', '\r\n'), episode: EPISODE, voices: pilotVoices() });

    expect(result).toEqual(buildRequests({ script, episode: EPISODE, voices: pilotVoices() }));
  });

  it('refuses a role that the episode has not cast, naming the role and episode', () => {
    const script = [passage('NARRATOR', 'Hello.'), passage('DANIEL', 'Continuity Services.')].join('\n');

    const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices() });

    expect(result).toEqual({
      ok: false,
      error: `Passage 2 is spoken by DANIEL, who has no voice in episodes/${EPISODE}/cast.json.`,
    });
  });

  it('ignores casts from other episodes', () => {
    const voices = [getVoice({ appearances: [{ episode: '002-lighthouse', role: 'MARA' }] })];

    const result = buildRequests({ script: passage('MARA', 'Hello.'), episode: EPISODE, voices });

    expect(result).toEqual({ ok: false, error: expect.stringContaining('MARA, who has no voice') });
  });

  it('refuses a role cast with a voice marked deleted', () => {
    const voices = [getVoice({ record: getVoiceRecord({ status: 'deleted' }) })];

    const result = buildRequests({ script: passage('MARA', 'Hello.'), episode: EPISODE, voices });

    expect(result).toEqual({
      ok: false,
      error: 'MARA is cast as "mara", which is marked deleted in voices/mara.json. Recast the role.',
    });
  });

  it('accepts a passage of exactly 2,000 characters but refuses a longer one', () => {
    const fits = buildRequests({ script: passage('MARA', 'a'.repeat(2000)), episode: EPISODE, voices: pilotVoices() });
    const tooLong = buildRequests({
      script: [passage('MARA', 'Hello.'), passage('NARRATOR', 'a'.repeat(2001))].join('\n'),
      episode: EPISODE,
      voices: pilotVoices(),
    });

    expect(fits).toEqual({ ok: true, requests: [{ inputs: [{ text: 'a'.repeat(2000), voice_id: MARA_ID }] }] });
    expect(tooLong).toEqual({
      ok: false,
      error: 'Passage 2 (NARRATOR) has 2001 characters; split it so each passage has 2000 or fewer.',
    });
  });

  it.each([
    ['text before the first speaker label', `A stray line.\n\n${passage('MARA', 'Hello.')}`],
    ['no speaker labels at all', 'Just prose, no labels.\n'],
    ['nothing in it', ''],
  ])('refuses a script with %s', (_, script) => {
    const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices() });

    expect(result).toEqual({
      ok: false,
      error: 'The script must start with a speaker label such as [NARRATOR] on its own line.',
    });
  });

  it('refuses a passage with no text, naming it', () => {
    const script = [passage('MARA', 'Hello.'), '[NARRATOR]\n\n', passage('MARA', 'Bye.')].join('\n');

    const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices() });

    expect(result).toEqual({ ok: false, error: 'Passage 2 (NARRATOR) has no text.' });
  });

  it('allows blank lines before the first speaker label', () => {
    const result = buildRequests({ script: `\n\n${passage('MARA', 'Hello.')}`, episode: EPISODE, voices: pilotVoices() });

    expect(result).toEqual({ ok: true, requests: [{ inputs: [{ text: 'Hello.', voice_id: MARA_ID }] }] });
  });

  describe('with an excerpt for an audition', () => {
    const script = [
      passage('NARRATOR', 'One.'),
      passage('MARA', 'Two.'),
      passage('NARRATOR', 'Three.'),
      passage('MARA', 'Four.'),
    ].join('\n');

    it('returns only the chosen passages, counted from 1 and inclusive, as one request', () => {
      const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices(), excerpt: { from: 2, to: 3 } });

      expect(result).toEqual({
        ok: true,
        requests: [
          {
            inputs: [
              { text: 'Two.', voice_id: MARA_ID },
              { text: 'Three.', voice_id: NARRATOR_ID },
            ],
          },
        ],
      });
    });

    it('can be a single passage', () => {
      const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices(), excerpt: { from: 4, to: 4 } });

      expect(result).toEqual({ ok: true, requests: [{ inputs: [{ text: 'Four.', voice_id: MARA_ID }] }] });
    });

    it('can run from the first passage to the last', () => {
      const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices(), excerpt: { from: 1, to: 4 } });

      expect(result).toEqual(buildRequests({ script, episode: EPISODE, voices: pilotVoices() }));
    });

    it.each([
      { from: 0, to: 2 },
      { from: 3, to: 5 },
      { from: 3, to: 2 },
    ])('refuses passages $from-$to, which are not a range within the script', (excerpt) => {
      const result = buildRequests({ script, episode: EPISODE, voices: pilotVoices(), excerpt });

      expect(result).toEqual({
        ok: false,
        error: `Passages ${excerpt.from}-${excerpt.to} are not a range within the script, which has 4 passages.`,
      });
    });

    it('accepts an excerpt of exactly 2,000 characters but refuses a longer one', () => {
      const excerptOf = (lastLength: number) =>
        buildRequests({
          script: [passage('NARRATOR', 'a'.repeat(1000)), passage('MARA', 'b'.repeat(lastLength))].join('\n'),
          episode: EPISODE,
          voices: pilotVoices(),
          excerpt: { from: 1, to: 2 },
        });

      expect(excerptOf(1000)).toEqual({ ok: true, requests: [expect.anything()] });
      expect(excerptOf(1001)).toEqual({
        ok: false,
        error: 'Passages 1-2 have 2001 characters; an audition must fit in one request of 2000 or fewer.',
      });
    });
  });
});

describe('writeRequests', () => {
  const SCRIPT = [passage('NARRATOR', 'a'.repeat(1500)), passage('MARA', 'b'.repeat(1500))].join('\n');
  const episodeDir = (root: string) => join(root, 'episodes', EPISODE);

  const makePilot = (files: Record<string, string> = {}) =>
    makeProject({
      voices: {
        mara: getVoiceRecord(),
        'the-weirdness-v1': getVoiceRecord({ voice_id: NARRATOR_ID, name: 'The Weirdness v1' }),
      },
      casts: { [EPISODE]: { NARRATOR: 'the-weirdness-v1', MARA: 'mara' } },
      files: { [`episodes/${EPISODE}/dialogue.txt`]: SCRIPT, ...files },
    });

  it("writes numbered, formatted request files into the episode's api/requests, replacing old parts", async () => {
    const root = await makePilot({ [`episodes/${EPISODE}/api/requests/part-03.json`]: '{"stale":true}' });
    const requests = join(episodeDir(root), 'api', 'requests');

    const result = await writeRequests({ root, scriptFile: join(episodeDir(root), 'dialogue.txt') });

    expect(result).toEqual({
      ok: true,
      files: [
        { path: join(requests, 'part-01.json'), characters: 1500 },
        { path: join(requests, 'part-02.json'), characters: 1500 },
      ],
    });
    expect(await readdir(requests)).toEqual(['part-01.json', 'part-02.json']);
    expect(await readFile(join(requests, 'part-02.json'), 'utf8')).toBe(
      `${JSON.stringify({ inputs: [{ text: 'b'.repeat(1500), voice_id: MARA_ID }] }, null, 2)}\n`,
    );
  });

  it("writes an excerpt to the episode's api/audition-request.json", async () => {
    const root = await makePilot();
    const audition = join(episodeDir(root), 'api', 'audition-request.json');

    const result = await writeRequests({
      root,
      scriptFile: join(episodeDir(root), 'dialogue.txt'),
      excerpt: { from: 2, to: 2 },
    });

    expect(result).toEqual({ ok: true, files: [{ path: audition, characters: 1500 }] });
    expect(JSON.parse(await readFile(audition, 'utf8'))).toEqual({
      inputs: [{ text: 'b'.repeat(1500), voice_id: MARA_ID }],
    });
  });

  it('writes nothing when the script cannot be built', async () => {
    const root = await makePilot({
      [`episodes/${EPISODE}/dialogue.txt`]: passage('DANIEL', 'Hello.'),
      [`episodes/${EPISODE}/api/requests/part-01.json`]: '{"kept":true}',
    });
    const requests = join(episodeDir(root), 'api', 'requests');

    const result = await writeRequests({ root, scriptFile: join(episodeDir(root), 'dialogue.txt') });

    expect(result).toEqual({ ok: false, error: expect.stringContaining('DANIEL, who has no voice') });
    expect(await readdir(requests)).toEqual(['part-01.json']);
    expect(await readFile(join(requests, 'part-01.json'), 'utf8')).toBe('{"kept":true}');
  });

  it('reports a script it cannot read', async () => {
    const root = await makePilot();
    const scriptFile = join(episodeDir(root), 'missing.txt');

    const result = await writeRequests({ root, scriptFile });

    expect(result).toEqual({ ok: false, error: expect.stringContaining(`Cannot read script ${scriptFile}`) });
  });

  it('reports an invalid voice registry', async () => {
    const root = await makePilot({ 'voices/broken.json': '{}' });

    const result = await writeRequests({ root, scriptFile: join(episodeDir(root), 'dialogue.txt') });

    expect(result).toEqual({ ok: false, error: expect.stringContaining(join('voices', 'broken.json')) });
  });

  it("rebuilds the pilot's committed request files byte for byte from its script and cast", async () => {
    const pilot = join('episodes', EPISODE);
    const read = (path: string) => readFile(path, 'utf8');
    const voiceFiles = (await readdir('voices')).filter((file) => file.endsWith('.json'));
    const voices = await Promise.all(
      voiceFiles.map(async (file) => [file.replace(/\.json$/, ''), JSON.parse(await read(join('voices', file)))]),
    );
    const root = await makeProject({
      voices: Object.fromEntries(voices),
      casts: { [EPISODE]: JSON.parse(await read(join(pilot, 'cast.json'))) },
      files: { [join(pilot, 'dialogue-v2.txt')]: await read(join(pilot, 'dialogue-v2.txt')) },
    });
    const scriptFile = join(root, pilot, 'dialogue-v2.txt');

    await writeRequests({ root, scriptFile });
    await writeRequests({ root, scriptFile, excerpt: { from: 6, to: 15 } });

    const committed = await readdir(join(pilot, 'api', 'requests'));
    expect(await readdir(join(root, pilot, 'api', 'requests'))).toEqual(committed);
    // Git stores these files with LF; core.autocrlf may turn them into CRLF on checkout.
    const stored = async (path: string) => (await read(path)).replaceAll('\r\n', '\n');
    for (const file of [...committed.map((part) => join('requests', part)), 'audition-request.json']) {
      expect(await read(join(root, pilot, 'api', file)), file).toBe(await stored(join(pilot, 'api', file)));
    }
  });
});
