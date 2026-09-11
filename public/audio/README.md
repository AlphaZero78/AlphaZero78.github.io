# Audio credits

The three Ogg stems (`atmosphere`, `motif`, `pulse`) are the original programmatically composed music from LBEILC/RhineLabUI, distributed under its MIT license. Score data is retained in `score.json`; its synthesis source is `scripts/render-audio.mjs`.

Sound and music are enabled by default, matching the upstream entry experience. Playback starts after the entry button is activated. Silent entry skips the opening for this visit only; explicit audio preferences are saved separately in Settings (audio-v2). Legacy automatic mute values are reset once.

Typing tones are synthesized directly in `src/audio.ts`. The upstream promotional-video typing samples are not included.
