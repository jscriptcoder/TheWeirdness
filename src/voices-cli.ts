import { formatRegistry, loadRegistry } from './voices.ts';

const result = await loadRegistry('.');

if (result.ok) {
  console.log(formatRegistry(result.voices));
} else {
  console.error(result.error);
  process.exitCode = 1;
}
