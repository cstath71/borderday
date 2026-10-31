#!/usr/bin/env node
/**
 * Ping IndexNow with every <loc> from dist/sitemap.xml (or public/sitemap.xml).
 * Free, no account. Key file /<key>.txt must already be live.
 *   node scripts/indexnow.mjs           # send
 *   node scripts/indexnow.mjs --dry     # print payload only
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, INDEXNOW_KEY } from './seo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = BASE.replace(/^https?:\/\//, '');

function loadSitemap() {
  for (const p of [join(ROOT, 'dist/sitemap.xml'), join(ROOT, 'public/sitemap.xml')]) {
    if (existsSync(p)) return readFileSync(p, 'utf8');
  }
  throw new Error('sitemap.xml not found in dist/ or public/');
}

export function payload() {
  const sm = loadSitemap();
  const urls = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(BASE));
  return {
    urls,
    body: {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(0, 10000),
    },
  };
}

async function main() {
  const { urls, body } = payload();
  if (process.argv.includes('--dry')) {
    console.log(urls.length, 'urls', JSON.stringify(body).slice(0, 400));
    return;
  }
  const keyUrl = `${BASE}/${INDEXNOW_KEY}.txt`;
  const keyRes = await fetch(keyUrl);
  if (!keyRes.ok) {
    console.error('key file not reachable yet:', keyRes.status, keyUrl);
    process.exit(1);
  }
  const live = (await keyRes.text()).trim();
  if (live !== INDEXNOW_KEY) {
    console.error('live key file does not match; deploy first');
    process.exit(1);
  }
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('IndexNow', res.status, urls.length, 'urls', text.slice(0, 200));
  if (!res.ok && res.status !== 202) process.exit(1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
