export function articleJsonLd(
  base: string,
  guide: { path: string; description: string; datePublished: string },
  h1: string,
): {
  '@type': string;
  headline: string;
  description: string;
  inLanguage: string;
  datePublished: string;
  dateModified: string;
  author: { '@id': string };
  publisher: { '@id': string };
};
