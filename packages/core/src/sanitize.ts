import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'code',
  'pre',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
];

const ALLOWED_ATTR: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'rel', 'target'],
};

/**
 * Sanitizes rich-text HTML for safe rendering and safe persistence.
 *
 * This is intentionally conservative: it strips scripts/styles and blocks
 * arbitrary attributes (including `on*` handlers).
 */
export function sanitizeRichText(dirtyHtml: string): string {
  return sanitizeHtml(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}

