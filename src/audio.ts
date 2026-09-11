import { assetUrl } from "./asset-url";
export type Sound =
  | "page-open"
  | "page-close"
  | "ui-tick"
  | "brand"
  | "text-reveal"
  | "key"
  | "tick"
  | "column"
  | "open"
  | "confirm"
  | "back"
  | "scan"
  | "welcome"
  | "array"
  | "inspect"
  | "explode"
  | "assemble";
export type SoundScene = "boot" | "archive" | "detail" | "viewer";
export type AudioPreferences = {
  sound: boolean;
  music: boolean;
  soundVolume: number;
  musicVolume: number;
};

/** One continuous music player. Scene and UI events never generate sound. */
export class TerminalAudio {
  private prefs: AudioPreferences = { sound: false, music: true, soundVolume: 0, musicVolume: .5 };
  private media = new Audio(assetUrl("audio/controls-wishes.mp3"));
  private context?: AudioContext;
  private meter?: AnalyserNode;
  private error = "";
  private scene: SoundScene = "boot";
  constructor() {
    this.media.loop = true;
    this.media.preload = "none";
    this.media.dataset.backgroundMusic = "controls-wishes";
    this.media.hidden = true;
    document.body.append(this.media);
  }
  configure(prefs: AudioPreferences) {
    this.prefs = { ...prefs, sound: false, soundVolume: 0 };
    this.media.volume = Math.max(0, Math.min(1, prefs.musicVolume));
    this.media.muted = !prefs.music;
  }
  holdForEntry() {}
  releaseEntry() {}
  prepareMusic() { return Promise.resolve(); }
  cancelEntry() { this.media.pause(); }
  async unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.meter = this.context.createAnalyser();
        this.meter.fftSize = 256;
        this.context.createMediaElementSource(this.media).connect(this.meter);
        this.meter.connect(this.context.destination);
      }
      // Both activation requests originate synchronously from the entry click.
      await Promise.all([this.context.resume(), this.media.play()]);
      this.error = "";
      return !this.media.paused && this.context.state === "running";
    } catch (error) {
      this.error = String(error);
      return false;
    }
  }
  setScene(scene: SoundScene) { this.scene = scene; }
  play(_sound: Sound, _pan = 0) {}
  restartBoot() {}
  updateBoot(_time: number, _frozen = false) {}
  stats() {
    const samples = new Float32Array(256);
    this.meter?.getFloatTimeDomainData(samples);
    return {
      state: this.context?.state ?? "locked", scene: this.scene,
      tracks: this.media.paused ? 0 : 1, voices: 0, playedKeys: 0,
      loaded: this.media.readyState >= 2, error: this.error,
      preferences: { ...this.prefs }, track: "Control's Wishes", loop: this.media.loop,
      currentTime: this.media.currentTime, duration: this.media.duration,
      outputRms: Math.sqrt(samples.reduce((sum, v) => sum + v * v, 0) / samples.length),
    };
  }
  dispose() { this.media.pause(); this.media.remove(); void this.context?.close(); }
}
