# Status

**As of 2026-10-29.** Update this page whenever a step finishes or the plan changes.

The pilot is written and cast, with a new narrator, The Weirdness v2. Its full audio has been generated and joined into one 7 min 45 s file as a test; the user likes the new narrator and says the story overall sounds good. Tools turn a script into ElevenLabs requests and design and save voices; joining the parts was done by hand with ffmpeg. Nothing has been published.

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
| New narrator, The Weirdness v2, designed and saved through the API (the user found v1 "a bit boring") | [Decisions #20](decisions.md), [`voices/the-weirdness-v2.json`](../voices/the-weirdness-v2.json) |
| Full pilot generated with Eleven v4 (four parts) and joined with ffmpeg: 464.8 s, about 7 min 45 s | [Episode 001: audio status](../episodes/001-universe-customer-support/README.md#audio-status) |
| User listened to the full test episode: "I like the new narrator. The story overall sounds good." Not final approval: the user called it "just a test". | [Decisions #20](decisions.md) |
| Audio tags tested on the pilot audition (passages 6–15) and kept by the user | [Decisions #21](decisions.md), [Episode 001: audio status](../episodes/001-universe-customer-support/README.md#audio-status) |
| ffmpeg 9.0.2 installed on the user's machine (winget, `Gyan.FFmpeg`), for joining and measuring audio | `ffprobe` measured the audition takes: v3 32.48 s, v4 35.92 s |

## Next steps

1. **Tag the rest of the pilot.** Passages 6–15 have audio tags ([decision #21](decisions.md)); the rest of `dialogue-v2.txt` doesn't yet. Draft tags for the user to review, then regenerate and listen to the full episode. Keep the instant hook, the human cost, and the unresolved final phone call. The untagged runtime was 7 min 45 s; tags slowed the audition by about 9%, so expect roughly 8.5 minutes, still inside the 10-minute limit.
2. **Build full-episode generation (pipeline step 4).** Turn the by-hand steps into a command: generate every part, join them with ffmpeg, and measure the runtime. Consider the continuity options so transitions stay smooth; see [ElevenLabs reference](reference/elevenlabs.md#text-to-dialogue).
3. **Sound and visuals.** Create or license the piano motif and ambience, choose an editor, then make the avatar, thumbnail, and video scenes.
4. **Plan a small follow-up slate and learn from release.** Cadence and audience metrics matter once the first production works.

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

Final script sign-off, full-episode audio approval, mixing, music, video, thumbnails, channel handle, publication, monetisation, and audience data.
