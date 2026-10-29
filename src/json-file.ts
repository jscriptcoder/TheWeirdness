import { readFile } from 'node:fs/promises';
import { z } from 'zod';

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const readJsonFile = async <T>(path: string, schema: z.ZodType<T>): Promise<Result<T>> => {
  try {
    const parsed = schema.safeParse(JSON.parse(await readFile(path, 'utf8')));
    return parsed.success
      ? { ok: true, value: parsed.data }
      : { ok: false, error: `Invalid ${path}:\n${z.prettifyError(parsed.error)}` };
  } catch (error) {
    return { ok: false, error: `Cannot read ${path}: ${String(error)}` };
  }
};
