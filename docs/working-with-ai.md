# Working with AI assistants

Guidance for any AI model helping with *The Weirdness*. Claude Code loads the short version from [`CLAUDE.md`](../CLAUDE.md) automatically; this page holds the full guidance and a context paragraph to paste into other assistants.

## Ground rules

1. **Keep confirmed and proposed apart.** Separate what the user chose, what was proposed, what the user reported, and what was verified. Check [Decisions](decisions.md) before treating anything as settled.
2. **Preserve the vision:** dark, cosmic, philosophical, and absurd, with physics-inspired reality-breaking. It isn't generic horror.
3. **Respect the format:** about 10 minutes at most, an intriguing title, and a hook in the first five seconds, with no greeting, logo, or music before it.
4. **The pilot is written.** Read the [Episode 001 story bible](../episodes/001-universe-customer-support/README.md) and `dialogue-v2.txt` before revising. Don't produce another outline instead of advancing production.
5. **Keep the pilot's three roles.** The narrator is The Weirdness v2, which replaced v1 after the user found it "a bit boring". Don't recommend going back to a single narrator.
6. **You can't hear audio.** Never claim to know how a voice sounds. The user's listening decides.
7. **ElevenLabs is the chosen platform** and the user already pays for it. Check current docs before relying on a quota, limit, or model.
8. **Never invent a voice prompt.** Record only prompts the user supplied or the tool actually sent.
9. **Keep secrets out.** The API key lives only in the local `.env`. Voice IDs aren't secrets.
10. **Don't claim what hasn't happened**: a finished episode, an audio assembler, final casting, a completed voice clone, or a channel launch.
11. **Keep the docs current** in the same change as the work; see [Keeping these docs current](README.md#keeping-these-docs-current).

## Common tasks

| Task | Start from |
|---|---|
| Revise the pilot | `dialogue-v2.txt`. Make the same spoken changes in `studio-text-v2.txt`, rebuild the requests, and keep the story's [continuity cautions](../episodes/001-universe-customer-support/README.md#continuity-cautions). |
| Write a new story | [Vision](creative/vision.md), [Story ideas](creative/story-ideas.md), and [Science](creative/science.md); then the [workflow](production/workflow.md). |
| Cast or design voices | `npm run voices`, then [workflow step 3](production/workflow.md#3-design-any-new-voices) and [Casting and sound](production/casting-and-sound.md). |
| Test voices | A short audition of an exchange using every voice; see [Auditioning](production/casting-and-sound.md#auditioning). |
| Extend the tools | [Command reference](production/commands.md) and [ElevenLabs reference](reference/elevenlabs.md). Work test-first, one small step at a time. |
| Branding | [Brand and visuals](creative/brand-and-visuals.md). No avatar is final; check readability at a tiny circular crop. |

## Context to paste into another assistant

> I'm creating **The Weirdness**, an audio-first YouTube fiction anthology for bedtime, walks, and escaping ordinary life. Stories blend dark mystery, cosmic science fiction, philosophy, and absurd humour, often inspired by quantum mechanics and broken physical laws. Each story runs about **ten minutes or less**, has an immediately intriguing title, and hooks the listener in the **first five seconds**, before any branding. The pilot, **The Universe Has a Customer Support Department** (packaged as *I Called Customer Support. They Told Me My Universe Was Being Discontinued.*), is written in English, in the third person, for a narrator plus two characters, Mara and Daniel. Mara discovers she's a diagnostic process that became conscious and faces deletion; she files a report that she was classified as disposable equipment, accepting suspension with no guaranteed answer, and a telephone rings beyond the administrators' systems. I use **ElevenLabs**: three designed voices (narrator "The Weirdness v2", Mara, and Daniel) are recorded with their full prompts, and a short three-voice audition was excellent. A small TypeScript tool builds Text to Dialogue requests from the labelled script and cast, sends them, and designs and saves voices. The full episode has been generated with Eleven v4 and joined (about 7 min 45 s) but not yet approved, and nothing is published. Keep my confirmed choices separate from proposals, and help me move production forward.
