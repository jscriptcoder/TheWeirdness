# Decisions

What the user has confirmed, what remains a proposal, and what hasn't been decided. Add new decisions with their date, and mark superseded ones rather than silently rewriting them.

## Confirmed by the user

| # | Decision | Confirmed |
|---|---|---|
| 1 | The channel is called **The Weirdness**. | Before 2026-10-27 (not dated) |
| 2 | Stories should be weird, entertaining, and deeply engaging. | Before 2026-10-27 (not dated) |
| 3 | YouTube is the platform, optimised for **listening** rather than watching. | Before 2026-10-27 (not dated) |
| 4 | Listening contexts: falling asleep, jogging or walking, and mentally disconnecting. | Before 2026-10-27 (not dated) |
| 5 | The genre mix is **dark, cosmic, philosophical, and absurd**. | Before 2026-10-27 (not dated) |
| 6 | Quantum mechanics, fundamental physics, and reality-breaking premises are a genuine passion to keep central. | Before 2026-10-27 (not dated) |
| 7 | Each story is **about 10 minutes or shorter**, ideally 7–10, to lower the commitment for new listeners. | 2026-10-27 |
| 8 | Every title must be **immediately intriguing**: an unsettling contradiction, impossible event, or curiosity gap. | 2026-10-27 |
| 9 | The **first few seconds must hook** the listener. No warm-up or preliminary explanation. | 2026-10-27 |
| 10 | **ElevenLabs** is the voice platform. The user pays for an entry-level plan; don't suggest signing up again. | 2026-10-28 |
| 11 | The voice experience should be relaxing, mysterious, absorbing, and engaging: "almost hypnotic". | 2026-10-29 |
| 12 | One narrator wasn't engaging enough. The pilot uses **a narrator plus two character voices**. Don't default back to a single narrator. | 2026-10-29 |
| 13 | Voices: Narrator `QdMPtN6UaliUKoCqMvVS` (The Weirdness v1), Daniel `I3zRwk5thDbzYVt0LM9j`, Mara `MatREvRtc5MgJoZ9A2cZ`. Their prompts are recorded in [`voices/`](../voices). The narrator remains a working candidate, not a final lock; the user isn't sure about it and may replace it before the full episode is generated. | 2026-10-29 |
| 14 | The short three-voice audition is approved ("This is excellent."). This is not sign-off on the full episode. | 2026-10-29 |
| 15 | **Automate stories and voices.** For each new story, every role either reuses an existing voice or gets a new one designed from a prompt. Every voice and its prompt is tracked. | 2026-10-29 |
| 16 | **Voices are reusable actors.** A voice can play different characters in different stories when its description fits. The user may delete voices from ElevenLabs to free slots. | 2026-10-29 |
| 17 | The user wants their own voice among the candidates. A reading passage was supplied; recording and cloning are unconfirmed. | 2026-10-29 |
| 18 | Documentation lives in `docs/` as readable pages, kept current as the project progresses. This supersedes the earlier rule of a single handoff file. | 2026-10-29 |
| 19 | Dialogue uses **Eleven v4** (`eleven_v4`). The user compared v4 and v3 takes of the pilot audition and preferred v4. `npm run requests` writes the model into every request. | 2026-10-29 |

## Proposals, not final

1. **Narration direction:** intimate, intelligent, mildly conspiratorial, with restrained humour and natural variation. The relaxing, mysterious goal is confirmed; these descriptors are direction to audition.
2. **Story shape:** hook, then grounded world, escalation, revelation, and a resonant ending.
3. **Sonic ident:** three soft descending notes, a short silence, then "Welcome to The Weirdness. Reality is optional here." It must never delay the opening hook.
4. **"The Science Behind the Weirdness":** an optional 30–60-second segment after the story, separate from the fiction.
5. **Connected anthology:** rare recurring clues across standalone stories. See [Story ideas](creative/story-ideas.md#optional-shared-universe-continuity-services).
6. **Visual style:** cinematic cosmic noir; see [Brand and visuals](creative/brand-and-visuals.md).
7. **Point of view:** flexible first or third person per story. The user hasn't chosen.
8. **Physics strictness:** prefer grounded departures. The user hasn't said how rigorously each story must follow its one altered rule.
9. **Brand lines:** "Reality is optional here.", "One broken law. Infinite consequences.", "Reality is optional. Curiosity isn't.", and "Stories from somewhere that shouldn't exist." All were received positively; none is final.
10. **Early cadence:** an optional 90-day experiment. Establish the pilot and a repeatable workflow first, then publish and measure.

## Superseded

- Runtimes of 12–20 or 18–22 minutes were replaced by the 10-minute rule (#7).
- A branded intro before the story was replaced by the hook-first rule (#9).
- The single handoff file (`The_Weirdness_Handoff.md`) was replaced by `docs/` (#18).
- ElevenLabs' default dialogue model, `eleven_v3`, used for the first audition, was replaced by Eleven v4 (#19).

## Not decided yet

Final voices and performance, synthesis settings beyond the model, accent and language policy, channel handle, final avatar and style guide, upload cadence, budget, script sign-off, editor, music licensing, thumbnails, publication date, and monetisation.
