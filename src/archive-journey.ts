export type JourneyPhase = "idle" | "closing" | "moving" | "opening";
export type JourneyReadiness = { closed: boolean; aligned: boolean; opened: boolean };

/** Advance only after the actual scene reaches each pose, never on guessed delays. */
export class ArchiveJourney {
  phase: JourneyPhase = "idle";
  target = 0;
  private nextAllowed = 0;
  get active() { return this.phase !== "idle"; }

  begin(current: number, direction: number, count: number, now: number) {
    if (this.active || now < this.nextAllowed || count < 2 || !direction) return false;
    this.target = (current + Math.sign(direction) + count) % count;
    this.phase = "closing";
    return true;
  }
  advance(ready: JourneyReadiness, now: number): "move" | "open" | "done" | undefined {
    if (this.phase === "closing" && ready.closed) {
      this.phase = "moving";
      return "move";
    }
    if (this.phase === "moving" && ready.aligned) {
      this.phase = "opening";
      return "open";
    }
    if (this.phase === "opening" && ready.opened) {
      this.phase = "idle";
      this.nextAllowed = now + 400;
      return "done";
    }
  }
  cancel(now: number) {
    this.phase = "idle";
    this.nextAllowed = now + 200;
  }
}
