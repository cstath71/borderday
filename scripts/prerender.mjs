#!/usr/bin/env node
/**
 * Post-vite build: write robots/sitemap/llms/IndexNow key + per-route HTML shells
 * with unique title, description, canonical, hreflang, OG, JSON-LD and answer-first body
 * for crawlers that do not execute JS. Also syncs SEO files into public/.
 */
import { mkdirSync, readFileSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { articleJsonLd } from '../src/content/articleSchema.mjs';
import { markdownToArticle } from '../src/content/articleMarkdown.mjs';
import {
  BASE,
  BRAND,
  CFG,
  FAQ,
  FRENCH_GUIDES,
  IN_SHORT_LABEL,
  INDEXNOW_KEY,
  LANGS,
  NOINDEX_PATHS,
  PAGE_FAQS,
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

const PRERENDER_UI = {
  en: { faq: 'FAQ', pricing: 'Pricing', companySignup: 'Company sign-up', breadcrumb: 'Breadcrumb' },
  fr: { faq: 'FAQ', pricing: 'Tarifs', companySignup: 'Inscription entreprise', breadcrumb: 'Fil d\'Ariane' },
  de: { faq: 'FAQ', pricing: 'Preise', companySignup: 'Unternehmenskonto', breadcrumb: 'Brotkrumen' },
  it: { faq: 'FAQ', pricing: 'Prezzi', companySignup: 'Registrazione azienda', breadcrumb: 'Percorso' },
  nl: { faq: 'FAQ', pricing: 'Prijzen', companySignup: 'Bedrijfsaccount', breadcrumb: 'Kruimelpad' },
};

function writeBoth(rel, content) {
  const distPath = join(DIST, rel);
  mkdirSync(dirname(distPath), { recursive: true });
  writeFileSync(distPath, content);
  const pubPath = join(PUBLIC, rel);
  mkdirSync(dirname(pubPath), { recursive: true });
  writeFileSync(pubPath, content);
}

function hreflangLinks(path, singleLang) {
  if (singleLang) {
    const href = absUrl(singleLang, path);
    return [
      `<link rel="alternate" hreflang="${singleLang}" href="${esc(href)}">`,
      `<link rel="alternate" hreflang="x-default" href="${esc(href)}">`,
    ].join('\n    ');
  }
  const lines = [];
  for (const l of LANGS) {
    lines.push(`<link rel="alternate" hreflang="${l}" href="${esc(absUrl(l, path))}">`);
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${esc(absUrl('en', path))}">`);
  return lines.join('\n    ');
}

function headBlock({ lang, path, title, description, noindex, singleLang, ogType, publishedTime }) {
  const canonical = absUrl(lang, path);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const verify = verificationMetas();
  const published = publishedTime
    ? `\n    <meta property="article:published_time" content="${esc(publishedTime)}">\n    <meta property="article:modified_time" content="${esc(publishedTime)}">`
    : '';
  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${esc(canonical)}">
    ${hreflangLinks(path, singleLang)}
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:type" content="${esc(ogType || 'website')}">
    <meta property="og:url" content="${esc(canonical)}">
    <meta property="og:image" content="${esc(BASE + CFG.og_image)}">
    <meta property="og:locale" content="${lang === 'en' ? 'en_US' : lang === 'fr' ? 'fr_FR' : lang === 'de' ? 'de_DE' : lang === 'nl' ? 'nl_BE' : 'it_IT'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(BASE + CFG.og_image)}">${published}
    ${verify ? verify + '\n    ' : ''}`.trimEnd();
}

function faqHtml(lang, pairs) {
  const list = pairs || FAQ[lang] || FAQ.en;
  const ui = PRERENDER_UI[lang] || PRERENDER_UI.en;
  return (
    `<section class="faq" id="faq"><h2>${esc(ui.faq)}</h2>` +
    list.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('') +
    `</section>`
  );
}

function prerenderBody(lang, path, page) {
  const pageFaq = PAGE_FAQS[path]?.[lang] || PAGE_FAQS[path]?.en;
  const showFaq = path === '' || path === 'faq' || !!pageFaq;
  const ui = PRERENDER_UI[lang] || PRERENDER_UI.en;
  const crumbs = (page.crumbs || [])
    .map(([name, p], i, arr) => {
      if (i === arr.length - 1) return `<li aria-current="page">${esc(name)}</li>`;
      return `<li><a href="${esc(absUrl(lang, p))}">${esc(name)}</a></li>`;
    })
    .join('');
  const cta =
    path.startsWith('employers/')
      ? ` · <a href="${esc(absUrl(lang, 'company/signup'))}">${esc(ui.companySignup)}</a>`
      : '';
  return `
    <article class="bd-prerender" data-bd-prerender="1">
      <nav class="crumbs" aria-label="${esc(ui.breadcrumb)}"><ol>${crumbs}</ol></nav>
      <h1>${esc(page.h1)}</h1>
      <p id="summary"><strong>${esc(IN_SHORT_LABEL[lang] || 'In short')}:</strong> ${esc(page.summary)}</p>
      ${showFaq ? faqHtml(lang, pageFaq) : ''}
      <p><a href="${esc(absUrl(lang, path))}">${esc(BRAND)}</a> · <a href="${esc(absUrl(lang, 'pricing'))}">${esc(ui.pricing)}</a>${cta}</p>
    </article>`;
}

function graphFor(lang, path) {
  const graph = [organizationLd(), websiteLd(), softwareApplicationLd()];
  const page = PAGES[path]?.[lang];
  if (page?.crumbs?.length) graph.push(breadcrumbLd(lang, page.crumbs));
  if (path === '' || path === 'faq') graph.push(faqLd(lang));
  const pageFaq = PAGE_FAQS[path]?.[lang] || PAGE_FAQS[path]?.en;
  if (pageFaq) graph.push(faqLd(lang, pageFaq));
  return graph;
}

const FRENCH_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

function frenchLongDate(iso) {
  const [year, month, day] = String(iso).split('-');
  return `${Number(day)} ${FRENCH_MONTHS[Number(month) - 1]} ${year}`;
}

export function frenchGuideDocumentParts(guide, h1, bodyHtml) {
  const title = `${h1} — BorderDay`;
  const head = headBlock({
    lang: 'fr',
    path: guide.path,
    title,
    description: guide.description,
    noindex: false,
    singleLang: 'fr',
    ogType: 'article',
    publishedTime: guide.datePublished,
  });
  const crumbs = [
    ['Accueil', ''],
    ['Particuliers', 'for-individuals'],
    [h1, guide.path],
  ];
  const crumbHtml = crumbs
    .map(([name, p], index, arr) => {
      if (index === arr.length - 1) return `<li aria-current="page">${esc(name)}</li>`;
      return `<li><a href="${esc(absUrl('fr', p))}">${esc(name)}</a></li>`;
    })
    .join('');
  const body = `
    <article class="bd-prerender guide-article" data-bd-prerender="1">
      <header class="hero article-hero">
        <div class="container article-wrap">
          <nav class="crumbs" aria-label="${esc(PRERENDER_UI.fr.breadcrumb)}"><ol>${crumbHtml}</ol></nav>
          <p class="article-kicker"><time datetime="${esc(guide.datePublished)}">${esc(frenchLongDate(guide.datePublished))}</time></p>
          <h1>${esc(h1)}</h1>
        </div>
      </header>
      <div class="section article-section">
        <div class="container article-wrap article-prose">
          ${bodyHtml}
        </div>
      </div>
    </article>`;
  const graph = [
    organizationLd(),
    websiteLd(),
    softwareApplicationLd(),
    breadcrumbLd('fr', crumbs),
    articleJsonLd(BASE, guide, h1),
  ];
  return { title, head, body, graph };
}

function injectHtml(template, { lang, path, title, description, noindex, bodyHtml, graph, singleLang, ogType, publishedTime }) {
  let html = template;
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${lang}"`);
  // Drop the stock <title>…</title>; we inject a full SEO head block.
  html = html.replace(/<title>[^<]*<\/title>\s*/i, '');
  const head = headBlock({ lang, path, title, description, noindex, singleLang, ogType, publishedTime });
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
  // Old invite links were /<lang>/join/<token> (404 on GitHub Pages). Rewrite to ?t=.
  const joinLegacyRedirect =
    '<script>(function(){try{var m=location.pathname.match(/^\\/(en|fr|de|it|nl)\\/join\\/([^\\/?#]+)\\/?$/);if(m)location.replace("/"+m[1]+"/join/?t="+encodeURIComponent(decodeURIComponent(m[2])));}catch(e){}})();</script>';
  writeFileSync(join(DIST, '404.html'), template.replace('<head>', '<head>' + joinLegacyRedirect));
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

  for (const guide of FRENCH_GUIDES) {
    const markdown = readFileSync(join(ROOT, 'src/content/articles', guide.file), 'utf8');
    const { h1, bodyHtml } = markdownToArticle(markdown);
    const parts = frenchGuideDocumentParts(guide, h1, bodyHtml);
    const html = injectHtml(template, {
      lang: 'fr',
      path: guide.path,
      title: parts.title,
      description: guide.description,
      noindex: false,
      bodyHtml: parts.body,
      graph: parts.graph,
      singleLang: 'fr',
      ogType: 'article',
      publishedTime: guide.datePublished,
    });
    const out = join(DIST, pageFile('fr', guide.path));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
  }

  console.log(
    `prerender: ${PUBLIC_PATHS.length * LANGS.length} public + ${FRENCH_GUIDES.length} french guides + ${NOINDEX_PATHS.length * LANGS.length} noindex shells, robots/sitemap/llms/IndexNow key`,
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
