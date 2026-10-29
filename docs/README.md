# The Weirdness documentation

Everything needed to write, voice, and produce *The Weirdness*, an audio-first YouTube fiction anthology. These pages replaced the single project handoff on 2026-10-29. Its earlier versions are in Git history as `The_Weirdness_Handoff.md`.

## Where to start

| If you want to… | Read |
|---|---|
| Know where the project stands and what's next | [Status](status.md) |
| Understand what the channel is and how its stories work | [Vision and story rules](creative/vision.md) |
| Write or revise the pilot | [Episode 001 story bible](../episodes/001-universe-customer-support/README.md) |
| Turn a script into audio | [Production workflow](production/workflow.md) |
| Look up a command's inputs, outputs, and refusals | [Command reference](production/commands.md) |
| Check what ElevenLabs allows and what we've verified | [ElevenLabs reference](reference/elevenlabs.md) |
| Continue the project as an AI assistant | [Working with AI assistants](working-with-ai.md) |

## All pages

**Current state and decisions**
- [Status](status.md): what's done, what's next, open questions. Dated.
- [Decisions](decisions.md): what the user confirmed, what remains a proposal, and what isn't decided yet.

**Creative**
- [Vision and story rules](creative/vision.md): pitch, audience, the core principle, the 10-minute and 5-second-hook rules, and listening-first rules.
- [Story ideas](creative/story-ideas.md): genre pillars, candidate titles, the physics collection, and the optional shared universe.
- [Science in the stories](creative/science.md): how to bend real physics honestly.
- [Brand and visuals](creative/brand-and-visuals.md): channel voice, description draft, intro and outro, art direction, avatars, and thumbnails.

**Episodes**
- [001: The Universe Has a Customer Support Department](../episodes/001-universe-customer-support/README.md)

**Production**
- [Production workflow](production/workflow.md): from a labelled script to audio, step by step, including how voices are tracked and reused.
- [Command reference](production/commands.md): every `npm run` command.
- [Casting and sound](production/casting-and-sound.md): performance direction, auditions, and sound design.

**Reference**
- [ElevenLabs reference](reference/elevenlabs.md): endpoints, limits, models, key permissions, and what we've confirmed live.
- [ElevenLabs text-to-speech best practices](reference/elevenlabs-best-practices.md): their guidance, applied to our stories.

## Keeping these docs current

Update the docs in the same change as the work they describe. Edit pages in place; Git keeps the history, so never create numbered copies.

| When this changes… | Update |
|---|---|
| A step is finished, or the next step changes | [Status](status.md) |
| The user confirms or reverses a choice | [Decisions](decisions.md), plus the page that owns the topic |
| A command, its options, or its refusals change | [Command reference](production/commands.md), and [workflow](production/workflow.md) if the steps change |
| Something about ElevenLabs is confirmed live or found to differ from its docs | [ElevenLabs reference](reference/elevenlabs.md) |
| An episode's script, cast, or audio status changes | That episode's `README.md` |
| A voice is created, retired, or re-cast | Its file in [`voices/`](../voices), and the episode's `cast.json` |

Keep the difference visible between what the user confirmed, what was proposed, and what was verified. Date any claim about current state (for example, "confirmed live on 2026-10-29").
