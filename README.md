# The Weirdness

Audio-first stories where ordinary lives collide with impossible realities.

The Weirdness blends cosmic science fiction, dark mystery, philosophy, and absurd humor. Episodes aim for roughly 7–10 minutes, with an immediate hook and a calm, immersive listening experience.

Start with the [project handoff](The_Weirdness_Handoff.md) for creative decisions, production status, and next steps. Update that single document in place; Git history preserves earlier versions.

## Pilot

**The Universe Has a Customer Support Department**

An accountant calls about a broken clock and learns her universe is being discontinued—and that she is classified as maintenance equipment.

| File | Use |
|---|---|
| [Three-voice script](episodes/001-universe-customer-support/dialogue-v2.txt) | Narrator, Mara, and Daniel passages, with nonspoken speaker labels |
| [Clean spoken text](episodes/001-universe-customer-support/studio-text-v2.txt) | Matching text for synthesis and manual voice assignment |
| [Casting notes](episodes/001-universe-customer-support/casting-v2.txt) | Voice assignments and performance directions |
| [Original narration](episodes/001-universe-customer-support/narration-v1.txt) | Earlier single-narrator draft |

## ElevenLabs preparation

The [cast](episodes/001-universe-customer-support/cast.json) assigns a voice from [`voices/`](voices) to each role. A [short audition request](episodes/001-universe-customer-support/api/audition-request.json) and four ordered [full-story requests](episodes/001-universe-customer-support/api/requests) are prepared for the [Text to Dialogue API](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert).

The JSON files are API request bodies, not Studio imports. Each contains spoken text paired with its voice ID. They are generated from the script and cast, so edit those and rebuild rather than editing the JSON:

```sh
npm run requests -- episodes/001-universe-customer-support/dialogue-v2.txt                    # api/requests/part-NN.json
npm run requests -- episodes/001-universe-customer-support/dialogue-v2.txt --audition 6-15    # api/audition-request.json
```

Each part holds whole passages up to 2,000 characters. The build refuses roles missing from `cast.json`, voices marked `deleted`, and passages that are empty or too long, and writes nothing when it refuses.

### Generating audio

Requires Node 22+.

```sh
npm install
cp .env.example .env   # then set ELEVENLABS_API_KEY in .env
npm run audition       # short three-voice audition
npm run dialogue -- episodes/001-universe-customer-support/api/requests/part-01.json
```

Each run saves `generated/<request-name>-<UTC timestamp>.mp3`. Missing keys, invalid request files, and requests over 2,000 characters are refused before anything is sent. `npm test` runs the tests against a fake API. No audio assembler is included yet, and no generated audio is stored here.

ElevenLabs onboarding was attempted on 2026-10-29 but could not download the CLI because the execution environment refused the npm registry connection. Authentication and SDK installation remain unfinished.

## Voices

Every voice created for the channel has a record in [`voices/`](voices): its ElevenLabs voice ID, display name, full design prompt, status and notes. ElevenLabs keeps only about 500 characters of a prompt, so these files are the complete record. Each episode's `cast.json` maps its script roles to voice records, and a voice can be reused across stories.

```sh
npm run voices   # list every voice, its prompt, and where it appears
```

## Visual references

[Avatar concept](assets/avatar-concept-01.png) and [alternative directions](assets/avatar-alternatives-sheet.png) are explorations. No final avatar is selected.

## Local files

Keep API keys in local environment configuration. `.gitignore` excludes environment files, dependency caches, and generated audio/video. Voice IDs identify selected voices and are not API credentials.
