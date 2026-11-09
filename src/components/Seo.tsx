import { useEffect } from 'react';
import { getDict, LANGS, type Lang } from '../i18n';
import heads from '../seo/heads.json';
import { ORG_SAME_AS, offersFor } from '../seo/offers.mjs';

const BASE = 'https://borderday.com';

interface Crumb {
  name: string;
  path: string;
}

interface Props {
  lang: Lang;
  title: string;
  description: string;
  path: string; // without lang prefix, e.g. "" or "pricing"
  /** When true, emit FAQPage JSON-LD from pairs. */
  faq?: readonly (readonly [string, string])[];
  noindex?: boolean;
  /** Languages that really exist for this path. Omit to advertise every site language. */
  alternates?: readonly Lang[];
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  /** Path under the site origin, e.g. /og.png or /og-guide-luxembourg.png. */
  ogImage?: string;
  breadcrumb?: readonly Crumb[];
  extraGraph?: readonly object[];
}

function setMeta(name: string, content: string, prop = false) {
  const attr = prop ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeMeta(name: string, prop = false) {
  const attr = prop ? 'property' : 'name';
  document.head.querySelector(`meta[${attr}="${name}"]`)?.remove();
}

function setLink(rel: string, href: string, attrs: Record<string, string> = {}) {
  const sel = Object.entries(attrs)
    .map(([k, v]) => `[${k}="${v}"]`)
    .join('');
  let el = document.head.querySelector(`link[rel="${rel}"]${sel}`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.href = href;
}

function orgGraph() {
  return {
    '@type': 'Organization',
    '@id': `${BASE}/#org`,
    name: 'BorderDay',
    url: `${BASE}/`,
    logo: `${BASE}/icons/icon-512.png`,
    email: 'hello@borderday.com',
    sameAs: ORG_SAME_AS,
  };
}

function softwareGraph(lang: Lang) {
  const home = heads[''][lang];
  return {
    '@type': 'SoftwareApplication',
    '@id': `${BASE}/#app`,
    name: 'BorderDay',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${BASE}/`,
    description: home.summary,
    inLanguage: lang,
    offers: offersFor(lang, `${BASE}/${lang}/pricing/`),
    publisher: { '@id': `${BASE}/#org` },
  };
}

export default function Seo({
  lang,
  title,
  description,
  path,
  faq,
  noindex,
  alternates,
  ogType,
  publishedTime,
  modifiedTime,
  ogImage,
  breadcrumb,
  extraGraph,
}: Props) {
  useEffect(() => {
    const image = `${BASE}${ogImage || '/og.png'}`;
    document.documentElement.lang = lang;
    document.title = title;
    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType ?? 'website', true);
    setMeta('og:image', image, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    if (publishedTime) {
      setMeta('article:published_time', publishedTime, true);
      setMeta('article:modified_time', modifiedTime || publishedTime, true);
    } else {
      removeMeta('article:published_time', true);
      removeMeta('article:modified_time', true);
    }

    const canonical = path ? `${BASE}/${lang}/${path}/` : `${BASE}/${lang}/`;
    setLink('canonical', canonical);
    setMeta('og:url', canonical, true);

    const localeList = alternates ?? LANGS;
    const singleLocale = Boolean(alternates && alternates.length === 1);
    // Replace every alternate, including tags the static HTML already wrote, so hydration does not duplicate them.
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove());
    for (const l of localeList) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = l;
      link.href = singleLocale ? canonical : path ? `${BASE}/${l}/${path}/` : `${BASE}/${l}/`;
      link.setAttribute('data-hreflang', l);
      document.head.appendChild(link);
    }
    const xd = document.createElement('link');
    xd.rel = 'alternate';
    xd.hreflang = 'x-default';
    xd.href = singleLocale ? canonical : path ? `${BASE}/en/${path}/` : `${BASE}/en/`;
    xd.setAttribute('data-hreflang', 'x-default');
    document.head.appendChild(xd);

    const home = heads[''][lang];
    const graph: object[] = [
      orgGraph(),
      {
        '@type': 'WebSite',
        '@id': `${BASE}/#website`,
        name: 'BorderDay',
        url: `${BASE}/`,
        description: home.description,
        inLanguage: lang,
        publisher: { '@id': `${BASE}/#org` },
      },
      softwareGraph(lang),
    ];
    if (faq && faq.length) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      });
    }
    if (breadcrumb && breadcrumb.length) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.path ? `${BASE}/${lang}/${crumb.path}/` : `${BASE}/${lang}/`,
        })),
      });
    } else if (path) {
      const name = title.split('—')[0]?.trim() || path;
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: getDict(lang).nav.home, item: `${BASE}/${lang}/` },
          { '@type': 'ListItem', position: 2, name, item: canonical },
        ],
      });
    }
    if (extraGraph?.length) graph.push(...extraGraph);

    let ld = document.getElementById('bd-jsonld');
    if (!ld) {
      ld = document.createElement('script');
      ld.id = 'bd-jsonld';
      (ld as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }, [lang, title, description, path, faq, noindex, alternates, ogType, publishedTime, modifiedTime, ogImage, breadcrumb, extraGraph]);

  return null;
}
