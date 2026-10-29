import { existsSync } from 'node:fs';
import { designVoice, saveVoice } from './voice-design.ts';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const USAGE = [
  'Usage:',
  '  npm run voice:design -- <voice-name>              # previews from voices/designs/<voice-name>.json',
  '  npm run voice:save -- <voice-name> <preview>      # save preview 1, 2 or 3 into voices/',
].join('\n');

const usage: () => never = () => {
  console.error(USAGE);
  process.exit(2);
};

const [command, slug, preview, ...extra] = process.argv.slice(2);
if (!slug || extra.length > 0) {
  usage();
}

const options = {
  root: '.',
  slug,
  apiKey: process.env['ELEVENLABS_API_KEY'],
  fetch,
  now: () => new Date(),
};

if (command === 'design' && preview === undefined) {
  console.error(`Designing ${slug} ...`);
  const result = await designVoice(options);
  if (result.ok) {
    console.log(result.previews.map((file) => `Saved ${file}`).join('\n'));
    console.log(`Listen, then: npm run voice:save -- ${slug} <preview number>`);
  } else {
    console.error(result.error);
    process.exitCode = 1;
  }
} else if (command === 'save' && preview !== undefined && /^\d+$/.test(preview)) {
  const result = await saveVoice({ ...options, preview: Number(preview) });
  if (result.ok) {
    console.log(`Saved voice ${result.voiceId} to ${result.voiceFile}`);
  } else {
    console.error(result.error);
    process.exitCode = 1;
  }
} else {
  usage();
}
