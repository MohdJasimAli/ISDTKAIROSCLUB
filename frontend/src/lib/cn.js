// Tiny class joiner — no external dependency needed.
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
