import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../lib/auth';

export { employerFaqPairs, faqPagePairs } from '../seo/visibleFaq';

/** Logged-out markup for one public URL. Head tags are applied by the prerender script. */
export function renderRoute(url: string): string {
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}
