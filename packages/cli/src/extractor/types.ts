export type FieldKind = 'text' | 'rich-text';

export interface ExtractedField {
  namespace?: string;
  path: string;
  kind: FieldKind;
  description?: string;
  defaultValue?: unknown;
  sourceFile: string;
}

export interface ExtractedSchema {
  fields: ExtractedField[];
}

