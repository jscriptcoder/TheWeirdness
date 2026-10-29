# Status

**As of 2026-10-29.** Update this page whenever a step finishes or the plan changes.

The pilot is written and its three voices are cast and approved in a short audition. Tools turn a script into ElevenLabs requests and design new voices. The full episode hasn't been generated or assembled yet, and nothing has been published.

## Done

| What | Evidence |
|---|---|
| Channel concept, story rules, and brand drafts | [Vision](creative/vision.md), [Brand and visuals](creative/brand-and-visuals.md) |
| Pilot script, single-narrator and three-voice versions | [Episode 001](../episodes/001-universe-customer-support/README.md) |
| Three voices designed in the ElevenLabs app and recorded with their full prompts | [`voices/`](../voices), `npm run voices` |
| Short three-voice audition generated and approved by the user ("This is excellent.") | [Episode 001: audition](../episodes/001-universe-customer-support/README.md#audio-status) |
| Request files built from the script and cast, identical to the earlier hand-made ones | `npm run requests`; [commands](production/commands.md#npm-run-requests) |
| Dialogue model chosen: Eleven v4, preferred by the user over v3 on the audition | [Decisions #19](decisions.md) |
| Voice design tool; first live design succeeded (nothing saved) | `npm run voice:design`; [ElevenLabs reference](reference/elevenlabs.md#confirmed-live) |

## Next steps

1. **Design the first real voice.** Use it for the next story's cast. Saving it will confirm the save call and whether ElevenLabs shortens saved descriptions.
2. **Build full-episode generation (pipeline step 4).** Generate every part, join them into one audio file, and measure the runtime. The join should keep transitions smooth; see [ElevenLabs reference](reference/elevenlabs.md#text-to-dialogue).
3. **Generate the pilot, listen, and refine.** Fix delivery and pronunciation, and check the runtime fits about 10 minutes. Keep the instant hook, the human cost, and the unresolved final phone call.
4. **Sound and visuals.** Create or license the piano motif and ambience, choose an editor, then make the avatar, thumbnail, and video scenes.
5. **Plan a small follow-up slate and learn from release.** Cadence and audience metrics matter once the first production works.

## Open questions

These don't block preparation.

- Full-episode performance approval, synthesis settings, and measured runtime. (The model is decided: Eleven v4.)
- Was the user's own-voice sample recorded or cloned, and is it related to The Weirdness v1?
- Language and accent policy beyond the current English script and British casting.
- Design model and preview text used for the three app-made voices (not recorded; the API doesn't return them).
- The voice-slot limit on the user's ElevenLabs plan, and when to delete voices.
- Whether the API key has a credit limit, and whether a separate voice-design key is wanted.
- Final avatar, editor, music and sound-effect sources, upload cadence, and publication date.
- Point of view per story, how strictly physics counterfactuals must follow their one broken rule, the optional science postscript, and how much shared-universe continuity to use.

## Not started

Final script sign-off, full-episode audio, mixing, music, video, thumbnails, channel handle, publication, monetisation, and audience data.
