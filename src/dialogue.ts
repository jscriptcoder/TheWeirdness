import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { z } from 'zod';

const ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128';

// ElevenLabs recommends at most 2,000 characters across all passages per request;
// longer requests may stop early or be rejected after spending credits.
const MAX_CHARACTERS = 2000;

const nonBlank = z.string().refine((value) => value.trim() !== '', 'must not be blank');

// Loose so optional API fields (model_id, seed, settings, ...) pass through to ElevenLabs.
export const DialogueRequestSchema = z.looseObject({
  inputs: z.array(z.looseObject({ text: nonBlank, voice_id: nonBlank })).min(1),
});

export type DialogueRequest = z.infer<typeof DialogueRequestSchema>;

export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

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
const takeStamp = (date: Date) =>
  date.toISOString().slice(0, 19).replaceAll('-', '').replaceAll(':', '').replace('T', '-');

const readJson = async (path: string): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> => {
  try {
    return { ok: true, value: JSON.parse(await readFile(path, 'utf8')) };
  } catch (error) {
    return { ok: false, error: `Cannot read request file ${path}: ${String(error)}` };
  }
};

const send = async (
  fetch: Fetch,
  apiKey: string,
  request: DialogueRequest,
): Promise<{ ok: true; audio: Uint8Array } | { ok: false; error: string }> => {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      return { ok: false, error: `ElevenLabs returned HTTP ${response.status}: ${await response.text()}` };
    }
    return { ok: true, audio: new Uint8Array(await response.arrayBuffer()) };
  } catch (error) {
    return { ok: false, error: `Could not reach ElevenLabs: ${String(error)}` };
  }
};

export const generateDialogue = async (
  options: GenerateDialogueOptions,
): Promise<GenerateDialogueResult> => {
  const apiKey = options.apiKey?.trim();
  if (!apiKey) {
    return failure('ELEVENLABS_API_KEY is not set. Add it to your environment or a local .env file.');
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
  const characters = request.inputs.reduce((total, input) => total + input.text.length, 0);
  if (characters > MAX_CHARACTERS) {
    return failure(
      `Request has ${characters} characters; split it to ${MAX_CHARACTERS} or fewer per request.`,
    );
  }

  const response = await send(options.fetch, apiKey, request);
  if (!response.ok) {
    return failure(response.error);
  }

  const name = basename(options.requestFile, extname(options.requestFile));
  const audioFile = join(options.outputDir, `${name}-${takeStamp(options.now())}.mp3`);
  await mkdir(options.outputDir, { recursive: true });
  await writeFile(audioFile, response.audio);

  return { ok: true, audioFile, characters };
};
