// Keep animation responsive without rendering at a high-refresh display's rate.
export class RenderBudget {
  private awakeUntil = 0;
  private lastFrame = -Infinity;
  readonly frameInterval = 1000 / 60;
  renderedFrames = 0;
  wake(now: number) { this.awakeUntil = now + 8000; }
  active(now: number, continuous: boolean, blocked: boolean) {
    return !blocked && (continuous || now < this.awakeUntil);
  }
  take(now: number) {
    if (now - this.lastFrame < this.frameInterval - .5) return false;
    this.lastFrame = now;
    this.renderedFrames++;
    return true;
  }
}
