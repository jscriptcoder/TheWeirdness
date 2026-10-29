# Production workflow

How a story goes from a labelled script to audio. Each step names the command that does it; the [command reference](commands.md) lists every option and refusal.

Steps 1–4 are built. Step 5 is partly built: the tool generates one request at a time, and joining the parts into one file is done by hand with ffmpeg.

## Before you start

You need Node 22 or later, an ElevenLabs API key, and [ffmpeg](https://ffmpeg.org) for joining and measuring audio (on Windows: `winget install Gyan.FFmpeg`, then open a new shell).

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

Shape delivery with lowercase audio tags at the start of a sentence ([decision #21](../decisions.md)), for example `[dry, deadpan] I'll put that in the feedback.` Tags are sent as part of the text and count toward the 2,000 characters. A line holding only an uppercase bracket is read as a speaker label, so never write tags in capitals. The pilot's passages 6–15 are the worked example; see the [tagging style](../reference/elevenlabs-best-practices.md#emotion-and-delivery). If the story also gets an unlabelled `studio-text` file for manual work, keep tags out of it.

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

`model_id` (default `eleven_ttv_v3`) and `seed` are optional. The prompt comes from the user, or from an assistant **only when the user asks for one**, and the user approves it before any design run. Never invent or reconstruct a prompt for an existing voice; record only prompts the user supplied or the tool actually sent. The Weirdness v2's prompt is an example of one drafted on request ([decision #20](../decisions.md)).

```sh
npm run voice:design -- archivist   # three previews in generated/voices/archivist/<timestamp>/
```

Listen to `preview-1.mp3` to `preview-3.mp3`. Designing costs credits for the preview text only. If none fits, edit the draft and design again; every run keeps its own folder. Then save the chosen preview soon afterwards (how long previews stay available isn't documented):

```sh
npm run voice:save -- archivist 2   # saves preview 2 of the latest run
```

This creates the voice in ElevenLabs (using one of the plan's voice slots) and writes `voices/archivist.json` with the full prompt. Commit that file. The draft in `voices/designs/` can then be deleted: the record and `generated/voices/<voice-name>/<timestamp>/design.json` both hold what was sent.

### 4. Build the requests

```sh
npm run requests -- episodes/<episode>/dialogue.txt
```

This writes `api/requests/part-01.json`, `part-02.json`, and so on beside the script, each holding whole passages up to 2,000 characters. Commit them so they can be reviewed, but never edit them by hand: change the script or the cast and rebuild.

To audition a short exchange before spending credits on the whole story, pick a range of passages (counted from 1, inclusive):

```sh
npm run requests -- episodes/<episode>/dialogue.txt --audition 6-15
```

### 5. Generate, join, and listen

```sh
npm run dialogue -- episodes/<episode>/api/audition-request.json
npm run dialogue -- episodes/<episode>/api/requests/part-01.json
```

Each run saves `generated/<request-name>-<UTC timestamp>.mp3` and never overwrites an earlier take. Start with the audition, listen on headphones at normal and low volume, and adjust the casting or the text before generating every part. The assistant can't hear audio, so the user's listening decides.

Then join the parts by hand, in order, and measure the result. This is how the pilot's test episode was made:

```sh
ffmpeg -i generated/part-01-<stamp>.mp3 -i generated/part-02-<stamp>.mp3 \
  -filter_complex "concat=n=2:v=0:a=1" -c:a libmp3lame -b:a 192k \
  generated/episode-<number>-<stamp>.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 generated/episode-<number>-<stamp>.mp3
```

Add one `-i` per part and set `n=` to the number of parts. The parts are decoded and re-encoded deliberately: joining the MP3 streams directly (`-f concat -c copy`) gave timestamp errors at each join, which can click.

**Not built yet:** a command that generates every part and joins them in one go (pipeline step 4 in [Status](../status.md#next-steps)).

## Voice records

Every voice ever created has a file in [`voices/`](../../voices), named by its voice name. It holds the ElevenLabs voice ID and display name, the **full** design prompt, creation date, origin (`elevenlabs-app` or `voice-design-api`), status (`active` or `deleted`), optional notes, and, for voices designed by the tool, the design model, preview text, and seed.

- **The file is the only complete copy of the prompt for app-made voices.** ElevenLabs cut their stored descriptions to about 500 characters. Voices saved through `npm run voice:save` kept the full prompt (930 characters for The Weirdness v2), but the file stays the source of truth.
- **Which episodes a voice appeared in is worked out** from the episodes' `cast.json` files, not kept by hand.
- **Voice IDs and prompts aren't secrets** and are committed. The API key stays in `.env`.

### Retiring a voice

To free a slot, the user may delete a voice in ElevenLabs. Before doing so, finish the audio of every episode that uses it: once a voice is deleted, those episodes can't regenerate any section with it. Then set the record's `status` to `deleted` and keep the file. Its prompt and history stay useful, but re-designing from the same prompt gives a *similar*, not identical, voice. The request builder refuses any cast that uses a deleted voice.

## Manual alternative: ElevenLabs Studio

To work by hand instead, import the unlabelled text (for the pilot, `studio-text-v2.txt`) into Studio and [assign voices to text selections](https://elevenlabs.io/docs/help-center/product/studio/studio/how-can-i-change-the-voice-and-settings-across-multiple-paragraphs-in-studio), using the labelled script as the guide. Never paste speaker labels into a single-voice text field; they would be read aloud.
