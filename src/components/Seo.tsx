import { useEffect } from 'react';
import { LANGS, type Lang } from '../i18n';

const BASE = 'https://borderday.com';

interface Props {
  lang: Lang;
  title: string;
  description: string;
  path: string; // without lang prefix, e.g. "" or "pricing"
  /** When true, emit FAQPage JSON-LD from pairs. */
  faq?: readonly (readonly [string, string])[];
  noindex?: boolean;
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
  };
}

function softwareGraph() {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${BASE}/#app`,
    name: 'BorderDay',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${BASE}/`,
    offers: [
      {
        '@type': 'Offer',
        name: 'Company monthly (per active employee)',
        price: '5.00',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Company yearly minimum',
        price: '390.00',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Individual monthly',
        price: '4.99',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Individual yearly',
        price: '49.00',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
    ],
    publisher: { '@id': `${BASE}/#org` },
  };
}

export default function Seo({ lang, title, description, path, faq, noindex }: Props) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = title;
    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:image', `${BASE}/og.png`, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', `${BASE}/og.png`);

    const suffix = path ? `/${path}` : '/';
    const canonical = `${BASE}/${lang}${suffix === '/' ? '/' : suffix}`;
    setLink('canonical', canonical);
    setMeta('og:url', canonical, true);

    document.head.querySelectorAll('link[data-hreflang]').forEach((n) => n.remove());
    for (const l of LANGS) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = l;
      link.href = `${BASE}/${l}${suffix === '/' ? '/' : suffix}`;
      link.setAttribute('data-hreflang', l);
      document.head.appendChild(link);
    }
    const xd = document.createElement('link');
    xd.rel = 'alternate';
    xd.hreflang = 'x-default';
    xd.href = `${BASE}/en${suffix === '/' ? '/' : suffix}`;
    xd.setAttribute('data-hreflang', 'x-default');
    document.head.appendChild(xd);

    const graph: object[] = [
      orgGraph(),
      {
        '@type': 'WebSite',
        '@id': `${BASE}/#website`,
        name: 'BorderDay',
        url: `${BASE}/`,
        publisher: { '@id': `${BASE}/#org` },
      },
      softwareGraph(),
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
    // Breadcrumb for non-home
    if (path) {
      const name = title.split('—')[0]?.trim() || path;
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/${lang}/` },
          { '@type': 'ListItem', position: 2, name, item: canonical },
        ],
      });
    }

    let ld = document.getElementById('bd-jsonld');
    if (!ld) {
      ld = document.createElement('script');
      ld.id = 'bd-jsonld';
      (ld as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }, [lang, title, description, path, faq, noindex]);

  return null;
}
