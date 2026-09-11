import type { AudioPreferences } from "./audio";

export function audioSettingsMarkup(prefs: AudioPreferences) {
  return `<div class="audio-settings">${(
    [
      ["music", "musicVolume", "BACKGROUND MUSIC", "Control’s Wishes"],
    ] as const
  )
    .map(
      ([toggle, volume, title, description]) => `<div class="audio-setting">
    <label class="audio-toggle"><div><strong>${title}</strong><span>${description}</span></div><input type="checkbox" data-pref="${toggle}" ${prefs[toggle] ? "checked" : ""}/><i class="toggle"></i></label>
    <label class="audio-volume"><span>音乐音量</span><input aria-label="音乐音量" data-volume="${volume}" type="range" min="0" max="100" step="1" value="${Math.round(prefs[volume] * 100)}"/><output>${Math.round(prefs[volume] * 100)}%</output></label>
  </div>`,
    )
    .join("")}</div>`;
}
