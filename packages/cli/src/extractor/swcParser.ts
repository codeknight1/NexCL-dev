import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parse } from '@swc/core';
import type {
  CallExpression,
  Expression,
  JSXAttribute,
  JSXElement,
  JSXOpeningElement,
  JSXText,
  Module,
  StringLiteral,
} from '@swc/core';

import type { ExtractedField, FieldKind } from './types';

export async function extractFieldsFromFile(filePath: string): Promise<ExtractedField[]> {
  const code = await readFile(filePath, 'utf8');
  const ext = path.extname(filePath);
  const isTsx = ext === '.tsx';

  const ast = await parse(code, {
    syntax: 'typescript',
    tsx: isTsx,
  });

  const fields: ExtractedField[] = [];
  walkModule(ast, (node) => {
    if (isUseCMSCall(node)) {
      const field = extractFromUseCMS(node, filePath);
      if (field) fields.push(field);
    } else if (isJSXElementNode(node)) {
      const field = extractFromInlineComponent(node, filePath);
      if (field) fields.push(field);
    }
  });

  return fields;
}

type Visitor = (node: any) => void;

function walkModule(mod: Module, visit: Visitor) {
  const stack: any[] = [mod];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    visit(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') stack.push(item);
        }
      } else if (value && typeof value === 'object') {
        stack.push(value);
      }
    }
  }
}

function isUseCMSCall(node: any): node is CallExpression {
  return (
    node &&
    node.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    node.callee.value === 'useCMS'
  );
}

function extractFromUseCMS(node: CallExpression, filePath: string): ExtractedField | null {
  const args = node.arguments;
  if (args.length < 2) return null;

  const pathArg = args[0]?.expression;
  const fallbackArg = args[1]?.expression;
  const optionsArg = args[2]?.expression;
  if (!pathArg || !fallbackArg) return null;
  if (!isStringLiteral(pathArg)) return null;

  const { namespace, type, description } = parseUseCMSOptions(optionsArg);
  const kind: FieldKind = type === 'rich-text' ? 'rich-text' : 'text';

  return {
    namespace,
    path: pathArg.value,
    kind,
    description,
    defaultValue: literalToValue(fallbackArg),
    sourceFile: filePath,
  };
}

function parseUseCMSOptions(expr: Expression | undefined): {
  namespace?: string;
  type?: string;
  description?: string;
} {
  if (!expr || expr.type !== 'ObjectExpression') return {};
  const result: { namespace?: string; type?: string; description?: string } = {};

  for (const prop of expr.properties) {
    if (prop.type !== 'KeyValueProperty') continue;
    const key = prop.key.type === 'Identifier' ? prop.key.value : undefined;
    if (!key) continue;
    if (key === 'namespace' && isStringLiteral(prop.value)) result.namespace = prop.value.value;
    if (key === 'type' && isStringLiteral(prop.value)) result.type = prop.value.value;
    if (key === 'description' && isStringLiteral(prop.value)) result.description = prop.value.value;
  }

  return result;
}

function isJSXElementNode(node: any): node is JSXElement {
  return node && node.type === 'JSXElement';
}

function extractFromInlineComponent(node: JSXElement, filePath: string): ExtractedField | null {
  const opening = node.opening as JSXOpeningElement;
  if (opening.name.type !== 'Identifier') return null;
  const name = opening.name.value;
  if (name !== 'InlineText' && name !== 'InlineRichText') return null;

  const attrs = opening.attributes.filter((a): a is JSXAttribute => a.type === 'JSXAttribute');
  const pathAttr = attrs.find((a) => a.name.type === 'Identifier' && a.name.value === 'path');
  if (!pathAttr || !pathAttr.value || pathAttr.value.type !== 'StringLiteral') return null;

  const nsAttr = attrs.find((a) => a.name.type === 'Identifier' && a.name.value === 'namespace');
  const descAttr = attrs.find(
    (a) => a.name.type === 'Identifier' && a.name.value === 'description',
  );

  const kind: FieldKind = name === 'InlineRichText' ? 'rich-text' : 'text';
  const fallback = extractInlineFallback(node);

  return {
    namespace: nsAttr?.value?.type === 'StringLiteral' ? nsAttr.value.value : undefined,
    path: pathAttr.value.value,
    kind,
    description: descAttr?.value?.type === 'StringLiteral' ? descAttr.value.value : undefined,
    defaultValue: fallback,
    sourceFile: filePath,
  };
}

function extractInlineFallback(node: JSXElement): unknown {
  const first = node.children.find((c) => c.type === 'JSXText') as JSXText | undefined;
  if (!first) return undefined;
  const v = first.value.trim();
  return v.length ? v : undefined;
}

function isStringLiteral(expr: Expression): expr is StringLiteral {
  return expr.type === 'StringLiteral';
}

function literalToValue(expr: Expression): unknown {
  switch (expr.type) {
    case 'StringLiteral':
      return expr.value;
    case 'NumericLiteral':
      return expr.value;
    case 'BooleanLiteral':
      return expr.value;
    case 'NullLiteral':
      return null;
    default:
      return undefined;
  }
}

