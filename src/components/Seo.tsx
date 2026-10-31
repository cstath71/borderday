import { useEffect } from 'react';
import { LANGS, type Lang } from '../i18n';

interface Props {
  lang: Lang;
  title: string;
  description: string;
  path: string; // without lang prefix, e.g. "" or "pricing"
}

export default function Seo({ lang, title, description, path }: Props) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = title;
    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:image', 'https://borderday.com/og.png', true);
    setMeta('twitter:card', 'summary_large_image');

    // hreflang link tags
    document.head.querySelectorAll('link[data-hreflang]').forEach((n) => n.remove());
    const suffix = path ? `/${path}` : '/';
    for (const l of LANGS) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = l;
      link.href = `https://borderday.com/${l}${suffix === '/' ? '/' : suffix}`;
      link.setAttribute('data-hreflang', l);
      document.head.appendChild(link);
    }
    const xd = document.createElement('link');
    xd.rel = 'alternate';
    xd.hreflang = 'x-default';
    xd.href = `https://borderday.com/en${suffix === '/' ? '/' : suffix}`;
    xd.setAttribute('data-hreflang', 'x-default');
    document.head.appendChild(xd);

    // JSON-LD
    let ld = document.getElementById('bd-jsonld');
    if (!ld) {
      ld = document.createElement('script');
      ld.id = 'bd-jsonld';
      (ld as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'BorderDay',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '4.99',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/PreOrder',
      },
      description,
      inLanguage: LANGS,
      url: 'https://borderday.com',
    });
  }, [lang, title, description, path]);

  return null;
}
