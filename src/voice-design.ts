import { existsSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { takeStamp } from './dialogue.ts';
import { API, post, readJsonBody, requireApiKey, type Fetch } from './elevenlabs.ts';
import { readJsonFile, type Result } from './json-file.ts';
import { DesignModelSchema, VoiceRecordSchema, type VoiceRecord } from './voices.ts';

const DESIGN_ENDPOINT = `${API}/text-to-voice/design?output_format=mp3_44100_128`;
const SAVE_ENDPOINT = `${API}/text-to-voice`;
const RUN_FILE = 'design.json';

// Limits are ElevenLabs' own (OpenAPI VoiceDesignRequestModel), checked here so a bad
// draft is refused before any credits are spent.
export const VoiceDesignSchema = z.strictObject({
  name: VoiceRecordSchema.shape.name,
  prompt: z.string().min(20).max(1000),
  preview_text: z.string().min(100).max(1000),
  model_id: DesignModelSchema.default('eleven_ttv_v3'),
  seed: z.int().min(0).max(2147483647).optional(),
});

export type VoiceDesign = z.infer<typeof VoiceDesignSchema>;

// What a design run actually sent, so saving records the prompt behind the previews
// even if the draft is edited afterwards.
const DesignRunSchema = VoiceDesignSchema.extend({ previews: z.array(z.string()).min(1) });

const SavedVoiceResponseSchema = z.object({ voice_id: z.string().min(1) });

const PreviewsResponseSchema = z.object({
  previews: z.array(z.object({ audio_base_64: z.string(), generated_voice_id: z.string() })).min(1),
});

export type DesignVoiceOptions = {
  root: string;
  slug: string;
  apiKey: string | undefined;
  fetch: Fetch;
  now: () => Date;
};

export type DesignVoiceResult = { ok: true; previews: string[] } | { ok: false; error: string };

// The name becomes a file name in voices/, so it is kept to a safe, readable shape.
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const checkSlug = (slug: string): Result<string> =>
  SLUG.test(slug)
    ? { ok: true, value: slug }
    : { ok: false, error: `Voice name "${slug}" must be lowercase words joined by hyphens, such as old-archivist.` };

const slugTaken = (slug: string) => `voices/${slug}.json already exists. Choose another name for the new voice.`;

export const designVoice = async ({ root, slug, apiKey, fetch, now }: DesignVoiceOptions): Promise<DesignVoiceResult> => {
  const validSlug = checkSlug(slug);
  if (!validSlug.ok) {
    return validSlug;
  }
  const key = requireApiKey(apiKey);
  if (!key.ok) {
    return key;
  }
  if (existsSync(join(root, 'voices', `${slug}.json`))) {
    return { ok: false, error: slugTaken(slug) };
  }
  const design = await readJsonFile(join(root, 'voices', 'designs', `${slug}.json`), VoiceDesignSchema);
  if (!design.ok) {
    return design;
  }

  const { prompt, preview_text, model_id, seed } = design.value;
  const response = await post({
    fetch,
    apiKey: key.value,
    url: DESIGN_ENDPOINT,
    body: { voice_description: prompt, text: preview_text, model_id, ...(seed === undefined ? {} : { seed }) },
    read: readJsonBody,
  });
  if (!response.ok) {
    return response;
  }
  const parsed = PreviewsResponseSchema.safeParse(response.value);
  if (!parsed.success) {
    return { ok: false, error: `Unexpected response from ElevenLabs:\n${z.prettifyError(parsed.error)}` };
  }

  const run = join(root, 'generated', 'voices', slug, takeStamp(now()));
  await mkdir(run, { recursive: true });
  const previews = await Promise.all(
    parsed.data.previews.map(async (preview, index) => {
      const file = join(run, `preview-${index + 1}.mp3`);
      await writeFile(file, Buffer.from(preview.audio_base_64, 'base64'));
      return file;
    }),
  );
  const record = { ...design.value, previews: parsed.data.previews.map((preview) => preview.generated_voice_id) };
  await writeFile(join(run, RUN_FILE), `${JSON.stringify(record, null, 2)}\n`);
  return { ok: true, previews };
};

export type SaveVoiceOptions = DesignVoiceOptions & { preview: number };

export type SaveVoiceResult = { ok: true; voiceFile: string; voiceId: string } | { ok: false; error: string };

const latestRun = async (root: string, slug: string): Promise<string | undefined> => {
  const runs = join(root, 'generated', 'voices', slug);
  if (!existsSync(runs)) {
    return undefined;
  }
  // Run folders are UTC timestamps, so the last in sorted order is the newest.
  const latest = (await readdir(runs)).sort().at(-1);
  return latest === undefined ? undefined : join(runs, latest);
};

export const saveVoice = async ({ root, slug, preview, apiKey, fetch, now }: SaveVoiceOptions): Promise<SaveVoiceResult> => {
  const validSlug = checkSlug(slug);
  if (!validSlug.ok) {
    return validSlug;
  }
  const key = requireApiKey(apiKey);
  if (!key.ok) {
    return key;
  }
  const voiceFile = join(root, 'voices', `${slug}.json`);
  if (existsSync(voiceFile)) {
    return { ok: false, error: slugTaken(slug) };
  }
  const runDir = await latestRun(root, slug);
  if (runDir === undefined) {
    return { ok: false, error: `There are no previews for ${slug} yet. Run npm run voice:design -- ${slug} first.` };
  }
  const run = await readJsonFile(join(runDir, RUN_FILE), DesignRunSchema);
  if (!run.ok) {
    return run;
  }
  const { previews, name, prompt, preview_text, model_id, seed } = run.value;
  const generatedVoiceId = Number.isInteger(preview) ? previews[preview - 1] : undefined;
  if (generatedVoiceId === undefined) {
    return {
      ok: false,
      error: `There is no preview ${preview} in the latest design. Choose 1-${previews.length} from ${runDir}`,
    };
  }

  const response = await post({
    fetch,
    apiKey: key.value,
    url: SAVE_ENDPOINT,
    body: { voice_name: name, voice_description: prompt, generated_voice_id: generatedVoiceId },
    read: readJsonBody,
  });
  if (!response.ok) {
    return response;
  }
  const saved = SavedVoiceResponseSchema.safeParse(response.value);
  if (!saved.success) {
    return { ok: false, error: `Unexpected response from ElevenLabs:\n${z.prettifyError(saved.error)}` };
  }

  const record: VoiceRecord = VoiceRecordSchema.parse({
    voice_id: saved.data.voice_id,
    name,
    prompt,
    created: now().toISOString().slice(0, 10),
    origin: 'voice-design-api',
    status: 'active',
    design: { model_id, preview_text, ...(seed === undefined ? {} : { seed }) },
  });
  await writeFile(voiceFile, `${JSON.stringify(record, null, 2)}\n`);
  return { ok: true, voiceFile, voiceId: saved.data.voice_id };
};
