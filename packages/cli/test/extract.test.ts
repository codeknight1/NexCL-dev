import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildSchemaFromFiles } from '../src/extractor/schemaBuilder';

describe('devcms extract', () => {
  it('finds useCMS and Inline* usages in fixtures', async () => {
    const root = path.join(__dirname, 'fixtures', 'simple-app');
    // Hero.tsx first so useCMS metadata (description) wins dedupe over page.tsx InlineText.
    const files = [
      path.join(root, 'components', 'Hero.tsx'),
      path.join(root, 'app', 'page.tsx'),
    ];

    const schema = await buildSchemaFromFiles(files);
    const keys = schema.fields.map((f) => `${f.namespace ?? 'default'}:${f.path}`).sort();
    expect(keys).toContain('marketing:homepage.hero.title');

    const hero = schema.fields.find((f) => f.description === 'Hero title');
    expect(hero?.kind).toBe('text');
  });
});

