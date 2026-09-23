/** Moves keyboard focus to the first invalid control after React renders the error state. */
export default function focusFirstError(errors, ids = {}) {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  const id = ids[firstKey] ?? firstKey;
  window.setTimeout(() => document.getElementById(id)?.focus(), 0);
}
