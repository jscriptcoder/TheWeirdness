import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getVoiceRecord, makeProject } from './test-support.ts';
import { formatRegistry, loadRegistry } from './voices.ts';

describe('loadRegistry', () => {
  it('lists every voice by slug with the roles it played, derived from episode casts', async () => {
    const mara = getVoiceRecord();
    const narrator = getVoiceRecord({ voice_id: 'QdMPtN6UaliUKoCqMvVS', name: 'The Weirdness v1' });
    const root = await makeProject({
      voices: { mara, 'the-weirdness-v1': narrator },
      casts: {
        '002-lighthouse': { KEEPER: 'mara', NARRATOR: 'the-weirdness-v1' },
        '001-universe-customer-support': { NARRATOR: 'the-weirdness-v1', MARA: 'mara' },
      },
    });

    const result = await loadRegistry(root);

    expect(result).toEqual({
      ok: true,
      voices: [
        {
          slug: 'mara',
          record: mara,
          appearances: [
            { episode: '001-universe-customer-support', role: 'MARA' },
            { episode: '002-lighthouse', role: 'KEEPER' },
          ],
        },
        {
          slug: 'the-weirdness-v1',
          record: narrator,
          appearances: [
            { episode: '001-universe-customer-support', role: 'NARRATOR' },
            { episode: '002-lighthouse', role: 'NARRATOR' },
          ],
        },
      ],
    });
  });

  it('keeps voices that no episode has cast yet, and ignores episodes without a cast', async () => {
    const root = await makeProject({ voices: { mara: getVoiceRecord() } });
    await mkdir(join(root, 'episodes', '003-unwritten'));

    const result = await loadRegistry(root);

    expect(result).toEqual({
      ok: true,
      voices: [{ slug: 'mara', record: getVoiceRecord(), appearances: [] }],
    });
  });

  it.each([
    ['has no prompt', { ...getVoiceRecord(), prompt: '' }],
    ['has an unknown status', { ...getVoiceRecord(), status: 'retired' }],
    ['has no voice_id', { ...getVoiceRecord(), voice_id: undefined }],
  ])('rejects a voice file that %s, naming the file', async (_, record) => {
    const root = await makeProject({ voices: { mara: record } });

    const result = await loadRegistry(root);

    expect(result).toEqual({ ok: false, error: expect.stringContaining(join('voices', 'mara.json')) });
  });

  it('rejects a cast that names a voice missing from the registry', async () => {
    const root = await makeProject({
      voices: { mara: getVoiceRecord() },
      casts: { '001-universe-customer-support': { MARA: 'mara', DANIEL: 'danial' } },
    });

    const result = await loadRegistry(root);

    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/001-universe-customer-support.*DANIEL.*"danial"/),
    });
  });
});

describe('formatRegistry', () => {
  it('shows each voice with its status, ID, full prompt, and appearances', () => {
    const text = formatRegistry([
      {
        slug: 'mara',
        record: getVoiceRecord({ notes: 'Approved in the pilot audition.' }),
        appearances: [{ episode: '001-universe-customer-support', role: 'MARA' }],
      },
      {
        slug: 'old-narrator',
        record: getVoiceRecord({ name: 'Old narrator', status: 'deleted' }),
        appearances: [],
      },
    ]);

    expect(text).toBe(
      [
        'mara — Mara [active] MatREvRtc5MgJoZ9A2cZ',
        '  Prompt: Native English, subtle southern British English accent. Female, 35-45.',
        '  Notes: Approved in the pilot audition.',
        '  Appears in: 001-universe-customer-support as MARA',
        '',
        'old-narrator — Old narrator [deleted] MatREvRtc5MgJoZ9A2cZ',
        '  Prompt: Native English, subtle southern British English accent. Female, 35-45.',
        '  Appears in: (none yet)',
      ].join('\n'),
    );
  });

  it('keeps every paragraph of a multi-paragraph prompt indented under its voice', () => {
    const text = formatRegistry([
      {
        slug: 'narrator',
        record: getVoiceRecord({ prompt: 'Male, 40–50.\n\nA warm baritone.' }),
        appearances: [],
      },
    ]);

    expect(text).toContain('  Prompt: Male, 40–50.\n\n          A warm baritone.\n');
  });
});
