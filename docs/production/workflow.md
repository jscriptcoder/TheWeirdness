# Production workflow

How a story goes from a labelled script to audio. Each step names the command that does it; the [command reference](commands.md) lists every option and refusal.

Steps 1–4 are built. Step 5, generating and joining the full episode, is only partly built: you can generate one part at a time, but nothing joins them yet.

## Before you start

You need Node 22 or later and an ElevenLabs API key.

```sh
npm install
cp .env.example .env    # then set ELEVENLABS_API_KEY=... in .env
```

`.env` is gitignored; never commit the key or paste it into docs. The key needs these permissions (inferred from ElevenLabs' docs, see [reference](../reference/elevenlabs.md#api-key-permissions)):

| Permission | Needed for |
|---|---|
| Text to Speech | Generating dialogue audio |
| Voice Generation | Designing voice previews |
| Voices: Write | Saving a designed voice |

## The five steps for a new story

### 1. Write the script

Create `episodes/<number>-<short-title>/` and write the script with a speaker label on its own line before each passage:

```text
[NARRATOR]
The universe was being discontinued. Mara found out while trying to return a clock.

[DANIEL]
Continuity Services. For local causality, press one.
```

Labels are uppercase and are never spoken. Everything between two labels is one passage, and blank lines inside it are kept. A passage can be up to 2,000 characters. Follow the [story rules](../creative/vision.md) and ElevenLabs' [best practices](../reference/elevenlabs-best-practices.md) for text that performs well.

### 2. Cast every role

Check who's available:

```sh
npm run voices
```

This lists every voice with its full prompt, status, and the episodes and roles it has played. For each role, either reuse a voice whose description fits (voices are reusable actors; one can play different characters in different stories) or design a new one in step 3. The user approves the cast.

Then write `episodes/<episode>/cast.json`, mapping each role to a voice's file name in `voices/`:

```json
{
  "NARRATOR": "the-weirdness-v2",
  "MARA": "mara",
  "DANIEL": "daniel"
}
```

### 3. Design any new voices

Write a draft in `voices/designs/<voice-name>.json`. The voice name is lowercase words joined by hyphens.

```json
{
  "name": "The Archivist",
  "prompt": "Elderly man, 70s, dry and precise. ...",
  "preview_text": "A real line from this character's script, 100 to 1,000 characters long. ...",
  "model_id": "eleven_ttv_v3",
  "seed": 42
}
```

`model_id` (default `eleven_ttv_v3`) and `seed` are optional. Never invent a prompt for an existing voice; record only prompts the user supplied or the tool actually sent.

```sh
npm run voice:design -- archivist   # three previews in generated/voices/archivist/<timestamp>/
```

Listen to `preview-1.mp3` to `preview-3.mp3`. Designing costs credits for the preview text only. If none fits, edit the draft and design again; every run keeps its own folder. Then save the chosen preview soon afterwards (how long previews stay available isn't documented):

```sh
npm run voice:save -- archivist 2   # saves preview 2 of the latest run
```

This creates the voice in ElevenLabs (using one of the plan's voice slots) and writes `voices/archivist.json` with the full prompt. Commit that file.

### 4. Build the requests

```sh
npm run requests -- episodes/<episode>/dialogue.txt
```

This writes `api/requests/part-01.json`, `part-02.json`, and so on beside the script, each holding whole passages up to 2,000 characters. Commit them so they can be reviewed, but never edit them by hand: change the script or the cast and rebuild.

To audition a short exchange before spending credits on the whole story, pick a range of passages (counted from 1, inclusive):

```sh
npm run requests -- episodes/<episode>/dialogue.txt --audition 6-15
```

### 5. Generate and listen

```sh
npm run dialogue -- episodes/<episode>/api/audition-request.json
npm run dialogue -- episodes/<episode>/api/requests/part-01.json
```

Each run saves `generated/<request-name>-<UTC timestamp>.mp3` and never overwrites an earlier take. Start with the audition, listen on headphones at normal and low volume, and adjust the casting or the text before generating every part. The assistant can't hear audio, so the user's listening decides.

**Not built yet:** generating all parts in one go, joining them into one episode file, and measuring the runtime.

## Voice records

Every voice ever created has a file in [`voices/`](../../voices), named by its voice name. It holds the ElevenLabs voice ID and display name, the **full** design prompt, creation date, origin (`elevenlabs-app` or `voice-design-api`), status (`active` or `deleted`), optional notes, and, for voices designed by the tool, the design model, preview text, and seed.

- **The file is the only complete copy of the prompt.** ElevenLabs keeps only about the first 500 characters of a voice's description.
- **Which episodes a voice appeared in is worked out** from the episodes' `cast.json` files, not kept by hand.
- **Voice IDs and prompts aren't secrets** and are committed. The API key stays in `.env`.

### Retiring a voice

To free a slot, the user may delete a voice in ElevenLabs. Before doing so, finish the audio of every episode that uses it: once a voice is deleted, those episodes can't regenerate any section with it. Then set the record's `status` to `deleted` and keep the file. Its prompt and history stay useful, but re-designing from the same prompt gives a *similar*, not identical, voice. The request builder refuses any cast that uses a deleted voice.

## Manual alternative: ElevenLabs Studio

To work by hand instead, import the unlabelled text (for the pilot, `studio-text-v2.txt`) into Studio and [assign voices to text selections](https://elevenlabs.io/docs/help-center/product/studio/studio/how-can-i-change-the-voice-and-settings-across-multiple-paragraphs-in-studio), using the labelled script as the guide. Never paste speaker labels into a single-voice text field; they would be read aloud.
