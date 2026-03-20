import { useCallback, useMemo } from 'react';

import { useCMS } from '../hooks/useCMS';
import { useCMSEditMode } from '../editMode/useCMSEditMode';
import { sanitizeRichText } from '../sanitize';

export interface InlineRichTextProps {
  path: string;
  fallback?: string;
  namespace?: string;
}

const EDIT_STYLE: React.CSSProperties = {
  outline: '1px dashed rgba(120, 120, 120, 0.9)',
  outlineOffset: 2,
  borderRadius: 6,
  padding: 4,
  minHeight: 24,
};

/**
 * Inline rich-text editor that sanitizes on save and on render.
 */
export function InlineRichText(props: InlineRichTextProps) {
  const { isEditing } = useCMSEditMode();
  const [value, setValue] = useCMS(props.path, props.fallback ?? '', {
    ...(props.namespace ? { namespace: props.namespace } : {}),
    type: 'rich-text',
  });

  const safeHtml = useMemo(() => sanitizeRichText(value), [value]);

  const onInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      const next = (e.currentTarget as HTMLElement).innerHTML ?? '';
      setValue(sanitizeRichText(next));
    },
    [setValue],
  );

  if (!isEditing) {
    return <span dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      style={EDIT_STYLE}
      data-devcms-inline="rich-text"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

