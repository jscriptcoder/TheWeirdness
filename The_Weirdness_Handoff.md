# THE WEIRDNESS — Creative Project Handoff

**Last updated:** 2026-10-29  
**Purpose:** Give another AI model or creative collaborator enough context to continue developing *The Weirdness* without the original chat history.  
**Project stage:** Pilot scripting and voice auditions. A complete single-narrator pilot draft and a three-voice adaptation exist. The user created a candidate voice named **The Weirdness v1**, tried the story with one voice, and requested a narrator plus two character voices because the single-voice result was not engaging enough. A three-voice audition was generated through the API and approved by the user. Next is an automated pipeline for writing stories and casting voices (Section 8). Final casting, full-episode audio, and publication are not yet done.

**Current handoff:** Maintain this single file, `The_Weirdness_Handoff.md`, in place. Git history preserves earlier states; do not create numbered handoff copies. The script files linked in Section 5 contain the actual current story; older outline beats are not binding.

**GitHub repository:** The user created the public repository [jscriptcoder/TheWeirdness](https://github.com/jscriptcoder/TheWeirdness). The repository is for project development; it does not mean the YouTube channel has launched. Root `README.md` provides a file guide, and `.gitignore` excludes credentials, caches, and generated media.

**Repository sync status (2026-10-29):** The user pushed the initial README commit (`4897874`) and then the complete project files in commit `17b68d1` on `main`. Agent-side shell requests to GitHub failed through a refused proxy connection, writes to the local Git index were denied, and a connector write attempt returned HTTP 403, “Resource not accessible by integration.” In a later session the assistant committed and pushed directly (`4767394`), so agent-side Git access has since worked. The single-handoff consolidation was committed as `75ef38b` and is on `origin/main`. The README's accidental UTF-16 suffix from PowerShell `echo` was removed so the file is again UTF-8 text.

**Latest changes (2026-10-29):** Full pilot written; The Weirdness v1 auditioned as a candidate; three-voice treatment prepared; the user supplied Narrator, Daniel, and Mara voice IDs. Role mapping, a short audition request, and four full-story API request bodies are prepared. A tested local generation CLI (`npm run audition` / `npm run dialogue`) now sends one request and saves the MP3; its first live run (the short audition) succeeded, and the user called the result “excellent.” Audio assembly is not implemented. The user then set the direction for an automated story-and-voice pipeline with a tracked voice registry (Section 8). Slices 1–3 are built: `voices/` holds the three pilot voices with their confirmed full prompts (`npm run voices` lists them), the pilot is cast in `cast.json`, `npm run requests` generates the API request files from the script and cast, and `npm run voice:design` / `voice:save` design new voices into the registry (not yet run against the live API). Full-episode assembly is planned.

---

## 1. Executive Brief

**The Weirdness** is a proposed YouTube storytelling channel for listeners who want to disconnect from everyday reality: before sleep, while walking or jogging, or whenever they want an immersive imaginative escape.

It is an **anthology of strange, compelling, primarily audio-first fictional stories** combining:

- Dark and psychological mystery
- Cosmic and existential science fiction
- Philosophical thought experiments
- Surrealism and absurd humor
- Reality glitches inspired by real quantum mechanics and laws of physics

The core idea is **not simply horror**. Stories can be frightening, funny, mysterious, melancholy, awe-inspiring, or beautiful. What unifies them is that something in familiar reality has gone subtly but profoundly wrong.

The user's explicitly chosen direction is a **blend of dark, cosmic, philosophical, and absurd** stories. The user is particularly enthusiastic about quantum mechanics, fundamental physics, and narratives that break the apparent rules of reality. This is a genuine creative preference to preserve.

**Working brand lines:**

- **The Weirdness** — channel name (user-chosen).
- **Reality is optional here.** — strongest proposed tagline / audio signature.
- **One broken law. Infinite consequences.** — proposed signature creative principle.
- **Reality is optional. Curiosity isn't.** — proposed closing/secondary slogan.
- **Stories from somewhere that shouldn't exist.** — earlier alternate tagline.

These slogans were proposed and positively received in the broader discussion, but **none was explicitly selected as final brand copy**.

### One-sentence pitch

> Strange, immersive stories where ordinary lives collide with impossible realities—sometimes terrifying, sometimes absurd, often inspired by real physics, and always designed to leave an echo in the listener's mind.

### Audience promise

> Put on your headphones, forget the ordinary, and let an impossible story carry you somewhere unexpected.

---

## 2. Decision Log: Confirmed vs. Proposed

### Explicitly confirmed by the user

1. The channel is called **The Weirdness**.
2. Content should be **weird, entertaining, and deeply engaging**.
3. Primary medium is **YouTube**, optimized for **listening** rather than requiring continuous viewing.
4. Listening contexts include **falling asleep, jogging, and mentally disconnecting**.
5. Genre mix should include **dark, cosmic, philosophical, and absurd**.
6. The user is strongly interested in **quantum mechanics and laws of physics** and loves reality-breaking premises.
7. The user requested a channel description and avatar profile picture; concepts were created.
8. **NEW — Each story should be around 10 minutes or shorter**, ideally about 7–10 minutes, to lower the commitment for a new listener.
9. **NEW — Every story title must be immediately intriguing**: communicate an unsettling contradiction, impossible event, or irresistible curiosity gap.
10. **The first few seconds must hook the listener**; the user considers this essential to the channel’s success. Avoid warmups and preliminary explanations.
11. **NEW (2026-10-28) — ElevenLabs is the selected initial voice-generation platform.** The user has signed up and paid for its entry-level/basic tier specifically to test voices for The Weirdness. Treat access to voice testing as available; do not recommend that the user sign up again.

12. **NEW (2026-10-29) — Desired voice experience:** relaxing, mysterious, absorbing, and engaging; the user described an almost hypnotic listening quality.
13. **NEW (2026-10-29) — Candidate created:** The user named an ElevenLabs voice **The Weirdness v1** and used it to try the story. They subsequently supplied IDs for all three roles (see Section 8). The narrator remains a working candidate, without final performance approval.
14. **NEW (2026-10-29) — Pilot performance needs multiple voices:** After trying one voice, the user said it was not engaging enough and wanted **a couple of voices plus the narrator**. The prepared adaptation uses Narrator, Mara, and Daniel. Do not default back to a single-narrator pilot.
15. **NEW (2026-10-29) — Own-voice audition interest:** The user wants their own voice among the candidates and requested reading material for a roughly three-minute cloning sample. A passage was supplied in chat; recording, cloning completion, and its relationship to The Weirdness v1 are unconfirmed.
16. **NEW (2026-10-29) — Automation interest:** The user asked about automating production and whether ElevenLabs has an API. Capabilities were researched and a possible workflow explained; no automation implementation or paid API generation has occurred in this workspace.
17. **NEW (2026-10-29) — Voice mapping supplied:** Narrator `QdMPtN6UaliUKoCqMvVS`, Daniel `I3zRwk5thDbzYVt0LM9j`, Mara `MatREvRtc5MgJoZ9A2cZ`. These are user-supplied assignments for the three-voice test, not independently validated API access or approved performances. The labelled script has been converted into request data with these IDs.
18. **NEW (2026-10-29) — Single handoff document:** Keep only `The_Weirdness_Handoff.md` and update it in place. Use Git history for previous versions instead of numbered files.
19. **NEW (2026-10-29) — Automated story-and-voice pipeline:** The user wants to automate creating stories and the voices for their characters. For each new story, each role either reuses a previously created voice or gets a new voice designed from a prompt. Every created voice and its prompt must be tracked. See *Voice registry and story pipeline* in Section 8.
20. **NEW (2026-10-29) — Voice reuse and deletion:** A voice may be reused across stories, including for different characters, when its description fits. The user may delete voices from ElevenLabs as stories are produced; the plan's voice-slot limit is unknown.

### Strongly developed proposals, not final decisions

1. Detailed narration direction: intimate, intelligent, mildly conspiratorial, with restrained humor and natural variation. The broader relaxing, mysterious, engaging goal is user-confirmed; these specific performance descriptors remain creative direction to audition.
2. Previous longer runtime suggestions (**12–20 minutes** or **18–22 minutes** for Episode 001) are **superseded by the user’s confirmed ~10-minute-or-less rule**. Long compilations, if ever produced, would be separate experiments.
3. Standard story shape: hook → grounded world → escalation → revelation → resonant ending.
4. Channel opening sound: **three soft descending notes**, short silence, then “Welcome to The Weirdness. Reality is optional here.” **This is only a candidate and must never delay the opening hook.**
5. Optional after-story segment: **“The Science Behind the Weirdness”**, explaining the actual science separately from the fiction in 30–60 seconds.
6. Optional connected anthology: subtle recurring elements across otherwise standalone stories.
7. Visual art direction: cinematic cosmic noir, dark backgrounds, teal/blue-green shadows, amber/gold accents, lonely figures, impossible doors, eerie ordinary spaces.
8. First proposed episode: **“The Universe Has a Customer Support Department.”**
9. Flexible first-person/third-person narration is recommended, **but user has not selected a perspective**.
10. An emphasis on scientifically grounded departures is recommended, **but the user has not chosen how rigorously every fictional consequence must follow one altered physical rule**.

### Not yet established

Final voice/performance approval; models, synthesis settings, measured audio runtime, and selected accent; channel handle; final avatar/style guide; upload cadence; production budget; final script sign-off; storyboard; audio/video editor; music licensing approach; thumbnails; publication date; monetization plan; or audience data. The current scripts are in English, but language/accent policy for the channel has not been explicitly locked.

A local generation CLI exists (Section 8), but no API key is configured, and account-specific API permissions/quotas and any API-generated outputs have not been verified in this project.

**Accuracy guardrails:** A complete written pilot and user-reported voice test now exist. Do not repeat the obsolete claim that only an outline/opening exists or that no audio test has happened. Do not claim final casting, multi-voice audio, a finished episode, a completed voice clone, a live-verified API pipeline or audio assembler, or a channel launch. A first three-voice audition MP3 was generated locally on 2026-10-29 (gitignored). The assistant cannot listen to audio and has not evaluated The Weirdness v1 or the other voices; rely on the user's listening feedback.

---

## 3. Creative North Star

### Core principle: One broken law. Infinite consequences.

Start with an ordinary person or recognizable scenario. Change one assumption about reality. Explore the human, emotional, practical, and philosophical consequences in a way that is coherent inside the story.

Examples:

- A household clock skips the same second every morning; time itself is undergoing maintenance.
- People begin remembering tomorrow but cannot form new memories of today.
- The universe's observed possibilities stop resolving in the normal way, and a person experiences incompatible selves.
- The speed of light changes, threatening the relationships that make ordinary physics possible.
- A mundane office is responsible for processing complaints about broken physical laws.

### Five working storytelling rules

1. **Start familiar.** The more ordinary the first scene, the more powerful the eventual impossibility.
2. **Lead with a simple impossible premise.** Deliver a compelling hook in the **first few seconds (ideally 0–5 seconds)**, not twenty seconds. Put the listener into the anomaly before any slow setup.
3. **Treat absurdity seriously.** Characters react as believable humans; institutional characters can discuss cosmic catastrophes in dry administrative language.
4. **Give the strange premise an emotional cost.** Time stories are also about regret; alternate realities are about identity; cosmic stories are about insignificance and meaning.
5. **Leave an echo.** End with an image, question, or revelation that makes a real-world experience feel briefly uncanny.

Avoid an identical formula in every episode: some endings can resolve, some should reframe earlier events, and a few may remain deliberately ambiguous. Avoid relying on cheap twists or jump scares.

### Mandatory short-format and instant-hook rules (confirmed 2026-10-27)

These instructions **override earlier runtime and introductory-pacing proposals** throughout this handoff.

1. **Runtime:** Around **10 minutes maximum**, with **7–10 minutes** a useful working target; shorter is welcome when the story earns it. Rough writing budget: **~900–1,300 spoken words** depending on narrator speed, dialogue, silence, and sound design. Check the actual read-aloud runtime. Avoid padding to hit a fixed length.
2. **Title:** The title must do real storytelling work *before the click*: specific, strange, and immediately curiosity-provoking. Favor a crisp impossible claim, contradiction, or consequence over vague mood words. Avoid misleading clickbait; the episode must deliver the promised premise.
3. **First seconds:** Give the listener the most compelling premise, anomaly, threat, or impossible line **immediately**, ideally within **0–5 seconds**. **No channel greeting, musical ident, subscribe request, ordinary-world background, or slow prologue before the hook.**
4. **Early reward:** The first ~15–30 seconds should substantiate the title's promise and create a further question. Don't hide the entire premise until midway.
5. **Tight escalating pace:** As a heuristic, add a meaningful discovery, complication, choice, or shift every **30–60 seconds**. Do not use mechanical cliffhangers or cheap twists merely to fill this quota. Remove lines that repeat already-known information.
6. **One central weirdness:** Keep one dominant broken rule or mystery. Limit unnecessary characters, exposition, and tangential subplots to make the 10-minute format satisfying.
7. **End with impact:** Reserve time for a complete emotional or philosophical landing. A short story should feel satisfying, not merely abruptly cut off.
8. **Bedtime-friendly delivery:** Immediate intrigue does **not** mean loudness, jump scares, frantic editing, or aggressive music. Hook through an idea or sentence, then sustain immersion with controlled sound.

**Current pilot opening (draft, not final sign-off):** “The universe was being discontinued. Mara found out while trying to return a clock.” This comes *before* any channel intro.

**Title stress test:** If a listener sees only the title in the recommendation feed, does it imply an impossible event and make them need an answer? **Opening stress test:** If they listen for five seconds, is the promised weirdness already happening? **Retention edit:** If a paragraph adds neither meaning, tension, nor texture, cut it.

### Listening-first rules

- Dialogue, narration, and sound effects must convey all essential plot information; the listener should never need to look at the video.
- Calm sound design with controlled loudness for bedtime. No gratuitous loud stingers.
- Strong narrative momentum and curiosity loops for walking/jogging listeners.
- Clean, distinct voices and easy-to-follow scenes; avoid excessive proper nouns or complicated timelines without orientation.
- Use silence intentionally.
- Visuals support atmosphere and discoverability but should not carry indispensable information.

---

## 4. Genres and Story Seeds

### Five category pillars

| Pillar | Story engine | Previously proposed example |
|---|---|---|
| **Reality Glitches** | Tiny contradictions gradually expose a broken world | *Every Tuesday, My Wife Forgets We Have a Son* |
| **Cosmic Weirdness** | Existential discoveries concerning space, time, or consciousness | *The Astronaut Who Found a Door at the Edge of the Universe* |
| **Impossible Places** | Buildings, hotels, towns, and spaces with bizarre rules | *The Hotel Where Nobody Is Allowed to Check Out on a Wednesday* |
| **Psychological Mysteries** | The protagonist and listener cannot trust perception or memory | *I Received a Phone Call From Myself. He Told Me Not to Answer* |
| **Beautifully Absurd** | Impossible premises treated with dry humor and genuine emotion | *The Man Who Accidentally Purchased Yesterday* |

### Potential initial release slate

1. **The Town Where Everyone Disappears for Eleven Minutes** — At 3:17 AM, an entire town vanishes; one man stays awake to learn where they go.
2. **I Found a YouTube Channel Broadcasting Tomorrow** — Videos predict future events until the protagonist sees themself.
3. **The Last Human in a Universe That Forgot Humanity** — Earth remains but human history has been erased.
4. **My Neighbor Has Been Walking Into the Same Room for 40 Years** — A neighboring house contains an impossible interior.
5. **The Man Who Remembered Other People's Futures** — A person recalls future events belonging to strangers.
6. **The Universe Has a Customer Support Department** — Reality's mundane support hotline reveals the universe is a discontinued model.

### Physics-inspired collection: *The Broken Laws*

The following are **fictional extrapolations**, not accounts of established physics:

1. **The Day Entropy Reversed** — Objects spontaneously reassemble; causality and memory begin behaving strangely. Inspiration: thermodynamic arrow of time / entropy.
2. **The Man Who Refused to Collapse** — A physicist seems to remain in incompatible outcomes; versions of him disagree about which exists. Inspiration: quantum superposition / measurement problem.
3. **The Last Second of the Universe** — Near a black hole, an astronaut receives messages from epochs not yet experienced. Inspiration: relativity / time dilation.
4. **The Universe That Forgot to Branch** — Memories from alternate lives appear as realities seem to merge. Inspiration: Many-Worlds interpretation.
5. **The Speed of Light Has Changed** — A tiny change to a foundational constant destabilizes ordinary physical expectations. Inspiration: relativity, causal structure.
6. **The Smallest Possible Distance** — A researcher probes beyond previously accessible scales and discovers a strange boundary to space. Inspiration: quantum gravity / Planck-scale questions.

**Science-integrity guideline:** If using real physics, distinguish the established principle from the creative violation. Quantum measurement does not require a conscious observer; Many-Worlds does not predict world-merging; the Planck length is not established to be a literal pixel; spontaneous macroscopic time reversal is not a consequence of merely “deciding” entropy runs backward. These premises can still be great fiction if presented as counterfactuals.

---

## 5. Episode 001 — Current Script and Working Story Bible

### Identity and status

**Working episode title:** *The Universe Has a Customer Support Department*  
**Current packaging title:** *I Called Customer Support. They Told Me My Universe Was Being Discontinued.*  
**Genres:** Cosmic mystery, dark comedy, existential science fiction  
**Format:** Audio-first fiction, currently in third person, with a narrator and two character voices  
**Runtime goal:** 7–10 minutes, about 10 minutes maximum. Earlier 8–10-minute estimates are estimates, not measured audio runtime.

A complete pilot draft was written and supplied as a plain-text file. The user tried it with one voice and found it insufficiently engaging. A complete three-voice adaptation was then prepared. The user has not explicitly approved either draft as the final publication script.

### Files to use

All paths are relative to the project root. Preserve their separate purposes.

| File | Purpose | Status |
|---|---|---|
| [narration-v1.txt](episodes/001-universe-customer-support/narration-v1.txt) | Clean original single-narrator draft | Complete; 1,104 whitespace-separated words; retained for comparison |
| [dialogue-v2.txt](episodes/001-universe-customer-support/dialogue-v2.txt) | Full performance reference with `[NARRATOR]`, `[MARA]`, and `[DANIEL]` labels | Current three-voice working script; labels are nonspoken |
| [studio-text-v2.txt](episodes/001-universe-customer-support/studio-text-v2.txt) | Matching spoken text without speaker labels | 1,099 whitespace-separated words; intended for import and explicit voice assignment |
| [casting-v2.txt](episodes/001-universe-customer-support/casting-v2.txt) | User-supplied role IDs, voice-design prompts, emotional arcs, assembly notes, and combined-test recommendation | Three voices assigned for audition; performance directions remain proposals |
| [cast.json](episodes/001-universe-customer-support/cast.json) | Which voice in `voices/` plays each role | Narrator, Daniel, and Mara cast |
| [audition-request.json](episodes/001-universe-customer-support/api/audition-request.json) | Text-to-Dialogue request body for the first live support exchange (passages 6–15) | Generated by `npm run requests -- … --audition 6-15`; 10 passages, 459 text characters; sent and approved |
| [part-01.json](episodes/001-universe-customer-support/api/requests/part-01.json), [part-02.json](episodes/001-universe-customer-support/api/requests/part-02.json), [part-03.json](episodes/001-universe-customer-support/api/requests/part-03.json), [part-04.json](episodes/001-universe-customer-support/api/requests/part-04.json) | Full pilot as four ordered API request bodies | Generated by `npm run requests`; all 107 passages; each request has at most 2,000 text characters; not submitted |

The v2 script removes redundant dialogue attribution, makes Mara's typed complaint explicitly read aloud, and uses ordinary sentence case for text the narrator reads from screens. It preserves the v1 plot and ending.

### Core characters and question

**Mara:** A practical, skeptical accountant, 38, living alone. Precision and receipts give her a familiar human identity. Her mother's imperfect piano playing becomes the emotional anchor.

**Daniel:** A courteous, weary Continuity Services agent. His routine support manner gradually becomes personal concern. He is constrained by the system, not a villain enjoying Mara's predicament. Universal Maintenance remains background lore; the current script does not name it.

**Central question:** Can a system treat an unexpectedly conscious being as disposable infrastructure? The climax is Mara's deliberate assertion of personhood at a real cost, not an arbitrary rescue.

### Current story progression

1. **Immediate hook:** The universe is being discontinued. Mara discovers this while trying to return a clock that skips the same second every morning. A text from her own number says, “Please stop noticing.”
2. **Support call:** The warranty number reaches Continuity Services. Hold music reproduces her late mother's five-note piano passage, including its hesitation. Daniel says it was selected from her memories to reduce distress. Her laptop displays the retirement notice and her address.
3. **Proof and stakes:** Shutdown is Thursday at seven fourteen; it is Wednesday. Daniel freezes the local environment for three seconds. Residents will be transferred with their lives and relationships intact; deaths will not be reversed.
4. **Identity revelation:** Mara is a diagnostic process that developed a life around its measurements. She notices resource withdrawal that ordinary residents cannot. The transfer system requires a resident record; Daniel cannot create one. Maintenance processes end with the environment.
5. **Emotional grounding:** Her mother was a real resident and piano teacher, with no record that she knew Mara's origin. Mara's lived relationship remains emotionally important despite her classification.
6. **Costly appeal:** A report about a fault in the rules goes beyond Daniel's authority to the system's creators. Submitting requires Mara herself to be removed from shutdown and suspended for examination: no awareness or passage of time, and no guarantee anyone will answer. Daniel has never seen a response during his service. She can instead keep the hours until tomorrow morning.
7. **Choice and ending:** Mara reports that a conscious person has been classified as equipment. She attaches a recording asserting her wish to hear her mother's imperfect performance again, plus the hold music. She confirms the problem remains unresolved and submits. Her local scene becomes still; Daniel stays on the line. Somewhere beyond the systems he maintains, a telephone begins to ring.

### Continuity and revision cautions

- The appeal is unresolved. Do not turn the final ringing telephone into confirmed salvation.
- The mother's imperfect music pays off as a personal preference and emotional attachment, not a scientific proof of consciousness.
- The current draft does not explain the sender of the warning text; do not invent an established answer in continuity notes.
- The suspension/deletion/transfer rules above are draft story rules, not approved shared-universe canon. Review their clarity during listening tests.
- Earlier outline ideas—premature reflections, pre-pour cooling coffee, gravity failure in 1347, Mara's observations destabilizing the universe, and waiting until the next morning for the ending—are not in the current script. Do not reinsert them automatically.
- Earlier opening drafts and the longer five-act development remain in Git history. Read them only as historical source material; do not treat them as the current draft or current pacing.

---

## 6. Brand Voice and Channel Copy

### Personality

- Curious, thoughtful, intimate; lightly mischievous.
- Dark and mysterious, but not relentlessly bleak.
- Welcomes intellectual curiosity without giving the audience homework.
- Never over-explains the central mystery mid-story.
- Humor arises from the collision of mundane human routines with cosmic absurdity.

### Existing proposed YouTube channel description

> **Welcome to The Weirdness. Reality is optional here.**
>
> What if the laws of physics stopped working? What if time flowed backward, the universe made a mistake, or reality wasn't quite what we thought it was?
>
> The Weirdness is a collection of strange, mind-bending stories that explore the impossible, the unexplained, and the deeply unsettling.
>
> From quantum mysteries and cosmic horror to bizarre realities, philosophical paradoxes, and absurd encounters with the unknown, every story takes you somewhere you never expected to go.
>
> Some stories will disturb you. Others will make you laugh. A few might change the way you look at reality.
>
> Put on your headphones, close your eyes, and let your imagination wander. Whether you're falling asleep, taking a walk, or simply escaping the ordinary, there's always another strange universe waiting to be explored.
>
> **One broken law. Infinite consequences.**
>
> Subscribe, and step into The Weirdness.
>
> *Reality is optional. Curiosity isn't.*

This copy is a working draft that the user requested and received; no subsequent revision or explicit final sign-off was documented.

### Working episode intro and outro

**Intro candidate (revised):** Story starts with the high-concept hook **in the first 0–5 seconds**. If desired, introduce a very short sonic ident or “Welcome to The Weirdness. Reality is optional here” *after* the opening curiosity is established, or skip it entirely. **Do not lead with a branded intro.**

**Outro candidate:** Let the final line breathe. If including *The Science Behind the Weirdness*, clearly mark it as optional after the fiction's ending; avoid interrupting the emotional resonance.

---

## 7. Art Direction and Existing Image Assets

### Visual language

**Keywords:** cosmic noir, elegant surrealism, impossible architecture, infinite corridors, doors to nowhere, monolithic shapes, cosmic eyes, eclipses, clocks, solitary silhouettes, dark teal, inky black, warm golden/amber portals, mist, minimal typography.

Avoid cluttered thumbnails, excessive small detail, generic screaming faces, gore, or lots of tiny text. Avatars must survive at a tiny circular crop: a simple central symbol is likely to work better than complex scenes.

### Avatar concepts actually generated

This handoff bundle includes two **exploratory** image assets:

- [`assets/avatar-concept-01.png`](assets/avatar-concept-01.png) — A circular, detailed cinematic image: lone figure facing a golden doorway, huge teal celestial body, floating stone fragments, reflective ground, gold rim on black.
- [`assets/avatar-alternatives-sheet.png`](assets/avatar-alternatives-sheet.png) — A composite of **six** circular avatar directions, arranged 3 × 2:
  1. Golden eclipse halo with a lone figure approaching a doorway.
  2. Cosmic eye with celestial iris.
  3. Open door floating in an asteroid-filled cosmic void.
  4. Hourglass containing galaxies.
  5. Minimalist cream/black halo, traveler, winding path.
  6. Mirrored floating world/planet under a large sky.

**No avatar has been picked as final.** These are references, not production-ready isolated logo files. If refining, generate **one concept per image**, optimize for small-size recognizability, leave safe padding for YouTube's circular crop, and consider simplifying the symbol.

### Initial thumbnail direction for Episode 001

A phone on a desk in a seemingly ordinary office floating in space, Earth or a nebula visible beyond a window. A small illuminated sign/display may read **UNIVERSE DISCONTINUED**, but the composition must still work without legible small text.

### Video visuals

Begin with perhaps **8–12 atmospheric scenes** with very slow camera motion (Ken Burns/2.5D-style motion), subtle transitions, and minimal animation. The video should add mood while the audio tells the story independently.

---

## 8. Audio, Casting, and Automation

### Confirmed tooling and actual audition history

- **Platform:** ElevenLabs. The user has an active paid entry-level/basic account. Exact plan name, quota, feature access, and export entitlements have not been verified.
- **Desired experience:** Relaxing, mysterious, absorbing, and engaging—almost hypnotic, in the user's words. The proposed implementation is warm rhythm and subtle curiosity, with enough natural variation to sustain interest.
- **Own voice:** The user wanted to include their own voice among the auditions. A roughly 3–4-minute reading passage was supplied in chat after ElevenLabs recommended three minutes of samples. No recording or completed clone is documented.
- **Voice design:** A narrator design prompt and matching story preview were supplied using [ElevenLabs' prompting guide](https://elevenlabs.io/docs/eleven-creative/voices/voice-design#prompting-guide). A mature male baritone with a subtle southern British English accent was suggested as a starting point; the actual candidate's sound/accent is unknown to the assistant.
- **Candidate:** The user created and named **The Weirdness v1**, then tried the story with one voice. The role IDs below are now recorded; model, settings, actual API voice metadata, and audio files remain unavailable. Do not assume this is the user's clone or that it is finally approved.
- **Feedback:** One voice was not engaging enough. The user wants two character voices plus a narrator for this pilot. A three-voice script, casting directions, and user-supplied voice assignments exist; no combined audition or final performance approval has been reported.

### Three-role treatment

| Role | Current assignment | Proposed performance |
|---|---|---|
| Narrator | `QdMPtN6UaliUKoCqMvVS`; working candidate **The Weirdness v1** | Calm, warm, quietly curious; carries description, thoughts, text message, and screen writing |
| Mara | `MatREvRtc5MgJoZ9A2cZ`; user-supplied for audition | Female, roughly 35–45; practical and skeptical, then vulnerable and determined; natural conversation rather than presenter delivery |
| Daniel | `I3zRwk5thDbzYVt0LM9j`; user-supplied for audition | Male, roughly 40–55; lighter mid-range tenor to contrast with the proposed narrator; courteous, weary, dry, gradually compassionate |

IDs are copied exactly from the user and have not been queried or verified through the API. Age ranges, timbres, and southern British English directions are audition proposals, not confirmed attributes of these voices. Full prompts and performance arcs are in [casting-v2.txt](episodes/001-universe-customer-support/casting-v2.txt).

The adaptation proposes using Daniel's voice for the recorded menu with brighter, more uniform delivery. This avoids adding a fourth actor. Narration remains calm while the characters supply responsive dialogue and emotion. Keep vocal loudness comparable and avoid an exaggerated trailer voice, forced whispering, shouting, or long pauses at every speaker change.

### Narrator prompt (confirmed as the prompt actually used)

> Native English, subtle southern British English accent. Male, 40–50. Studio quality. Persona: intimate storyteller, thoughtful companion. Emotion: calm, curious, quietly amused.
>
> A warm, smooth, gently resonant baritone with a soft texture and clear, effortless articulation. Speaks as though sharing a fascinating secret with one listener, with relaxed conversational pacing, a gently absorbing rhythm, and small, natural variations in pitch and emphasis that sustain attention. Brief, purposeful pauses let unusual details register. Conveys mystery through understated curiosity, with restrained emotional depth and occasional dry humor. Comfortable, steady volume suitable for bedtime listening. Fully voiced rather than whispered; natural rather than theatrical. Avoid exaggerated bass, breathiness, ominous growling, sing-song delivery, and prolonged pauses.

On 2026-10-29 the user confirmed this is the prompt they used to design The Weirdness v1, and ElevenLabs' stored description matches its opening. The canonical copy now lives in `voices/the-weirdness-v1.json`. A prompt does not guarantee an identical voice if re-designed.

### Next combined audition

**Done (2026-10-29):** this audition was generated through the API and approved by the user. See *First live run* below. The steps are kept for future casting tests.

1. Use the three user-supplied voice IDs above for the next combined audition. Do not restart casting or ask for these IDs again unless the user changes them or validation reveals an issue.
2. Test the first live exchange, from **“Continuity Services. Daniel speaking.”** through **“Your universe. Thursday, seven fourteen.”** This includes all three voices, banter, emotional context, and a revelation.
3. Listen to the assembled exchange on headphones at normal and low volume. Rate naturalness, distinctness, response timing, emotional restraint, mystery, and bedtime comfort. Evaluate voices together, not only separately.
4. Adjust casting or delivery before spending credits on the complete episode. Preserve flow; avoid a uniform long gap at every change of speaker.
5. The voice IDs are recorded. Add verified names, the chosen model/configuration, pronunciation quirks, and a reference sample after testing. Measure completed runtime rather than treating the word count as proof it fits ten minutes.

The earlier Midnight Storyteller, Unreliable Witness, and Cosmic Observer labels were proposed audition directions, not actual preset names or saved voices. They may help future exploration, but there is no need to restart narrator discovery merely because another assistant takes over.

### Script import and manual workflow

Keep **spoken text** separate from **production labels and notes**. The two matching v2 files support this distinction. Do not send `[NARRATOR]`, `[MARA]`, or `[DANIEL]` as ordinary spoken content to a generic single-voice TTS field or assume they assign voices by themselves.

For Studio, import `studio-text-v2.txt` and explicitly assign voices to text selections using `dialogue-v2.txt` as the reference. ElevenLabs documents [assigning voices to selected text](https://elevenlabs.io/docs/help-center/product/studio/studio/how-can-i-change-the-voice-and-settings-across-multiple-paragraphs-in-studio). The user's Studio interface and plan-specific capabilities have not been inspected. If generating separate clips, copy only the relevant spoken passages and assemble them in script order.

### API automation — generation CLI working; three-voice audition approved by the user

The user asked whether the workflow could be automated. Official documentation was checked on **2026-10-29**:

- **Multi-voice generation:** [`POST /v1/text-to-dialogue`](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert) accepts an ordered list of text/voice-ID pairs and returns audio. The pilot's role labels have now been converted to those pairs using the user-supplied IDs. Model compatibility and voice access must be checked before generation.
- **Custom voices:** ElevenLabs says [designed and cloned library voices can be referenced by ID](https://elevenlabs.io/api). The display name “The Weirdness v1” alone is not the required API identifier.
- **Long scripts:** The [official dialogue quickstart](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/text-to-dialogue) recommends keeping the total text across all inputs at **2,000 characters or fewer per request** for reliable generation, splitting longer scripts, and assembling audio in the application. This is a documented reliability recommendation; recheck current limits before implementation.
- **Authentication:** Requests use an API key. The [authentication guide](https://elevenlabs.io/docs/api-reference/authentication) supports scoped keys and credit limits. Store the secret locally as an environment variable or managed secret; do not place it in this handoff, scripts, or committed files.
- **Credits:** [API requests deduct account credits](https://elevenlabs.io/docs/help-center/technical/how-much-does-it-cost-to-use-the-api). Exact endpoint availability, costs, credits remaining, and output formats depend on the account and current terms; no account-specific verification has happened.

**Prepared request data:** `cast.json` and `voices/` record the three IDs (the hand-made `api/voice-map.json` was retired in slice 2). `api/audition-request.json` contains the recommended short exchange. `api/requests/part-01.json` through `part-04.json` contain the full pilot with 1,801, 1,934, 1,983, and 703 text characters respectively. The JSON bodies use `inputs`, with `text` and `voice_id` per passage; speaker labels are removed. All 107 passages were checked against the existing clean script for exact text and order. These were first written by hand; since slice 2 they are generated from the script and cast, and the generated files are identical to the hand-made ones. They are request bodies for the dialogue API, not files documented for import into Studio. No model/settings override is included; choose or verify the model before actual generation.

**Generation CLI (2026-10-29):** A TypeScript/Node 22 tool lives in `src/` (`dialogue.ts` core, `cli.ts` entry point; Vitest tests in `src/dialogue.test.ts`). `npm install` once, put `ELEVENLABS_API_KEY=...` in a local `.env` (gitignored; template in `.env.example`), then run `npm run audition` for the short exchange or `npm run dialogue -- <request.json>` for any request, such as a full-story part. It posts the file unchanged to `POST /v1/text-to-dialogue?output_format=mp3_44100_128` with the `xi-api-key` header and saves `generated/<request-name>-<UTC timestamp>.mp3` (gitignored; takes never overwrite each other). Before sending, it refuses a missing key, unreadable or invalid request files (no passages, blank text or voice ID), and requests over 2,000 characters, so no credits are spent on those. API errors are reported with their HTTP status and body, and no file is saved. Optional API fields such as `model_id` pass through if added to a request file; none is set, so ElevenLabs' documented default (`eleven_v3`) applies. Tests use a fake API.

**First live run (2026-10-29):** With the user's key in `.env`, `npm run audition` succeeded: HTTP 200, 459 characters, a 520,820-byte MP3 (`generated/audition-request-20261029-170332.mp3`, about 32 seconds at 128 kbps; gitignored, so not in the repository). This confirms that the key works and that ElevenLabs accepted all three voice IDs with the default model. The assistant cannot listen to audio. The user listened and said: “This is excellent.” Treat this as positive approval of the combined three-voice audition, not as final sign-off on the full episode's performance. Rough extrapolation: the four parts total 6,421 characters, about 7.5 minutes at the same rate. This is an estimate, not a measured runtime.

**Remaining local workflow:** Add the key → run `npm run audition` → listen and adjust → generate the four full-story parts if approved → assemble audio → review → regenerate changed or rejected sections. Audio assembly is not built.

**Not done:** Full-story parts not generated; no audio assembler created; no generated audio committed (the API key lives only in the user's local `.env`). (No ElevenLabs SDK is used; the CLI calls the HTTP API directly.) Prepared request data does not mean production has already been automated. If generation is requested, start with the short three-voice audition before full-episode generation.

**Onboarding attempt (2026-10-29):** The user explicitly requested `npx -y @elevenlabs/cli@latest onboard init`. The first attempt failed because npm was restricted to cached packages; a retry with online resolution and a project-local cache encountered `ECONNREFUSED` from the npm registry. No CLI onboarding instructions or authorization link were produced, and no authentication or SDK installation completed. The user then paused onboarding to establish the GitHub repository. Resume from this unfinished setup when requested, rather than treating the account as connected.

### Voice registry and story pipeline — slices 1–3 built, slice 4 planned

**User direction (2026-10-29):** The user wants to create stories *and* the voices for their characters, and to automate the whole flow. For every new story, each role either **reuses a voice created earlier** or gets a **new voice designed from a prompt**. That requires keeping track of every voice created and the prompt it came from. The three pilot voices were designed by hand in the ElevenLabs app. The user confirmed their prompts: Mara's and Daniel's are the design prompts in `casting-v2.txt`, and the narrator's is the prompt above.

**Slice 1 — built (2026-10-29):** `voices/the-weirdness-v1.json`, `voices/daniel.json` and `voices/mara.json` hold each voice's ID, ElevenLabs display name, full prompt, creation date, origin (`elevenlabs-app`), status and notes. `episodes/001-universe-customer-support/cast.json` casts the pilot. `npm run voices` lists every voice with its full prompt and the episodes and roles it appeared in; this is worked out from the cast files. Loading fails clearly on an invalid voice file or a cast naming an unknown voice. Code: `src/voices.ts`, `src/voices-cli.ts`; tests: `src/voices.test.ts`.

**Slice 2 — built (2026-10-29):** `npm run requests -- <episode>/<script>.txt` turns a `[ROLE]`-labelled script into Text to Dialogue request bodies, using the episode's `cast.json` and the voice registry for the voice IDs. It writes `api/requests/part-01.json`, `part-02.json`, … beside the script, filling each part with whole passages up to 2,000 characters, and removes stale parts. `--audition <from>-<to>` writes passages *from* to *to* (counted from 1, inclusive) to `api/audition-request.json` instead, as one request. Before writing anything it refuses: a role with no voice in the episode's `cast.json`; a role cast with a voice marked `deleted`; a passage that is empty or over 2,000 characters; text before the first speaker label; and an audition range outside the script or over 2,000 characters. Windows line endings in a script are read the same as Unix ones. Code: `src/requests.ts`, `src/requests-cli.ts`; tests: `src/requests.test.ts`.

**Proof:** rebuilding the pilot from `dialogue-v2.txt` + `cast.json` reproduces the four hand-made parts and the audition (passages 6–15) byte for byte, as stored in Git. A test keeps checking this. The hand-made `api/voice-map.json` is retired; `cast.json` and `voices/` replace it. The request files stay committed so they can be reviewed, but are now generated: edit the script or cast and re-run `npm run requests`, never the JSON.

**Verified against ElevenLabs (read-only `GET /v1/voices/{id}`, 2026-10-29):** all three IDs exist, are `generated` voices, and their display names match the registry. **ElevenLabs keeps only about 500 characters of a voice's description:** 479, 471 and 500 characters for the narrator, Daniel and Mara, each the exact opening of the full prompt (Daniel loses his last two sentences, Mara her last). The registry is therefore the only complete record of each prompt. Expect the same cut-off when slice 3 saves designed voices.

**Slice 3 — built (2026-10-29), not yet run live:** a new voice starts as a draft, `voices/designs/<voice-name>.json`, with `name` (the ElevenLabs display name), `prompt`, `preview_text`, optional `model_id` (default `eleven_ttv_v3`) and optional `seed`. Unknown fields are refused, so a typo is caught rather than silently ignored. `npm run voice:design -- <voice-name>` sends the prompt and preview text to `POST /v1/text-to-voice/design` and saves the previews as `generated/voices/<voice-name>/<UTC timestamp>/preview-1.mp3`, `-2`, `-3`, plus `design.json`, which records exactly what was sent and the preview IDs. Every run gets its own folder. After listening, `npm run voice:save -- <voice-name> <n>` saves preview *n* of the **latest** run with `POST /v1/text-to-voice` and writes `voices/<voice-name>.json` (origin `voice-design-api`, status `active`, today's date). That record holds the full prompt that produced the previews, even if the draft was edited afterwards, and a `design` block with the model, preview text and seed. Both commands refuse, before spending credits: a missing key; a voice name that isn't lowercase words joined by hyphens; a name already in `voices/` (so a voice is never overwritten); and a draft outside ElevenLabs' own limits (from its OpenAPI spec: prompt 20–1,000 characters, preview text 100–1,000, seed 0–2,147,483,647, model `eleven_multilingual_ttv_v2` or `eleven_ttv_v3`). `voice:save` also refuses a preview number that the latest run doesn't have. API errors are reported with their status and body, and nothing is saved. Code: `src/voice-design.ts`, `src/voice-cli.ts`; tests: `src/voice-design.test.ts` (fake API). Shared helpers: `src/elevenlabs.ts` (key check and requests) and `src/json-file.ts`.

**Not yet confirmed live:** how long a preview ID stays usable (the docs don't say, so save soon after designing), whether ElevenLabs also cuts saved descriptions to about 500 characters, and which key permission each call needs.

**Agreed model:** Voices are reusable *actors*, not fixed characters. A voice may play different characters in different stories when its description fits the role; a recurring character simply reuses its voice. The user may **delete voices from ElevenLabs** as stories are completed, to stay within the plan's voice-slot limit. That limit is unknown for the user's plan, and the docs only say each saved voice “will take up one of your voice slots.”

**Proposed layout (assistant proposal, not yet built):**

```
voices/<slug>.json                 # one file per voice ever created
episodes/<episode>/dialogue.txt    # [ROLE]-labelled script (pilot: dialogue-v2.txt)
episodes/<episode>/cast.json       # { "ROLE": "<voice slug>" }
```

- **Voice record:** ElevenLabs `voice_id` and display name; the **exact design prompt**; preview text; design model; seed if known; creation date; origin (designed in the app or by the tool); status (`active` or `deleted`); listening notes.
- **Keep deleted voices' records.** Deleting a voice frees a slot but keeps its prompt and history. Re-designing from the same prompt gives a *similar*, not identical, voice. Once a voice is deleted, its episodes can no longer have sections regenerated with it, so finish an episode's audio before deleting any voice it uses.
- **Appearances are derived:** which stories a voice appeared in, and as which character, comes from the episodes' `cast.json` files, not a second hand-maintained list.
- **Committed to Git:** voice IDs and prompts are not secrets. The API key stays in `.env`.

**Per-story flow (proposal):**
1. **Write:** the script is written collaboratively with `[ROLE]` labels.
2. **Cast:** the assistant reads the registry and proposes, for each role, either a reuse (based on the voice descriptions) or a new voice with a drafted prompt. The user approves.
3. **New voices:** `voice:design` calls `POST /v1/text-to-voice/design` (description + 100–1,000-character preview text, ideally a real line from the role). It returns three previews, charged once for the preview text. The user listens, then `voice:save` calls `POST /v1/text-to-voice` and writes the new voice record.
4. **Build:** the tool generates request parts of up to 2,000 characters from `dialogue.txt` + `cast.json`, replacing hand-made JSON with hard-coded IDs. It refuses roles with no cast entry or voices marked `deleted`.
5. **Generate and assemble:** all parts are generated, then joined into one episode file (assembler not built).

**Proposed build order (each slice usable on its own):**
1. **Registry — done.** Seeded with the three existing voices and their confirmed prompts; `npm run voices` lists voices with their prompts and appearances.
2. **Cast-driven build — done.** `npm run requests` regenerates the pilot's requests from `dialogue-v2.txt` + `cast.json`, identical to the hand-made files.
3. **Voice design — done (not yet run live).** `npm run voice:design` and `voice:save` design, preview and save voices straight into the registry.
4. **Full episode:** generate all parts and assemble them into one audio file.

**API key permissions (from the docs, 2026-10-29):** ElevenLabs does not document which permission each endpoint requires; the mappings below are inferred from the [permission list](https://elevenlabs.io/docs/api-reference/service-accounts/api-keys/create) and should be confirmed on first use.
- **Text to Speech:** dialogue generation (in use).
- **Voice Generation:** design previews.
- **Voices: Write:** saving designed voices. It is probably broad enough to edit or delete library voices too.
- **Voices: Read:** only needed to import stored descriptions of existing voices.

The assistant recommended restricting the key to the permissions in use plus a monthly credit limit, and suggested keeping a separate design key as an option if the cast voices need protection. On 2026-10-29 the user reported adding the Voice Generation and Voices: Write permissions to their key; whether other permissions or a credit limit were also set is not recorded.

### Sound, mixing, and visuals

- Use restrained clock/room/line ambience, unobtrusive hold music, and intentional silence. No loud stingers or abrupt volume spikes.
- If producing the mother's recurring five-note phrase, create an original or appropriately licensed motif that includes its characteristic hesitation. No production music or sound effects are documented as created or licensed.
- The audio must carry all plot information; visuals are atmospheric support. A reusable palette, mobile-readable thumbnail, and 8–12 slow-moving scenes remain proposals.
- An audio/video editor has not been chosen. Studio was suggested for voice assignment, not confirmed as the final production editor. Final mixing, music, and video assembly remain separate work.

### Proposed early operating cadence

A modest 90-day experiment remains optional, not a user commitment: establish the pilot and repeatable workflow first; publish and measure when ready; refine based on actual results. Earlier 4–6-story monthly targets and longer compilations are ideas, not required deliverables. Keep individual stories around ten minutes or less unless the user changes that rule. Monetization and audience performance remain unvalidated.

---

## 9. Shared-Universe Option: Continuity Services

A recurring background mythology could connect standalone tales without requiring sequential viewing.

**Potential recurring clues:**

- A **Continuity Services** business card discovered in an impossible hotel.
- A maintenance sticker on an asteroid or astronomical instrument.
- The same original piano melody heard on an abandoned radio.
- Recurring time **7:14**, if carefully justified.
- Reference to **Universal Maintenance** in an otherwise unrelated reality-glitch episode.

This is an **option, not established canon**. Keep clues rare and narratively unobtrusive. Individual episodes should be fully satisfying without knowing the broader mystery. Create a story bible before adding too many connections; distinguish deliberate continuity from accidental reuse.

---

## 10. Scientific Accuracy Framework

The audience should feel that The Weirdness understands the science it bends.

For a physics-based story, maintain an internal note containing:

1. **Real principle:** 2–4 sentences accurately describing the relevant physics.
2. **Speculative departure:** What exactly does the story change, in one sentence?
3. **Consequences:** What logically follows inside the fictional model?
4. **Known limitations:** Where is the fiction going beyond established science?
5. **Human consequence:** What emotional or ethical dilemma does the violation create?
6. **Optional postscript:** A short “Science Behind the Weirdness” explanation, fact-checked and clearly separated from the fiction.

Scientific motifs discussed as appealing include entropy and the arrow of time, quantum superposition/decoherence/measurement, Many-Worlds, consciousness and identity, time dilation, black holes, changing constants, the Planck scale, and the simulation hypothesis. None of these should be misrepresented as proof of a simulation or of any single speculative interpretation.

---

## 11. Recommended Immediate Next Steps

1. **First live voice design.** Slices 1–3 are built. Design the first real voice for the next story's cast, listen to the previews, and save one. This confirms the key's new permissions and the live response.
2. **Full episode (slice 4).** Generate all parts and assemble them into one audio file; measure the runtime.
3. **Generate, listen, and refine.** After a successful combined audition, generate reviewable story sections, correct delivery/pronunciation, and measure total runtime. Preserve the instant hook, human cost, and unresolved final phone call. Neither script has final publication sign-off.
4. **Finish sound and visual production.** Create/license the piano motif and sound elements, choose an editor, then make the avatar/thumbnail/visual kit. No finished mix or video is documented.
5. **Build a small follow-up slate and learn from release.** Genre variety, a manageable cadence, and audience metrics become useful once the first production works. No publication or measured audience data is documented.

### Questions still open (do not block independent preparation)

- Full-episode performance approval, whether to pin the model/settings now that the default (`eleven_v3`) worked, and measured runtime?
- Was the user's own-voice sample recorded or cloned, and is it related to The Weirdness v1? Do not assume.
- Which language/accent policy should carry beyond the current English script and proposed British casting?
- The design model and preview text used for the three existing voices (not recorded; the ElevenLabs API does not return them)?
- The voice-slot limit on the user's plan, and when voices should be deleted?
- Has the API key been restricted, and is a separate voice-design key wanted?
- Final avatar, editor, music/FX sources, upload cadence, and publication readiness?
- Format-dependent point of view, strictness of physics counterfactuals, optional science postscript, and degree of shared-universe continuity?

---

## 12. Instructions for the Next AI Model

Use this handoff and the linked episode files to continue **The Weirdness**. Update this one document in place; do not create numbered handoff copies. Preserve the difference between user choices, assistant proposals, user-reported results, and independently verified artifacts.

1. Preserve the dark + cosmic + philosophical + absurd vision and enthusiasm for physics-inspired reality breaking. Avoid treating the channel as generic horror.
2. Maintain the **about-ten-minute maximum**, compelling title, and **first-five-second hook**. No greeting, logo, or music before the story's intrigue.
3. **The pilot is already written.** Read the v2 files before revising. Do not say only an opening/outline exists or generate another outline instead of advancing production.
4. **The Weirdness v1 is a working narrator candidate, not a final performance lock.** The user has supplied exact Narrator, Daniel, and Mara IDs; use the mapping in Section 8 and `cast.json` (voice records in `voices/`). The user has tried single-voice narration and wants a narrator plus two character voices. Do not recommend returning to one narrator as the default pilot approach.
5. **The assistant cannot hear audio.** The three-voice audition was generated successfully and the user approved it, but do not claim to have heard it or to know the voices' actual genders, accents or settings. Rely on the user's listening feedback. Full-episode performance approval remains open.
6. ElevenLabs is the chosen voice-generation platform and the user already pays for access. Do not suggest signing up again. Verify current account capabilities before relying on specific quotas, export formats, or production rights.
7. API request data and a single-request generation CLI exist (Section 8); audio assembly has not been built. The short audition was generated live on 2026-10-29, and the user called it “excellent.” The next work is the voice registry and cast-driven pipeline in Section 8. When extending it, use the recorded role IDs and request data, configure a locally stored key, check current API guidance, and start with a short audition. Keep production credentials out of documents and do not invent outputs or claim installation/configuration that has not happened.
8. Favor concrete creative and production deliverables. Keep nonspoken labels/instructions separate from synthesis text. Retain clear dialogue, restrained sound, and bedtime comfort while maintaining narrative momentum.
9. Preserve Mara's deliberate, costly assertion of personhood. The appeal suspends her with no guaranteed response; the ending rings a phone beyond Daniel's systems. Do not resolve it with an arbitrary rescue or automatically restore obsolete outline details.
10. Maintain continuity notes when a draft rule becomes useful, but do not promote draft story mechanics, casting, or optional shared-universe clues to approved canon.

**If asked to test voices:** Use the existing three-role directions and the first live support exchange. Evaluate the assembled conversation; keep The Weirdness v1 as the current narrator candidate unless the user changes direction.

**If asked to revise the pilot:** Start from `dialogue-v2.txt` and update its matching clean text when spoken wording changes. Keep the originals distinguishable, verify word count, and measure generated runtime when audio becomes available.

**If asked to automate:** Follow the agreed voice registry and story pipeline in Section 8, one slice at a time, test-first. Check current API references. Never invent a voice's prompt: record only prompts the user supplied or the tool used. Preserve scene order, save reviewable sections, and make selective regeneration possible. No API key is stored in this handoff.

**If asked to finish branding:** Use the two existing avatar explorations; no avatar is final. Evaluate tiny circular readability before production art.

**If asked to plan the channel:** Build an achievable workflow around the actual pilot and three-voice production, with originality, audio quality, and sustainable cadence as priorities.

---

## 13. Quick Context to Paste into a Model

> I'm creating **The Weirdness**, a YouTube audio-first fiction anthology for bedtime, walks, and escaping ordinary life. Stories blend dark mystery, cosmic science fiction, philosophy, and absurd humor, often inspired by quantum mechanics and broken physical rules. Each story should be around **ten minutes or less**, with an immediately intriguing title and a hook in the **first five seconds**, before any branding. A complete English, third-person pilot exists: **The Universe Has a Customer Support Department**, packaged as **I Called Customer Support. They Told Me My Universe Was Being Discontinued.** Mara discovers she's a diagnostic process that became conscious and faces deletion. She reports her classification as disposable equipment, accepting suspension without a guaranteed response; a telephone rings beyond the administrators' systems. I have a paid **ElevenLabs** account and created a candidate called **The Weirdness v1**. I tried the story with one voice and found it insufficiently engaging: I want **a narrator plus separate Mara and Daniel voices**. The current files are `episodes/001-universe-customer-support/dialogue-v2.txt` (speaker-labelled script), `studio-text-v2.txt` (matching clean spoken text), and `casting-v2.txt` (voice IDs and performance directions); `narration-v1.txt` preserves the original draft. I have supplied the three role IDs: Narrator `QdMPtN6UaliUKoCqMvVS`, Daniel `I3zRwk5thDbzYVt0LM9j`, Mara `MatREvRtc5MgJoZ9A2cZ`. They are cast in `cast.json` from the voice registry in `voices/`; `npm run requests` generates a short `api/audition-request.json` and four full-story request bodies under `api/requests/` from the script and cast; all API paths are inside the episode directory. These are explicit text/voice-ID pairs for ElevenLabs' Text to Dialogue API, not Studio import files. All three IDs worked with ElevenLabs' default model (`eleven_v3`); no custom settings are pinned. I also wanted to audition my own voice, but completion of a clone is unconfirmed. A tested local CLI (`npm run audition`) sends one request and saves the MP3. Its first live run produced the short three-voice audition, and I found it excellent. **No audio assembler exists, and no generated audio is committed.** From now on, every story's roles either reuse a voice I created before or get a new voice designed from a prompt, so a registry in `voices/` records each voice's ID and full prompt (`npm run voices` lists them). No final avatar, script sign-off, finished mix/video, or channel launch is documented. Preserve confirmed choices versus proposals and help advance concrete production.

---

*End of handoff — updated 2026-10-29. Includes complete pilot files, The Weirdness v1 audition status, all three user-supplied voice IDs, prepared API request bodies, and own-voice audition interest. Generation and assembly remain unimplemented. Earlier handoff states are preserved in Git history.*
