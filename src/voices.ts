import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { z } from 'zod';
import { readJsonFile, type Result } from './json-file.ts';

const nonBlank = z.string().refine((value) => value.trim() !== '', 'must not be blank');

export const DesignModelSchema = z.enum(['eleven_multilingual_ttv_v2', 'eleven_ttv_v3']);

// One file per voice ever created. ElevenLabs keeps only ~500 characters of a
// voice's description, so the full design prompt lives here and nowhere else.
export const VoiceRecordSchema = z.object({
  voice_id: nonBlank,
  name: nonBlank,
  prompt: nonBlank,
  created: z.iso.date(),
  origin: z.enum(['elevenlabs-app', 'voice-design-api']),
  status: z.enum(['active', 'deleted']),
  notes: z.string().optional(),
  // How a voice designed through the API was made; app-made voices have no record of it.
  design: z
    .object({
      model_id: DesignModelSchema,
      preview_text: z.string(),
      seed: z.int().optional(),
    })
    .optional(),
});

export type VoiceRecord = z.infer<typeof VoiceRecordSchema>;

const CastSchema = z.record(z.string(), nonBlank);

export type Appearance = { episode: string; role: string };

export type Voice = { slug: string; record: VoiceRecord; appearances: Appearance[] };

export type LoadRegistryResult = { ok: true; voices: Voice[] } | { ok: false; error: string };

const readCasts = async (root: string) => {
  const episodes = (await readdir(join(root, 'episodes'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const casts: { episode: string; cast: Result<Record<string, string>> }[] = [];
  for (const episode of episodes) {
    const path = join(root, 'episodes', episode, 'cast.json');
    const files = await readdir(join(root, 'episodes', episode));
    if (files.includes('cast.json')) {
      casts.push({ episode, cast: await readJsonFile(path, CastSchema) });
    }
  }
  return casts;
};

export const loadRegistry = async (root: string): Promise<LoadRegistryResult> => {
  const files = (await readdir(join(root, 'voices'))).filter((file) => file.endsWith('.json')).sort();
  const voices: Voice[] = [];
  for (const file of files) {
    const record = await readJsonFile(join(root, 'voices', file), VoiceRecordSchema);
    if (!record.ok) {
      return record;
    }
    voices.push({ slug: basename(file, '.json'), record: record.value, appearances: [] });
  }

  const bySlug = new Map(voices.map((voice) => [voice.slug, voice]));
  for (const { episode, cast } of await readCasts(root)) {
    if (!cast.ok) {
      return cast;
    }
    for (const [role, slug] of Object.entries(cast.value)) {
      const voice = bySlug.get(slug);
      if (!voice) {
        return { ok: false, error: `Episode ${episode} casts ${role} as "${slug}", which is not in voices/.` };
      }
      voice.appearances.push({ episode, role });
    }
  }

  return { ok: true, voices };
};

const PROMPT_LABEL = '  Prompt: ';

// Continuation lines align under the first, so multi-paragraph prompts stay inside their voice.
const indentPrompt = (prompt: string) =>
  prompt
    .split('\n')
    .map((line) => (line === '' ? line : ' '.repeat(PROMPT_LABEL.length) + line))
    .join('\n')
    .trimStart();

const formatVoice = ({ slug, record, appearances }: Voice) =>
  [
    `${slug} — ${record.name} [${record.status}] ${record.voice_id}`,
    `${PROMPT_LABEL}${indentPrompt(record.prompt)}`,
    ...(record.notes ? [`  Notes: ${record.notes}`] : []),
    `  Appears in: ${
      appearances.length === 0
        ? '(none yet)'
        : appearances.map(({ episode, role }) => `${episode} as ${role}`).join(', ')
    }`,
  ].join('\n');

export const formatRegistry = (voices: Voice[]) => voices.map(formatVoice).join('\n\n');
