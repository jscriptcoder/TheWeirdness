import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { MAX_CHARACTERS, countCharacters, type DialogueRequest } from './dialogue.ts';
import type { Result } from './json-file.ts';
import { loadRegistry, type Voice } from './voices.ts';

// Passage numbers count from 1 and include both ends.
export type Excerpt = { from: number; to: number };

export type BuildRequestsOptions = {
  script: string;
  episode: string;
  voices: Voice[];
  // When given, only these passages are returned, as a single request.
  excerpt?: Excerpt;
};

export type BuildRequestsResult = { ok: true; requests: DialogueRequest[] } | { ok: false; error: string };

type Passage = { number: number; role: string; text: string };

const LABEL = /^\[([A-Z0-9_ -]+)\]$/gm;

const parseScript = (script: string): Result<Passage[]> => {
  // split() with a capture group alternates [before, role, text, role, text, ...].
  const [before = '', ...pieces] = script.replaceAll('\r\n', '\n').split(LABEL);
  if (before.trim() !== '' || pieces.length === 0) {
    return { ok: false, error: 'The script must start with a speaker label such as [NARRATOR] on its own line.' };
  }
  const passages: Passage[] = [];
  for (let index = 0; index < pieces.length; index += 2) {
    passages.push({ number: index / 2 + 1, role: pieces[index] ?? '', text: (pieces[index + 1] ?? '').trim() });
  }
  return { ok: true, value: passages };
};

// Whole passages only: a passage cut mid-sentence would change the performance.
const pack = (inputs: DialogueRequest['inputs']): DialogueRequest[] =>
  inputs.reduce<DialogueRequest[]>((requests, input) => {
    const last = requests.at(-1);
    return last && countCharacters(last.inputs) + input.text.length <= MAX_CHARACTERS
      ? [...requests.slice(0, -1), { inputs: [...last.inputs, input] }]
      : [...requests, { inputs: [input] }];
  }, []);

const castOf = (episode: string, voices: Voice[]) =>
  new Map(
    voices.flatMap((voice) =>
      voice.appearances
        .filter((appearance) => appearance.episode === episode)
        .map((appearance) => [appearance.role, voice] as const),
    ),
  );

const toInput = (
  { number, role, text }: Passage,
  episode: string,
  cast: Map<string, Voice>,
): Result<DialogueRequest['inputs'][number]> => {
  const voice = cast.get(role);
  if (!voice) {
    return { ok: false, error: `Passage ${number} is spoken by ${role}, who has no voice in episodes/${episode}/cast.json.` };
  }
  if (voice.record.status === 'deleted') {
    return {
      ok: false,
      error: `${role} is cast as "${voice.slug}", which is marked deleted in voices/${voice.slug}.json. Recast the role.`,
    };
  }
  if (text === '') {
    return { ok: false, error: `Passage ${number} (${role}) has no text.` };
  }
  if (text.length > MAX_CHARACTERS) {
    return {
      ok: false,
      error: `Passage ${number} (${role}) has ${text.length} characters; split it so each passage has ${MAX_CHARACTERS} or fewer.`,
    };
  }
  return { ok: true, value: { text, voice_id: voice.record.voice_id } };
};

const cut = (inputs: DialogueRequest['inputs'], { from, to }: Excerpt): BuildRequestsResult => {
  if (from < 1 || to > inputs.length || from > to) {
    return {
      ok: false,
      error: `Passages ${from}-${to} are not a range within the script, which has ${inputs.length} passages.`,
    };
  }
  const chosen = inputs.slice(from - 1, to);
  const total = countCharacters(chosen);
  if (total > MAX_CHARACTERS) {
    return {
      ok: false,
      error: `Passages ${from}-${to} have ${total} characters; an audition must fit in one request of ${MAX_CHARACTERS} or fewer.`,
    };
  }
  return { ok: true, requests: [{ inputs: chosen }] };
};

export const buildRequests = ({ script, episode, voices, excerpt }: BuildRequestsOptions): BuildRequestsResult => {
  const passages = parseScript(script);
  if (!passages.ok) {
    return passages;
  }
  const cast = castOf(episode, voices);
  const inputs: DialogueRequest['inputs'] = [];
  for (const passage of passages.value) {
    const input = toInput(passage, episode, cast);
    if (!input.ok) {
      return input;
    }
    inputs.push(input.value);
  }
  return excerpt ? cut(inputs, excerpt) : { ok: true, requests: pack(inputs) };
};

export type WriteRequestsOptions = {
  root: string;
  scriptFile: string;
  excerpt?: Excerpt;
};

export type WrittenFile = { path: string; characters: number };

export type WriteRequestsResult = { ok: true; files: WrittenFile[] } | { ok: false; error: string };

const PART = /^part-\d+\.json$/;

const format = (request: DialogueRequest) => `${JSON.stringify(request, null, 2)}\n`;

const readScript = async (path: string): Promise<Result<string>> => {
  try {
    return { ok: true, value: await readFile(path, 'utf8') };
  } catch (error) {
    return { ok: false, error: `Cannot read script ${path}: ${String(error)}` };
  }
};

// The episode is the script's folder; its cast and request files live beside the script.
export const writeRequests = async ({ root, scriptFile, excerpt }: WriteRequestsOptions): Promise<WriteRequestsResult> => {
  const registry = await loadRegistry(root);
  if (!registry.ok) {
    return registry;
  }
  const script = await readScript(scriptFile);
  if (!script.ok) {
    return script;
  }
  const episodeDir = dirname(scriptFile);
  const built = buildRequests({
    script: script.value,
    episode: basename(episodeDir),
    voices: registry.voices,
    ...(excerpt ? { excerpt } : {}),
  });
  if (!built.ok) {
    return built;
  }

  const apiDir = join(episodeDir, 'api');
  const requestsDir = join(apiDir, 'requests');
  const pathOf = (index: number) =>
    excerpt
      ? join(apiDir, 'audition-request.json')
      : join(requestsDir, `part-${String(index + 1).padStart(2, '0')}.json`);

  if (!excerpt) {
    await mkdir(requestsDir, { recursive: true });
    const stale = (await readdir(requestsDir)).filter((file) => PART.test(file));
    await Promise.all(stale.map((file) => rm(join(requestsDir, file))));
  }
  await mkdir(apiDir, { recursive: true });
  const files = await Promise.all(
    built.requests.map(async (request, index) => {
      const path = pathOf(index);
      await writeFile(path, format(request));
      return { path, characters: countCharacters(request.inputs) };
    }),
  );
  return { ok: true, files };
};
