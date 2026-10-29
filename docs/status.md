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
| ffmpeg 9.0.2 installed on the user's machine (winget, `Gyan.FFmpeg`), for joining and measuring audio | `ffprobe` measured the audition takes: v3 32.48 s, v4 35.92 s |

## Next steps

1. **Settle the pilot's narrator.** The user isn't sure about The Weirdness v1 and may replace it (2026-10-29). Settle this before generating the full episode, so credits aren't spent on parts that would be regenerated. To replace it: write a draft in `voices/designs/` from the user's prompt, run `npm run voice:design`, listen, `npm run voice:save` the chosen preview, set `NARRATOR` in the pilot's `cast.json`, rebuild the requests with `npm run requests`, and re-run the audition. This would also be the first voice saved through the API, confirming the save call and whether ElevenLabs shortens saved descriptions.
2. **Build full-episode generation (pipeline step 4).** Generate every part, join them into one audio file with ffmpeg, and measure the runtime. The join should keep transitions smooth; see [ElevenLabs reference](reference/elevenlabs.md#text-to-dialogue). The code can be built and tested before the narrator is settled; only the paid generation waits.
3. **Generate the pilot, listen, and refine.** Fix delivery and pronunciation, and check the runtime fits about 10 minutes. Keep the instant hook, the human cost, and the unresolved final phone call.
4. **Sound and visuals.** Create or license the piano motif and ambience, choose an editor, then make the avatar, thumbnail, and video scenes.
5. **Plan a small follow-up slate and learn from release.** Cadence and audience metrics matter once the first production works.

## Open questions

These don't block preparation.

- Is The Weirdness v1 the pilot's narrator, or will it be replaced? (See next step 1.)
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
