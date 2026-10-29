# Command reference

Every `npm run` command in this repository. Run them from the repository root. Commands that call ElevenLabs read `ELEVENLABS_API_KEY` from the environment or from a local `.env` file.

All commands use the same exit codes:

| Exit code | Meaning |
|---|---|
| `0` | Success |
| `1` | Refused or failed; the reason is printed. Nothing was written, and no credits were spent on a refusal. |
| `2` | Wrong arguments; the usage line is printed. |

| Command | Calls ElevenLabs | Costs |
|---|---|---|
| [`npm run voices`](#npm-run-voices) | No | Nothing |
| [`npm run requests`](#npm-run-requests) | No | Nothing |
| [`npm run dialogue`](#npm-run-dialogue) / [`npm run audition`](#npm-run-audition) | Yes | Credits for the request's characters |
| [`npm run voice:design`](#npm-run-voicedesign) | Yes | Credits for the preview text |
| [`npm run voice:save`](#npm-run-voicesave) | Yes | One voice slot |
| `npm test`, `npm run test:watch`, `npm run typecheck` | No | Nothing; tests use a fake API |

## `npm run voices`

```sh
npm run voices
```

Lists every voice in `voices/` with its status, ElevenLabs ID, full prompt, notes, and the episodes and roles it has appeared in (from each episode's `cast.json`).

Fails if a voice file is invalid, naming the file, or if a cast names a voice that isn't in `voices/`.

## `npm run requests`

```sh
npm run requests -- <script.txt>
npm run requests -- <script.txt> --audition <from>-<to>
```

Turns a `[ROLE]`-labelled script into Text to Dialogue request files. The script's folder is the episode; its `cast.json` and the voice records supply the voice IDs.

| Mode | Writes |
|---|---|
| No `--audition` | `<episode>/api/requests/part-01.json`, `part-02.json`, … Each holds whole passages, up to 2,000 characters in total. Old `part-*.json` files are removed first. |
| `--audition 6-15` | `<episode>/api/audition-request.json`: passages 6 to 15, counted from 1 and inclusive, as one request. |

Every request names the dialogue model, `"model_id": "eleven_v4"` (see [decision #19](../decisions.md)), so rebuilding never changes the model silently. It prints each file written and its character count. Windows and Unix line endings are read the same way.

**Refuses, writing nothing, when:**
- text appears before the first speaker label, or there are no labels;
- a passage is empty, or longer than 2,000 characters;
- a role has no voice in the episode's `cast.json`;
- a role's voice is marked `deleted`;
- the audition range is outside the script, or its passages total more than 2,000 characters.

## `npm run dialogue`

```sh
npm run dialogue -- <request.json>
```

Sends one request file, unchanged, to `POST /v1/text-to-dialogue` (128 kbps MP3) and saves the audio as `generated/<request-name>-<UTC timestamp>.mp3`. Takes never overwrite each other.

Optional API fields in the request file, such as `model_id` or `seed`, are passed through. Files built by `npm run requests` set `model_id` to `eleven_v4`; a file without `model_id` gets ElevenLabs' default, `eleven_v3`.

**Refuses before sending when:** the key is missing; the file can't be read or isn't JSON; it has no passages, or a passage lacks text or a voice ID; or the passages total more than 2,000 characters.

**Fails, saving nothing, when:** ElevenLabs returns an error (the status and body are printed) or can't be reached.

## `npm run audition`

```sh
npm run audition
```

Shortcut for `npm run dialogue -- episodes/001-universe-customer-support/api/audition-request.json`.

## `npm run voice:design`

```sh
npm run voice:design -- <voice-name>
```

Reads the draft `voices/designs/<voice-name>.json` and asks `POST /v1/text-to-voice/design` for previews. Saves them in a new folder, `generated/voices/<voice-name>/<UTC timestamp>/`:

- `preview-1.mp3`, `preview-2.mp3`, `preview-3.mp3`;
- `design.json`, recording exactly what was sent and each preview's ID.

Draft fields:

| Field | Required | Rule |
|---|---|---|
| `name` | Yes | Display name in ElevenLabs; not blank |
| `prompt` | Yes | 20–1,000 characters |
| `preview_text` | Yes | 100–1,000 characters; ideally a real line for the role |
| `model_id` | No | `eleven_ttv_v3` (default) or `eleven_multilingual_ttv_v2` |
| `seed` | No | Whole number from 0 to 2,147,483,647 |

Any other field is refused, so typos are caught.

**Refuses before sending when:** the key is missing; the voice name isn't lowercase words joined by hyphens; `voices/<voice-name>.json` already exists; or the draft is missing or breaks a rule above.

## `npm run voice:save`

```sh
npm run voice:save -- <voice-name> <preview-number>
```

Saves preview *n* from the **latest** design run with `POST /v1/text-to-voice`, then writes `voices/<voice-name>.json`. The record is `active`, dated today, with origin `voice-design-api`. It holds the prompt actually used for the previews, even if the draft was edited afterwards, plus the model, preview text, and seed.

**Refuses before sending when:** the key is missing; the voice name is invalid; `voices/<voice-name>.json` already exists; there's no design run yet; or the latest run has no preview with that number.

**Fails, writing nothing, when:** ElevenLabs returns an error or a response without a voice ID.

## Development

| Command | Does |
|---|---|
| `npm test` | Runs every test once (Vitest), against a fake ElevenLabs API |
| `npm run test:watch` | Re-runs tests as files change |
| `npm run typecheck` | Type-checks with TypeScript in strict mode |

Code lives in `src/`: one module per command, plus its test file.
