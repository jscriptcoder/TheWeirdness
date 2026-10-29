# The Weirdness

An audio-first YouTube fiction anthology: dark, cosmic, philosophical, and absurd stories of about 10 minutes or less, with a hook in the first five seconds. The repo holds the stories, the voice registry, and a TypeScript CLI that drives ElevenLabs.

Start with [docs/README.md](docs/README.md). Check [docs/status.md](docs/status.md) for current state and next steps, and [docs/decisions.md](docs/decisions.md) for what the user confirmed versus what is only proposed.

## Layout

- `episodes/<episode>/`: the labelled script (`[ROLE]` lines), `cast.json`, generated `api/` requests, and a story-bible `README.md`.
- `voices/<voice-name>.json`: one record per voice ever created, holding the only full copy of its prompt. `voices/designs/` holds drafts.
- `src/`: one module per command, each with a Vitest test file. `generated/` holds audio output and is gitignored.

## Commands

```sh
npm test            # all tests, against a fake ElevenLabs API
npm run typecheck   # TypeScript strict
npm run voices      # list voices, prompts, appearances
npm run requests -- <script.txt> [--audition <from>-<to>]
npm run dialogue -- <request.json>          # costs credits
npm run voice:design -- <voice-name>        # costs credits
npm run voice:save -- <voice-name> <n>      # uses a voice slot
```

Full reference: [docs/production/commands.md](docs/production/commands.md).

## Rules

- Ask before any command that costs credits or voice slots, and before every commit.
- Never edit `api/` request JSON by hand: change the script or cast, then rebuild with `npm run requests`.
- Don't invent voice prompts unasked: draft one for a new voice only when the user asks, and get approval before designing. Never reconstruct an existing voice's prompt. Never print or commit the API key; it lives only in `.env`.
- You can't hear audio; the user's listening decides.
- Update the docs in the same change as the work ([upkeep rules](docs/README.md#keeping-these-docs-current)). Date any claim about current state.
- Git autocrlf is on: write files with LF line endings. Python's `write_text` on Windows writes CRLF; use `write_bytes`.

More guidance: [docs/working-with-ai.md](docs/working-with-ai.md).
