# Casting and sound

How voices should sound, how to audition them, and how to treat sound design. The target experience, confirmed by the user, is relaxing, mysterious, absorbing, and engaging: "almost hypnotic".

## Casting a story

- **A narrator plus character voices.** One narrator alone wasn't engaging enough for the pilot. Keep narration calm and let the characters carry responsive dialogue and emotion.
- **Reuse before you design.** Voices are reusable actors. Check `npm run voices` for a voice whose description fits before designing a new one, since each saved voice uses a plan slot.
- **Make voices distinct.** Contrast pitch, texture, and pace so listeners can follow who's speaking without visual cues.
- **Avoid extra actors.** Minor voices, such as a recorded phone menu, can come from an existing cast member with different delivery.

## Writing voice prompts

ElevenLabs' [voice design prompting guide](https://elevenlabs.io/docs/eleven-creative/voices/voice-design#prompting-guide) shapes our prompts. The pilot prompts follow this pattern:

1. Language and accent, gender, age range, and "Studio quality".
2. Persona and emotional baseline.
3. Timbre, texture, articulation, and pacing.
4. What to avoid (for example: breathiness, melodrama, a presenter cadence).

The three pilot prompts in [`voices/`](../../voices) are working examples. Keep the full prompt in the voice record, since ElevenLabs keeps only about 500 characters of it. Use a real line from the character's script as the preview text.

## Narrator direction (proposed)

Intimate, intelligent, and wry: a storyteller who relishes the absurd and leans in for the strange details. Varied pace and pitch with deadpan timing, so it stays absorbing rather than sleepy. Comfortable volume; fully voiced, not whispered; natural, not theatrical. Avoid monotone delivery, sing-song rhythm, melodrama, and an announcer cadence.

The first narrator, [The Weirdness v1](../../voices/the-weirdness-v1.json), asked for a calm, smooth, steady delivery; the user found it "a bit boring". The pilot now uses [The Weirdness v2](../../voices/the-weirdness-v2.json), whose prompt asks for more variation ([decision #20](../decisions.md)).

Earlier labels such as "Midnight Storyteller", "Unreliable Witness", and "Cosmic Observer" were audition ideas, not saved voices.

## Auditioning

1. Pick a short exchange that uses every voice and includes some emotion and a revelation. For the pilot, that's passages 6–15.
2. Build and generate it: `npm run requests -- <script> --audition <from>-<to>`, then `npm run audition` or `npm run dialogue -- <episode>/api/audition-request.json`.
3. Listen on headphones at normal and low volume. Judge the voices together, not separately: naturalness, distinctness, timing, emotional restraint, mystery, and bedtime comfort.
4. Adjust casting or text before spending credits on the whole story.
5. Record the outcome, including the model used and any pronunciation quirks, in the episode's README.

## Sound design

- Restrained ambience (clocks, rooms, phone lines), unobtrusive music, and intentional silence.
- No loud stingers or sudden volume jumps. Keep loudness consistent across voices and scenes.
- Music must be original or properly licensed. For the pilot, the mother's five-note piano phrase, including its hesitation, still needs to be created.
- The audio carries the whole story; visuals only add atmosphere.
- No editor has been chosen for mixing and video. Studio was suggested for voice assignment, not as the final editor.
