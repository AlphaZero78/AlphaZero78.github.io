export const REDACTION_WAIT_SECONDS = 0.25;
export const REDACTION_REVEAL_SECONDS = 0.95;

export function redactionProgress(elapsedSinceReady: number) {
  return Math.min(1, Math.max(0,
    (elapsedSinceReady - REDACTION_WAIT_SECONDS) / REDACTION_REVEAL_SECONDS));
}
