export interface ClipboardProvider {
  writeText: (text: string) => Promise<void>;
}

/**
 * Safely copies a given string to the system clipboard.
 * Supports the modern asynchronous Clipboard API with a fallback for older/sandboxed contexts.
 * Accepts an optional custom ClipboardProvider for dependency injection and testing.
 * Guaranteed never to throw uncaught exceptions or reject promises.
 */
export async function copyToClipboard(
  text: string,
  customClipboard?: ClipboardProvider | null
): Promise<boolean> {
  // 1. Try custom clipboard or modern navigator.clipboard API
  const clipboard =
    customClipboard !== undefined
      ? customClipboard
      : typeof navigator !== 'undefined' && navigator.clipboard
        ? navigator.clipboard
        : null;

  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or non-secure context; fall through to fallback
    }
  }

  // 2. Fallback using temporary textarea and document.execCommand('copy')
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      // Prevent scrolling to bottom of page in iOS/Safari
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('aria-hidden', 'true');

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Boolean(success);
    } catch {
      return false;
    }
  }

  return false;
}
