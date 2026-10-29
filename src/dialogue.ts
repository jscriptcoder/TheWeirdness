import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { z } from 'zod';
import { API, post, requireApiKey, type Fetch } from './elevenlabs.ts';

const ENDPOINT = `${API}/text-to-dialogue?output_format=mp3_44100_128`;

// ElevenLabs recommends at most 2,000 characters across all passages per request;
// longer requests may stop early or be rejected after spending credits.
export const MAX_CHARACTERS = 2000;

const nonBlank = z.string().refine((value) => value.trim() !== '', 'must not be blank');

// Loose so optional API fields (model_id, seed, settings, ...) pass through to ElevenLabs.
export const DialogueRequestSchema = z.looseObject({
  inputs: z.array(z.looseObject({ text: nonBlank, voice_id: nonBlank })).min(1),
});

export type DialogueRequest = z.infer<typeof DialogueRequestSchema>;

// The limit counts the text of every passage; voice IDs and settings are free.
export const countCharacters = (inputs: DialogueRequest['inputs']) =>
  inputs.reduce((total, input) => total + input.text.length, 0);

export type GenerateDialogueOptions = {
  requestFile: string;
  outputDir: string;
  apiKey: string | undefined;
  fetch: Fetch;
  now: () => Date;
};

export type GenerateDialogueResult =
  | { ok: true; audioFile: string; characters: number }
  | { ok: false; error: string };

const failure = (error: string): GenerateDialogueResult => ({ ok: false, error });

// Windows forbids colons in file names, so ISO timestamps are compacted.
export const takeStamp = (date: Date) =>
  date.toISOString().slice(0, 19).replaceAll('-', '').replaceAll(':', '').replace('T', '-');

const readJson = async (path: string): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> => {
  try {
    return { ok: true, value: JSON.parse(await readFile(path, 'utf8')) };
  } catch (error) {
    return { ok: false, error: `Cannot read request file ${path}: ${String(error)}` };
  }
};

export const generateDialogue = async (
  options: GenerateDialogueOptions,
): Promise<GenerateDialogueResult> => {
  const apiKey = requireApiKey(options.apiKey);
  if (!apiKey.ok) {
    return apiKey;
  }

  const json = await readJson(options.requestFile);
  if (!json.ok) {
    return failure(json.error);
  }

  const parsed = DialogueRequestSchema.safeParse(json.value);
  if (!parsed.success) {
    return failure(`Invalid dialogue request in ${options.requestFile}:\n${z.prettifyError(parsed.error)}`);
  }

  const request = parsed.data;
  const characters = countCharacters(request.inputs);
  if (characters > MAX_CHARACTERS) {
    return failure(
      `Request has ${characters} characters; split it to ${MAX_CHARACTERS} or fewer per request.`,
    );
  }

  const response = await post({
    fetch: options.fetch,
    apiKey: apiKey.value,
    url: ENDPOINT,
    body: request,
    read: async (body) => new Uint8Array(await body.arrayBuffer()),
  });
  if (!response.ok) {
    return response;
  }

  const name = basename(options.requestFile, extname(options.requestFile));
  const audioFile = join(options.outputDir, `${name}-${takeStamp(options.now())}.mp3`);
  await mkdir(options.outputDir, { recursive: true });
  await writeFile(audioFile, response.value);

  return { ok: true, audioFile, characters };
};
