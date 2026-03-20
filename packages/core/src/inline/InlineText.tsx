import { useCallback } from 'react';

import { useCMS } from '../hooks/useCMS';
import { useCMSEditMode } from '../editMode/useCMSEditMode';

export interface InlineTextProps {
  path: string;
  fallback?: string;
  namespace?: string;
}

const EDIT_STYLE: React.CSSProperties = {
  outline: '1px dashed rgba(120, 120, 120, 0.9)',
  outlineOffset: 2,
  borderRadius: 4,
};

/**
 * Inline text editor that becomes editable only in edit mode.
 */
export function InlineText(props: InlineTextProps) {
  const { isEditing } = useCMSEditMode();
  const [value, setValue] = useCMS(props.path, props.fallback ?? '', {
    ...(props.namespace ? { namespace: props.namespace } : {}),
    type: 'text',
  });

  const onInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      const next = (e.currentTarget.textContent ?? '').toString();
      setValue(next);
    },
    [setValue],
  );

  if (!isEditing) return <>{value}</>;

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      style={EDIT_STYLE}
      data-devcms-inline="text"
    >
      {value}
    </span>
  );
}

