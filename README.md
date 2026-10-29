# The Weirdness

Audio-first stories where ordinary lives collide with impossible realities.

*The Weirdness* is a YouTube anthology blending cosmic science fiction, dark mystery, philosophy, and absurd humour. Each episode runs about 10 minutes or less, hooks the listener in the first five seconds, and stays calm enough to fall asleep to. This repository holds the stories, the voices that perform them, and a small tool that produces the audio with [ElevenLabs](https://elevenlabs.io).

Nothing is published yet. See [where things stand](docs/status.md).

## The pilot

**[The Universe Has a Customer Support Department](episodes/001-universe-customer-support/README.md)**: an accountant calls about a broken clock and learns her universe is being discontinued, and that she is classified as maintenance equipment. It's written for a narrator and two character voices. A full test version, about 7 min 45 s, has been generated; the pilot is paused there while a new story is written.

## Quickstart

Requires Node 22 or later and an ElevenLabs API key.

```sh
npm install
cp .env.example .env    # then set ELEVENLABS_API_KEY in .env
npm test                # runs against a fake API; no key or credits needed
npm run voices          # lists every voice and its prompt
npm run audition        # generates the pilot's short audition (costs credits)
```

Audio is saved in `generated/`, which is gitignored. To take a new story from script to audio, follow the [production workflow](docs/production/workflow.md).

## Documentation

All project docs are in [`docs/`](docs/README.md):

- [Status](docs/status.md) and [decisions](docs/decisions.md)
- Creative: [vision and story rules](docs/creative/vision.md), [story ideas](docs/creative/story-ideas.md), [science](docs/creative/science.md), [brand and visuals](docs/creative/brand-and-visuals.md)
- Production: [workflow](docs/production/workflow.md), [commands](docs/production/commands.md), [casting and sound](docs/production/casting-and-sound.md)
- Reference: [ElevenLabs](docs/reference/elevenlabs.md), [ElevenLabs best practices, applied](docs/reference/elevenlabs-best-practices.md)

## Security

API keys stay in the local `.env`, which is gitignored along with dependency caches and generated audio and video. Voice IDs in `voices/` identify voices and aren't credentials.
