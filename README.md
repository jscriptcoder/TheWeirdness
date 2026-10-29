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

[Voice assignments](episodes/001-universe-customer-support/api/voice-map.json) map the three roles to user-supplied voice IDs. A [short audition request](episodes/001-universe-customer-support/api/audition-request.json) and four ordered [full-story requests](episodes/001-universe-customer-support/api/requests) are prepared for the [Text to Dialogue API](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert).

The JSON files are API request bodies, not Studio imports. Each contains spoken text paired with its voice ID. No authenticated generation tool or audio assembler is included, and no generated audition audio is stored here.

ElevenLabs onboarding was attempted on 2026-10-29 but could not download the CLI because the execution environment refused the npm registry connection. Authentication and SDK installation remain unfinished.

## Visual references

[Avatar concept](assets/avatar-concept-01.png) and [alternative directions](assets/avatar-alternatives-sheet.png) are explorations. No final avatar is selected.

## Local files

Keep API keys in local environment configuration. `.gitignore` excludes environment files, dependency caches, and generated audio/video. Voice IDs identify selected voices and are not API credentials.
