# ElevenLabs reference

What we rely on from ElevenLabs, where each fact comes from, and what we've confirmed on the live API. Recheck the linked docs before relying on a limit; they change.

The project calls the HTTP API directly (`https://api.elevenlabs.io/v1`) with the `xi-api-key` header. No SDK is used. The user has a paid entry-level plan; its exact quotas and slot limit aren't known.

## Endpoints we use

| Endpoint | Used by | Key facts |
|---|---|---|
| [`POST /v1/text-to-dialogue`](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert) | `npm run dialogue` | Ordered `inputs` of `text` + `voice_id`; at most 10 different voices per request; default model `eleven_v3` |
| [`POST /v1/text-to-voice/design`](https://elevenlabs.io/docs/api-reference/text-to-voice/design) | `npm run voice:design` | Returns previews, each with `generated_voice_id` and base64 audio; charged for the preview text |
| [`POST /v1/text-to-voice`](https://elevenlabs.io/docs/api-reference/text-to-voice/create) | `npm run voice:save` | Turns a `generated_voice_id` into a permanent voice; returns `voice_id`; uses one voice slot |
| [`GET /v1/voices/{voice_id}`](https://elevenlabs.io/docs/api-reference/voices/get) | Manual checks only | Returns a voice's name, category, and stored description |

### Text to Dialogue

- **Keep each request to 2,000 characters or fewer** in total across all inputs. This is ElevenLabs' [reliability recommendation](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/text-to-dialogue): longer requests may stop early. Split longer scripts and join the audio afterwards. Our tools enforce it.
- **Models:** the API spec gives no list of allowed models. The default is `eleven_v3`. ElevenLabs now recommends [Eleven v4](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4) (`eleven_v4`) for content creation, but whether this endpoint accepts it is untested.
- **Options useful for joining parts** (from the [OpenAPI spec](https://api.elevenlabs.io/openapi.json), not yet used):
  - `previous_text` and `future_text` (up to 100 characters each): text that comes before and after this request, for continuity;
  - `previous_request_ids` and `next_request_ids`: link to neighbouring generations;
  - `seed`: for repeatable output;
  - `settings`, `language_code`, `apply_text_normalization` (`auto`, `on`, `off`), and `pronunciation_dictionary_locators`.
- **Output:** we request `mp3_44100_128`.

### Voice design

Limits from the OpenAPI spec (`VoiceDesignRequestModel`), enforced by our tool before sending:

| Field | Limit |
|---|---|
| `voice_description` | 20–1,000 characters |
| `text` (preview text) | 100–1,000 characters, or set `auto_generate_text` |
| `model_id` | `eleven_multilingual_ttv_v2` (API default) or `eleven_ttv_v3` (our default) |
| `seed` | 0 to 2,147,483,647 |
| `loudness` | −1 to 1 (default 0.5) |
| `guidance_scale` | 0 to 100 (default 5) |

Other options exist but aren't used: `should_enhance`, `quality`, `reference_audio_base64`, and `prompt_strength`. When saving, `voice_description` is also limited to 20–1,000 characters. The docs don't say how long a `generated_voice_id` remains valid, or how many voice slots a plan has.

## API key permissions

ElevenLabs lists [key permissions](https://elevenlabs.io/docs/api-reference/service-accounts/api-keys/create) but doesn't document which endpoint needs which. These mappings are inferred:

| Permission | Needed for | Confirmed |
|---|---|---|
| Text to Speech | Text to Dialogue | Yes, by the 2026-10-29 audition |
| Voice Generation | Voice design previews | Yes, by the 2026-10-29 design test |
| Voices: Write | Saving a designed voice; probably also editing or deleting voices | Not yet |
| Voices: Read | Reading stored voice descriptions | Only needed for manual checks |

Keys can also have a monthly credit limit, an IP allowlist, and an expiry date. Keys leaked to public GitHub are disabled automatically. Keep the key in `.env` only.

## Confirmed live

| Date | What | Result |
|---|---|---|
| 2026-10-29 | Pilot audition through Text to Dialogue, default model | HTTP 200; 459 characters; 520,820-byte MP3, about 32 seconds. All three voice IDs accepted. |
| 2026-10-29 | `GET /v1/voices/{id}` for the three pilot voices | All exist, are `generated` voices, and their names match our records. |
| 2026-10-29 | Stored voice descriptions | **Cut to about 500 characters**: 479, 471, and 500 for the narrator, Daniel, and Mara, each the exact start of the full prompt. Our voice records are the only full copy. |
| 2026-10-29 | Voice design with a throwaway draft (`eleven_ttv_v3`, 111-character preview text) | Three MP3 previews of 108–116 KB, about 7 seconds each. Nothing saved, so no slot used. |

## Not yet confirmed

- Saving a designed voice, and whether its description is also cut to about 500 characters.
- Whether Text to Dialogue accepts `eleven_v4`.
- How long design previews remain available for saving.
- The plan's voice-slot limit and credit quota.
