#!/usr/bin/env node
/**
 * Link check for every official source in src/borders/packs.ts. Run before re-stamping a `checked`
 * date, or on a schedule. A 200 says the document is there, not that it still says the same: read
 * the changed sources before moving their dates.
 * EUR-Lex answers scripts with an empty 202, so that is reported as "not checkable" and not as a failure.
 * Fedlex returns 200 with an app shell for any /eli/ path, so a 200 there proves little. Read the text through
 * https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/... instead.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/borders/packs.ts'), 'utf8');
const sources = [...packs.matchAll(/^ {2}(\w+): \{\n\s+title: '[^']*',\n\s+url: '([^']+)',\n\s+checked: '(\d{4}-\d{2}-\d{2})',/gm)].map(
  ([, key, url, checked]) => ({ key, url, checked }),
);
if (sources.length === 0) throw new Error('No sources found: did the shape of SRC in packs.ts change?');

let failed = 0;
for (const { key, url, checked } of sources) {
  let status;
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 BorderDay source check' } });
    status = res.status;
    await res.body?.cancel();
  } catch (e) {
    status = `error: ${e instanceof Error ? e.message : e}`;
  }
  const verdict = status === 200 ? 'ok' : status === 202 && url.includes('eur-lex') ? 'not checkable' : 'FAILED';
  if (verdict === 'FAILED') failed += 1;
  console.log(`${verdict.padEnd(13)} ${String(status).padEnd(4)} ${checked} ${key} ${url}`);
}
console.log(`${sources.length} sources, ${failed} failed`);
process.exit(failed ? 1 : 0);
