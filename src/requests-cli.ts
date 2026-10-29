import { parseArgs } from 'node:util';
import { writeRequests } from './requests.ts';

const USAGE = 'Usage: npm run requests -- <episode script.txt> [--audition <from>-<to>]';

const usage: () => never = () => {
  console.error(USAGE);
  process.exit(2);
};

const { positionals, values } = (() => {
  try {
    return parseArgs({ allowPositionals: true, options: { audition: { type: 'string' } } });
  } catch {
    return usage();
  }
})();

const [scriptFile] = positionals;
if (!scriptFile || positionals.length > 1) {
  usage();
}

const range = values.audition?.match(/^(\d+)-(\d+)$/);
if (values.audition !== undefined && !range) {
  usage();
}

const result = await writeRequests({
  root: '.',
  scriptFile,
  ...(range ? { excerpt: { from: Number(range[1]), to: Number(range[2]) } } : {}),
});

if (result.ok) {
  for (const file of result.files) {
    console.log(`Wrote ${file.path} (${file.characters} characters)`);
  }
} else {
  console.error(result.error);
  process.exitCode = 1;
}
