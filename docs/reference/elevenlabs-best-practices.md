# ElevenLabs text-to-speech best practices, applied

A summary of ElevenLabs' [text-to-speech best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) and what they mean for *The Weirdness*. It was read on 2026-10-29; check the source for current details and examples. This page summarises rather than copies it.

Our dialogue model, Eleven v4 (`eleven_v4`), like v3 before it, is prompted with the text itself: its words, punctuation, and audio tags. Older SSML controls don't apply to them.

## Pauses and pacing

- **No `<break>` tags.** Eleven v3 and v4 don't support SSML break tags.
- **Use punctuation and structure.** Ellipses (…) add a pause and weight; dashes give a short break; sentence length and paragraphing shape rhythm.
- **Speed setting:** in Text to Speech's voice settings, `speed` ranges from 0.7 to 1.2 (default 1.0), and extreme values can hurt quality. Whether Text to Dialogue's `settings` offer it is unchecked. Prefer writing the pace into the text.
- **A voice's natural pace comes from how it was made.** If a designed voice runs too fast, re-design rather than fighting it with settings.

**For us:** the narrator's "brief, purposeful pauses" come from punctuation and short paragraphs, not markup. Ellipses suit hesitation, which matters for the mother's piano passage.

## Emotion and delivery

- **Audio tags** in square brackets direct delivery: for example `[whispers]`, `[sighs]`, `[curious]`, `[sarcastic]`, or descriptive ones like `[quiet, reflective narration]`. v4 follows them more reliably than v3.
- **Be explicit.** A vague tag can be read as a sound effect (v4 also generates effects), so describe the voice quality, such as `[low, steady voice]`.
- **Match tags to the voice.** A calm narrator won't shout convincingly; a serious voice may ignore playful tags.
- **Narrative context works too** ("she asked, her voice trembling"), but the model will speak those words.
- **Capitals add emphasis.** Use them sparingly.

**For us:** tags could add restraint and timing, for example `[quietly]` or `[dry]` for Daniel's administrative lines, without changing the spoken words. Write tags in lowercase inside a passage, such as `[quietly] Thursday, seven fourteen.`, and they're sent to ElevenLabs as part of the text. A line holding only an uppercase bracket, such as `[PAUSE]`, is read as a speaker label, and the build refuses it as an uncast role. **Test tags in an audition before using them across a story**, and keep them out of `studio-text` files meant for manual work. The pilot's passages 6–15 show the style the user kept ([decision #21](../decisions.md)): short voice-quality phrases such as `[dry, deadpan]` or `[gently, with reluctant sympathy]`, at most two per passage, and none where the text already implies the action ("Daniel took a breath."). Tags count toward the 2,000-character limit.

## Pronunciation and text normalisation

- Numbers, dates, times, currencies, abbreviations, and URLs can be misread. Spell them as they should be spoken ("seven fourteen", not "7:14"). The pilot already does this.
- With v4, IPA between slashes (`/ˈmɑːrə/`) can fix a name. Test with the actual voice.
- Pronunciation dictionaries handle repeated names in Studio and through the API; Text to Dialogue accepts them as `pronunciation_dictionary_locators`.

**For us:** spell out every number and abbreviation in scripts, and note any word a voice mispronounces in the episode's README.

## Multi-speaker dialogue

- Give each speaker a distinct voice. Dialogue models handle conversation, interruptions (dashes), and overlapping timing.
- Short reactive lines between speakers keep a scene lively.

**For us:** this is what Text to Dialogue does with our labelled passages. Keep each passage a natural spoken unit; don't split one sentence across passages.

## Models

ElevenLabs calls Eleven v4 a "net upgrade" over v3 in almost every case, with better voice accuracy and tag-following. The user compared v3 and v4 takes of the pilot audition and chose v4 ([decision #19](../decisions.md)), so every request we build uses it. The v4 guidance above applies directly to our scripts.

## Practical habits

- Iterate: rephrase, retag, and regenerate short sections rather than whole episodes.
- Generate long material in parts and join them afterwards. This is our 2,000-character rule.
- Remove any spoken stage directions in editing if they slip through.
