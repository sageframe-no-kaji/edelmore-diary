/**
 * Compute the new textarea value and cursor position after inserting `text`
 * at the current cursor position. If the textarea has a selection, that
 * range is replaced.
 *
 * Two composition touches that make voice-transcribed text feel composed
 * rather than pasted:
 *   - leading space: prepend a space when inserting after non-whitespace
 *   - leading lowercase: lowercase the first character when inserting
 *     mid-sentence (last non-whitespace character isn't `.!?`)
 */
export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string
): { newValue: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);

  const needsLeadingSpace = before.length > 0 && !/\s$/.test(before) && !/^\s/.test(text);

  const trimmedBefore = before.trimEnd();
  const lastChar = trimmedBefore.slice(-1);
  const midSentence = trimmedBefore.length > 0 && !'.!?'.includes(lastChar);

  let body = text;
  if (midSentence && body.length > 0 && /[A-Z]/.test(body[0])) {
    body = body[0].toLowerCase() + body.slice(1);
  }

  const insertion = (needsLeadingSpace ? ' ' : '') + body;
  const newValue = before + insertion + after;
  const cursorPos = start + insertion.length;
  return { newValue, cursorPos };
}
