/** The homepage uses normal HTTP caching; no worker may pin an old HTML release. */
export function pwaSettingsMarkup() { return ""; }
export async function initPwa(_notify: (message: string) => void) {
  // Compatibility hook for callers; cache retirement runs before the entry UI.
}
