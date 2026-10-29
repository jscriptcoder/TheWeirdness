import { existsSync } from 'node:fs';
import { generateDialogue } from './dialogue.ts';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const [requestFile] = process.argv.slice(2);
if (!requestFile) {
  console.error('Usage: npm run dialogue -- <request.json>');
  process.exit(2);
}

console.error(`Generating ${requestFile} ...`);

const result = await generateDialogue({
  requestFile,
  outputDir: 'generated',
  apiKey: process.env['ELEVENLABS_API_KEY'],
  fetch,
  now: () => new Date(),
});

if (result.ok) {
  console.log(`Saved ${result.audioFile} (${result.characters} characters)`);
} else {
  console.error(result.error);
  process.exitCode = 1;
}
