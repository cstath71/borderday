import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import itDict from '../src/i18n/it';

const root = resolve(__dirname, '..');
const src = join(root, 'src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Static imports only: `import(...)` is how App.tsx keeps /demo out of the main bundle. */
function staticImports(file: string): string[] {
  const text = readFileSync(file, 'utf8');
  const specs = [...text.matchAll(/^\s*(?:import|export)\s[^;]*?from\s+'([^']+)'/gm), ...text.matchAll(/^\s*import\s+'([^']+)'/gm)];
  return specs
    .map((m) => m[1])
    .filter((s) => s.startsWith('.'))
    .flatMap((s) => {
      const base = resolve(dirname(file), s);
      return [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), base].filter(
        (p) => existsSync(p) && statSync(p).isFile(),
      ).slice(0, 1);
    });
}

function closure(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const f = queue.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    queue.push(...staticImports(f));
  }
  return seen;
}

const MOCK = join(src, 'lib/supabaseMock.ts');
const API = join(src, 'lib/companyApi.ts');

describe('production routes never reach the mock (C8)', () => {
  it('the walker can find the mock when it is there', () => {
    expect(closure(join(src, 'pages/demo/DemoRoutes.tsx')).has(MOCK)).toBe(true);
  });

  for (const page of ['App.tsx', 'main.tsx', 'company/buildRows.ts']) {
    it(`${page} has no static path to supabaseMock`, () => {
      expect(closure(join(src, page)).has(MOCK)).toBe(false);
    });
  }

  for (const page of ['Dashboard', 'Invite', 'Join', 'History', 'Signup']) {
    it(`company/${page} imports companyApi and has no path to supabaseMock`, () => {
      const graph = closure(join(src, `pages/company/${page}.tsx`));
      expect(graph.has(API)).toBe(true);
      expect(graph.has(MOCK)).toBe(false);
    });
  }

  it('AppPage uses companyApi and has no path to supabaseMock', () => {
    const graph = closure(join(src, 'pages/AppPage.tsx'));
    expect(graph.has(API)).toBe(true);
    expect(graph.has(MOCK)).toBe(false);
  });

  it('only pages/demo imports supabaseMock', () => {
    const importers = walk(src)
      .filter((f) => f !== MOCK && /\.tsx?$/.test(f) && /from '.*supabaseMock'/.test(readFileSync(f, 'utf8')))
      .map((f) => relative(src, f));
    expect(importers).toEqual(['pages/demo/DemoRoutes.tsx']);
  });

  it('App.tsx loads demo routes lazily, at /demo', () => {
    const app = readFileSync(join(src, 'App.tsx'), 'utf8');
    expect(app).toMatch(/lazy\(\(\) => import\('\.\/pages\/demo\/DemoRoutes'\)\)/);
    expect(app).toContain('path="demo/*"');
  });
});

describe('no backend-mode text for customers (L3)', () => {
  it('no page or component mentions the mock backend', () => {
    for (const f of walk(src)) {
      if (f === MOCK || !/\.tsx?$/.test(f)) continue;
      const text = readFileSync(f, 'utf8');
      expect(text, f).not.toMatch(/local-mock|backendMode|getBackendMode|backend-mode/);
    }
  });

  it('i18n no longer has a backend label', () => {
    for (const dict of [en, fr, de, itDict]) {
      expect(dict.company).not.toHaveProperty('backendMode');
    }
  });

  it('README states live payments and gated Resend', () => {
    const readme = readFileSync(join(root, 'README.md'), 'utf8');
    expect(readme).toMatch(/Stripe Checkout live/);
    expect(readme).toMatch(/RESEND_LIVE=1/);
    expect(readme).not.toMatch(/TEST prep|domain setup required/);
  });
});

describe('no HR path selects the note column', () => {
  it('companyApi reads company day logs only through the RPC', () => {
    const api = readFileSync(API, 'utf8');
    expect(api).toContain("'bd_list_day_records'");
    expect(api).toContain("'bd_list_day_types'");
    expect(api).toContain('.rpc(rpc,');
    expect(api).not.toMatch(/from\('bd_day_logs'\)\s*\.select/);
    const code = api.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    expect(code).not.toMatch(/\bnote\b/);
  });
});
