import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { z } from 'zod';

const nonBlank = z.string().refine((value) => value.trim() !== '', 'must not be blank');

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
});

export type VoiceRecord = z.infer<typeof VoiceRecordSchema>;

const CastSchema = z.record(z.string(), nonBlank);

export type Appearance = { episode: string; role: string };

export type Voice = { slug: string; record: VoiceRecord; appearances: Appearance[] };

export type LoadRegistryResult = { ok: true; voices: Voice[] } | { ok: false; error: string };

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const parseFile = async <T>(path: string, schema: z.ZodType<T>): Promise<Parsed<T>> => {
  try {
    const parsed = schema.safeParse(JSON.parse(await readFile(path, 'utf8')));
    return parsed.success
      ? { ok: true, value: parsed.data }
      : { ok: false, error: `Invalid ${path}:\n${z.prettifyError(parsed.error)}` };
  } catch (error) {
    return { ok: false, error: `Cannot read ${path}: ${String(error)}` };
  }
};

const readCasts = async (root: string) => {
  const episodes = (await readdir(join(root, 'episodes'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const casts: { episode: string; cast: Parsed<Record<string, string>> }[] = [];
  for (const episode of episodes) {
    const path = join(root, 'episodes', episode, 'cast.json');
    const files = await readdir(join(root, 'episodes', episode));
    if (files.includes('cast.json')) {
      casts.push({ episode, cast: await parseFile(path, CastSchema) });
    }
  }
  return casts;
};

export const loadRegistry = async (root: string): Promise<LoadRegistryResult> => {
  const files = (await readdir(join(root, 'voices'))).filter((file) => file.endsWith('.json')).sort();
  const voices: Voice[] = [];
  for (const file of files) {
    const record = await parseFile(join(root, 'voices', file), VoiceRecordSchema);
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
