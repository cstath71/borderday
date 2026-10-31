#!/usr/bin/env node
/**
 * Post-vite build: write robots/sitemap/llms/IndexNow key + per-route HTML shells
 * with unique title, description, canonical, hreflang, OG, JSON-LD and answer-first body
 * for crawlers that do not execute JS. Also syncs SEO files into public/.
 */
import { mkdirSync, readFileSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE,
  BRAND,
  CFG,
  FAQ,
  IN_SHORT_LABEL,
  INDEXNOW_KEY,
  LANGS,
  NOINDEX_PATHS,
  PAGES,
  PUBLIC_PATHS,
  absUrl,
  breadcrumbLd,
  esc,
  faqLd,
  ldScript,
  llmsFullTxt,
  llmsTxt,
  organizationLd,
  pageFile,
  robotsTxt,
  sitemapXml,
  softwareApplicationLd,
  verificationMetas,
  websiteLd,
} from './seo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PUBLIC = join(ROOT, 'public');

function writeBoth(rel, content) {
  const distPath = join(DIST, rel);
  mkdirSync(dirname(distPath), { recursive: true });
  writeFileSync(distPath, content);
  const pubPath = join(PUBLIC, rel);
  mkdirSync(dirname(pubPath), { recursive: true });
  writeFileSync(pubPath, content);
}

function hreflangLinks(path) {
  const lines = [];
  for (const l of LANGS) {
    lines.push(`<link rel="alternate" hreflang="${l}" href="${esc(absUrl(l, path))}">`);
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${esc(absUrl('en', path))}">`);
  return lines.join('\n    ');
}

function headBlock({ lang, path, title, description, noindex }) {
  const canonical = absUrl(lang, path);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const verify = verificationMetas();
  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${esc(canonical)}">
    ${hreflangLinks(path)}
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${esc(canonical)}">
    <meta property="og:image" content="${esc(BASE + CFG.og_image)}">
    <meta property="og:locale" content="${lang === 'en' ? 'en_US' : lang === 'fr' ? 'fr_FR' : lang === 'de' ? 'de_DE' : 'it_IT'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(BASE + CFG.og_image)}">
    ${verify ? verify + '\n    ' : ''}`.trimEnd();
}

function faqHtml(lang) {
  const pairs = FAQ[lang] || FAQ.en;
  return (
    `<section class="faq" id="faq"><h2>FAQ</h2>` +
    pairs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('') +
    `</section>`
  );
}

function prerenderBody(lang, path, page) {
  const showFaq = path === '' || path === 'faq';
  const crumbs = (page.crumbs || [])
    .map(([name, p], i, arr) => {
      if (i === arr.length - 1) return `<li aria-current="page">${esc(name)}</li>`;
      return `<li><a href="${esc(absUrl(lang, p))}">${esc(name)}</a></li>`;
    })
    .join('');
  return `
    <article class="bd-prerender" data-bd-prerender="1">
      <nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs}</ol></nav>
      <h1>${esc(page.h1)}</h1>
      <p id="summary"><strong>${esc(IN_SHORT_LABEL[lang] || 'In short')}:</strong> ${esc(page.summary)}</p>
      ${showFaq ? faqHtml(lang) : ''}
      <p><a href="${esc(absUrl(lang, path))}">${esc(BRAND)}</a> · <a href="${esc(absUrl(lang, 'pricing'))}">Pricing</a></p>
    </article>`;
}

function graphFor(lang, path) {
  const graph = [organizationLd(), websiteLd(), softwareApplicationLd()];
  const page = PAGES[path]?.[lang];
  if (page?.crumbs?.length) graph.push(breadcrumbLd(lang, page.crumbs));
  if (path === '' || path === 'faq') graph.push(faqLd(lang));
  return graph;
}

function injectHtml(template, { lang, path, title, description, noindex, bodyHtml, graph }) {
  let html = template;
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${lang}"`);
  // Drop the stock <title>…</title>; we inject a full SEO head block.
  html = html.replace(/<title>[^<]*<\/title>\s*/i, '');
  const head = headBlock({ lang, path, title, description, noindex });
  const ld = noindex ? '' : ldScript(graph);
  html = html.replace('</head>', `    ${head}\n    ${ld}\n  </head>`);
  if (bodyHtml) {
    html = html.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${bodyHtml}\n    </div>`,
    );
  }
  return html;
}

function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/index.html missing — run vite build first');
    process.exit(1);
  }
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');

  writeBoth('robots.txt', robotsTxt());
  writeBoth('sitemap.xml', sitemapXml());
  writeBoth('llms.txt', llmsTxt());
  writeBoth('llms-full.txt', llmsFullTxt());
  writeBoth(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY + '\n');

  // Root redirect-friendly index keeps SPA entry; also 404 shell.
  writeFileSync(join(DIST, '404.html'), template);
  // Ensure root index has EN home SEO for bare / crawlers that hit index.html.
  const enHome = PAGES[''].en;
  writeFileSync(
    join(DIST, 'index.html'),
    injectHtml(template, {
      lang: 'en',
      path: '',
      title: enHome.title,
      description: enHome.description,
      noindex: false,
      bodyHtml: prerenderBody('en', '', enHome),
      graph: graphFor('en', ''),
    }),
  );

  for (const lang of LANGS) {
    for (const path of PUBLIC_PATHS) {
      const page = PAGES[path][lang];
      const rel = pageFile(lang, path);
      const html = injectHtml(template, {
        lang,
        path,
        title: page.title,
        description: page.description,
        noindex: false,
        bodyHtml: prerenderBody(lang, path, page),
        graph: graphFor(lang, path),
      });
      const out = join(DIST, rel);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, html);
    }
    for (const path of NOINDEX_PATHS) {
      const rel = pageFile(lang, path);
      const title = `${BRAND}`;
      const description = PAGES[''][lang].description;
      const html = injectHtml(template, {
        lang,
        path,
        title,
        description,
        noindex: true,
        bodyHtml: '',
        graph: [],
      });
      const out = join(DIST, rel);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, html);
    }
  }

  // Auth callback without lang prefix (route /auth/callback)
  {
    const out = join(DIST, 'auth/callback/index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(
      out,
      injectHtml(template, {
        lang: 'en',
        path: 'auth/callback',
        title: BRAND,
        description: PAGES[''].en.description,
        noindex: true,
        bodyHtml: '',
        graph: [],
      }),
    );
  }

  console.log(
    `prerender: ${PUBLIC_PATHS.length * LANGS.length} public + ${NOINDEX_PATHS.length * LANGS.length} noindex shells, robots/sitemap/llms/IndexNow key`,
  );
}

main();
