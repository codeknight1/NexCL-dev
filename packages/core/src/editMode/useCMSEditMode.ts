import { useEffect } from 'react';
import { useStore } from 'zustand';

import { editModeStore } from './store';

let hotkeyInstalled = false;

function installHotkeyOnce() {
  if (hotkeyInstalled) return;
  if (typeof window === 'undefined') return;
  hotkeyInstalled = true;

  window.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl/Cmd + Shift + E
    if (mod && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      editModeStore.getState().toggleEditMode();
    }
  });
}

/**
 * Global edit-mode state for DevCMS inline editing.
 *
 * Includes a default keyboard shortcut: **Ctrl/Cmd + Shift + E**.
 */
export function useCMSEditMode() {
  useEffect(() => {
    installHotkeyOnce();
  }, []);

  const isEditing = useStore(editModeStore, (s) => s.isEditing);
  const toggleEditMode = useStore(editModeStore, (s) => s.toggleEditMode);

  return { isEditing, toggleEditMode } as const;
}

