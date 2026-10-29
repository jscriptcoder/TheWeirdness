import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach } from 'vitest';
import { VoiceRecordSchema, type VoiceRecord } from './voices.ts';

export const getVoiceRecord = (overrides?: Partial<VoiceRecord>): VoiceRecord =>
  VoiceRecordSchema.parse({
    voice_id: 'MatREvRtc5MgJoZ9A2cZ',
    name: 'Mara',
    prompt: 'Native English, subtle southern British English accent. Female, 35-45.',
    created: '2026-10-29',
    origin: 'elevenlabs-app',
    status: 'active',
    ...overrides,
  });

const workspaces: string[] = [];

afterEach(async () => {
  await Promise.all(workspaces.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

export const makeWorkspace = async () => {
  const dir = await mkdtemp(join(tmpdir(), 'weirdness-'));
  workspaces.push(dir);
  return dir;
};

type Project = {
  voices?: Record<string, unknown>;
  casts?: Record<string, unknown>;
  // Any other files, keyed by path relative to the project root.
  files?: Record<string, string>;
};

export const makeProject = async ({ voices = {}, casts = {}, files = {} }: Project) => {
  const root = await makeWorkspace();
  await mkdir(join(root, 'voices'));
  await mkdir(join(root, 'episodes'));
  for (const [slug, record] of Object.entries(voices)) {
    await writeFile(join(root, 'voices', `${slug}.json`), JSON.stringify(record));
  }
  for (const [episode, cast] of Object.entries(casts)) {
    await mkdir(join(root, 'episodes', episode), { recursive: true });
    await writeFile(join(root, 'episodes', episode, 'cast.json'), JSON.stringify(cast));
  }
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
};
