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
import { GUIDE_FAQ } from '../src/content/guideFaq.mjs';
import { HUB_BY_LANG } from '../src/content/guideHub.mjs';
import {
  BASE,
  BRAND,
  CFG,
  FAQ,
  ALL_GUIDES,
  GUIDE_HUB_LANGS,
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
  hubIndexMarkdown,
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

function headBlock({ lang, path, title, description, noindex, singleLang, ogType, publishedTime, modifiedTime, ogImage }) {
  const canonical = absUrl(lang, path);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const verify = verificationMetas();
  const image = `${BASE}${ogImage || CFG.og_image}`;
  const published = publishedTime
    ? `\n    <meta property="article:published_time" content="${esc(publishedTime)}">\n    <meta property="article:modified_time" content="${esc(modifiedTime || publishedTime)}">`
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
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:locale" content="${lang === 'en' ? 'en_US' : lang === 'fr' ? 'fr_FR' : lang === 'de' ? 'de_DE' : lang === 'nl' ? 'nl_BE' : 'it_IT'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(image)}">${published}
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

function graphFor(lang, path, extras = []) {
  const graph = [organizationLd(), websiteLd(lang), softwareApplicationLd(lang)];
  const page = PAGES[path]?.[lang];
  if (page?.crumbs?.length) graph.push(breadcrumbLd(lang, page.crumbs));
  for (const node of extras) graph.push(node);
  return graph;
}

const GUIDE_MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
};

const GUIDE_UI = {
  en: { home: 'Home', guides: 'Guides' },
  fr: { home: 'Accueil', guides: 'Guides' },
  de: { home: 'Start', guides: 'Leitfäden' },
  it: { home: 'Home', guides: 'Guide' },
};

function guideLongDate(lang, iso) {
  const [year, month, day] = String(iso).split('-');
  const name = GUIDE_MONTHS[lang][Number(month) - 1];
  if (lang === 'de') return `${Number(day)}. ${name} ${year}`;
  return `${Number(day)} ${name} ${year}`;
}

export function frenchGuideDocumentParts(guide, h1, bodyHtml) {
  const lang = guide.lang || 'fr';
  const ui = GUIDE_UI[lang];
  const title = guide.title || `${h1} — BorderDay`;
  const head = headBlock({
    lang,
    path: guide.path,
    title,
    description: guide.description,
    noindex: false,
    singleLang: lang,
    ogType: 'article',
    publishedTime: guide.datePublished,
    modifiedTime: guide.dateModified || guide.datePublished,
    ogImage: guide.ogImage,
  });
  const crumbs = [
    [ui.home, ''],
    [ui.guides, 'guides'],
    [h1, guide.path],
  ];
  const crumbHtml = crumbs
    .map(([name, p], index, arr) => {
      if (index === arr.length - 1) return `<li aria-current="page">${esc(name)}</li>`;
      return `<li><a href="${esc(absUrl(lang, p))}">${esc(name)}</a></li>`;
    })
    .join('');
  const body = `
    <article class="bd-prerender guide-article" data-bd-prerender="1">
      <header class="hero article-hero">
        <div class="container article-wrap">
          <nav class="crumbs" aria-label="${esc(PRERENDER_UI[lang].breadcrumb)}"><ol>${crumbHtml}</ol></nav>
          <time class="article-kicker" datetime="${esc(guide.datePublished)}">${esc(guideLongDate(lang, guide.datePublished))}</time>
          <h1>${esc(h1)}</h1>
        </div>
      </header>
      <div class="section article-section">
        <div class="container article-wrap article-prose">
          ${bodyHtml}
        </div>
      </div>
    </article>`;
  const faq = GUIDE_FAQ[guide.id];
  const graph = [
    organizationLd(),
    websiteLd(lang),
    softwareApplicationLd(lang),
    breadcrumbLd(lang, crumbs),
    articleJsonLd(BASE, { ...guide, markdown: guide.markdown }, h1),
    ...(faq ? [faqLd(lang, faq)] : []),
  ];
  return { title, head, body, graph };
}

function injectHtml(template, { lang, path, title, description, noindex, bodyHtml, graph, singleLang, ogType, publishedTime, modifiedTime, ogImage }) {
  let html = template;
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${lang}"`);
  // Drop the stock <title>…</title>; we inject a full SEO head block.
  html = html.replace(/<title>[^<]*<\/title>\s*/i, '');
  const head = headBlock({ lang, path, title, description, noindex, singleLang, ogType, publishedTime, modifiedTime, ogImage });
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

async function loadRenderer() {
  const bundle = join(ROOT, 'dist-ssr/entry.js');
  if (!existsSync(bundle)) {
    console.error('dist-ssr/entry.js missing — run vite build --ssr src/prerender/entry.tsx --outDir dist-ssr');
    process.exit(1);
  }
  const entry = await import(pathToFileURL(bundle).href);
  return { renderRoute: entry.renderRoute, faqPagePairs: entry.faqPagePairs, employerFaqPairs: entry.employerFaqPairs };
}

/** React SSR prints the DOM property name. HTML crawlers look for the datetime attribute. */
function htmlTimeDatetime(html) {
  return html.replaceAll(' dateTime="', ' datetime="');
}

function renderedBody(renderRoute, url) {
  const slash = url.endsWith('/') ? url : `${url}/`;
  let html = renderRoute(slash);
  if (!html.includes('<footer')) html = renderRoute(slash.replace(/\/$/, '') || '/');
  if (!html.includes('<footer')) throw new Error(`Prerender produced no page footer for ${url}`);
  return html;
}

function visibleFaqNode(lang, path, faqPagePairs, employerFaqPairs) {
  if (path === 'faq') return faqLd(lang, faqPagePairs(lang));
  if (path === 'employers/ticino') return faqLd(lang, employerFaqPairs(lang, 'ticino'));
  if (path === 'employers/geneva') return faqLd(lang, employerFaqPairs(lang, 'geneva'));
  if (path === 'employers/luxembourg') return faqLd(lang, employerFaqPairs(lang, 'luxembourg'));
  return null;
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/index.html missing — run vite build first');
    process.exit(1);
  }
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  const { renderRoute, faqPagePairs, employerFaqPairs } = await loadRenderer();

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
      bodyHtml: renderedBody(renderRoute, '/en/'),
      graph: graphFor('en', '', [visibleFaqNode('en', '', faqPagePairs, employerFaqPairs)].filter(Boolean)),
    }),
  );

  for (const lang of LANGS) {
    for (const path of PUBLIC_PATHS) {
      const page = PAGES[path][lang];
      const rel = pageFile(lang, path);
      const url = path ? `/${lang}/${path}/` : `/${lang}/`;
      const faqNode = visibleFaqNode(lang, path, faqPagePairs, employerFaqPairs);
      const html = injectHtml(template, {
        lang,
        path,
        title: page.title,
        description: page.description,
        noindex: false,
        bodyHtml: renderedBody(renderRoute, url),
        graph: graphFor(lang, path, faqNode ? [faqNode] : []),
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

  for (const lang of GUIDE_HUB_LANGS) {
    const hub = HUB_BY_LANG[lang];
    const ui = GUIDE_UI[lang];
    const guides = ALL_GUIDES.filter((guide) => (guide.lang || 'fr') === lang);
    const hubUrl = `/${lang}/${hub.path}/`;
    const itemList = {
      '@type': 'ItemList',
      itemListElement: guides.map((guide, index) => {
        const markdown = readFileSync(join(ROOT, 'src/content/articles', guide.file), 'utf8');
        const { h1 } = markdownToArticle(markdown);
        const brief = (markdown.match(hub.briefRe) || [])[1]?.replace(/\*\*/g, '').trim() || '';
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: h1,
          url: absUrl(lang, guide.path),
          description: brief,
        };
      }),
    };
    const html = injectHtml(template, {
      lang,
      path: hub.path,
      title: hub.title,
      description: hub.description,
      noindex: false,
      bodyHtml: renderedBody(renderRoute, hubUrl),
      graph: graphFor(lang, hub.path, [
        breadcrumbLd(lang, [
          [ui.home, ''],
          [ui.guides, 'guides'],
        ]),
        {
          '@type': 'CollectionPage',
          '@id': `${BASE}/${lang}/guides/#collection`,
          name: hub.h1,
          description: hub.description,
          inLanguage: lang,
          url: `${BASE}/${lang}/guides/`,
          mainEntity: itemList,
        },
        itemList,
      ]),
      singleLang: lang,
    });
    const out = join(DIST, pageFile(lang, hub.path));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    writeBoth(pageFile(lang, hub.path).replace(/index\.html$/, 'index.md'), hubIndexMarkdown(lang));
  }

  for (const guide of ALL_GUIDES) {
    const lang = guide.lang || 'fr';
    const markdown = readFileSync(join(ROOT, 'src/content/articles', guide.file), 'utf8');
    const { h1 } = markdownToArticle(markdown);
    const withMarkdown = { ...guide, markdown, h1 };
    const parts = frenchGuideDocumentParts(withMarkdown, h1, '');
    const html = htmlTimeDatetime(injectHtml(template, {
      lang,
      path: guide.path,
      title: parts.title,
      description: guide.description,
      noindex: false,
      bodyHtml: renderedBody(renderRoute, `/${lang}/${guide.path}/`),
      graph: parts.graph,
      singleLang: lang,
      ogType: 'article',
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified || guide.datePublished,
      ogImage: guide.ogImage,
    }));
    const out = join(DIST, pageFile(lang, guide.path));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    writeBoth(pageFile(lang, guide.path).replace(/index\.html$/, 'index.md'), markdown.endsWith('\n') ? markdown : `${markdown}\n`);
  }

  console.log(
    `prerender: ${PUBLIC_PATHS.length * LANGS.length} public + ${GUIDE_HUB_LANGS.length} guide hubs + ${ALL_GUIDES.length} guides + ${NOINDEX_PATHS.length * LANGS.length} noindex shells, robots/sitemap/llms/IndexNow key`,
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
