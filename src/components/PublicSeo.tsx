import type { ComponentProps } from 'react';
import { pageSeo } from '../seo/pageSeo';
import { useLang } from './Layout';
import Seo from './Seo';

type SeoProps = ComponentProps<typeof Seo>;

/** Public-page head from the shared seo.mjs table (via heads.json). */
export default function PublicSeo({ path, ...rest }: { path: string } & Omit<SeoProps, 'lang' | 'title' | 'description' | 'path'>) {
  const lang = useLang();
  const head = pageSeo(lang, path);
  return <Seo lang={lang} title={head.title} description={head.description} path={path} {...rest} />;
}
