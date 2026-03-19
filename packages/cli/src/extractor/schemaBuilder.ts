import type { ExtractedField, ExtractedSchema } from './types';
import { extractFieldsFromFile } from './swcParser';

export async function buildSchemaFromFiles(files: string[]): Promise<ExtractedSchema> {
  const fields: ExtractedField[] = [];
  for (const file of files) {
    const fileFields = await extractFieldsFromFile(file);
    fields.push(...fileFields);
  }

  const seen = new Set<string>();
  const deduped: ExtractedField[] = [];
  for (const field of fields) {
    const key = `${field.namespace ?? 'default'}:${field.path}:${field.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(field);
  }

  return { fields: deduped };
}

