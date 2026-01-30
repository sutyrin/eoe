# Phase 2: Audio Integration - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Create audio atoms with Tone.js (synths, sequences, effects) and combine them with visual atoms through audio-reactive compositions. Audio analysis drives visual properties. Automated publishing and advanced sound design are deferred to later phases.

</domain>

<decisions>
## Implementation Decisions

### Audio Atom Creation Workflow
- **Creation mode:** Hybrid approach (both code-based Tone.js and visual UI together)
- **Entry point:** User chooses per atom — can start code-first or sequencer-first
- **Instrument library:** Basic synths only (polyphonic synth, monophonic synth, drum kit)
- **Storage/persistence:** Claude's discretion on structure (could be code.js + config.json, or code.js + .seq.json for sequencer state)

### Audio-Visual Reactivity
- **Audio analysis:** Simplified frequency bands (bass, mids, treble, etc.) instead of full FFT spectrum
- **Additional analysis metrics:** Beat detection, envelope/loudness tracking, pitch detection
- **Data exposure:** Audio metrics injected into sketch's `update()` method as parameters
- **Value format:** Normalized to 0-1 range for consistent mapping to visual properties

### Composition Structure
- **Composition format:** Nested code — compositions are JavaScript atoms that orchestrate other atoms
- **Timing model:** Beat-based relative scheduling (bars, beats) rather than absolute millisecond offsets
- **Storage:** Compositions are first-class atoms stored in `/atoms/` folder with .js and config.json
- **Playback:** Both browser preview (live Tone.js + p5.js) and CLI video rendering (`eoe capture`)

### Parameter Binding & Smoothing
- **Binding mechanism:** Direct naming — sketches declare which audio metrics they want by name (e.g., 'bass', 'beat')
- **Smoothing:** Exponential smoothing applied by default to audio values before reaching sketches (prevents jitter)
- **Response curves:** Support easing functions (exponential, logarithmic, sine) for nonlinear expressive mapping
- **Parameter ranges:** Defined in atom's `config.json` with min/max ranges and curve type per parameter

### Claude's Discretion
- Exact number of frequency bands and their cutoff frequencies
- Specific smoothing factor (alpha parameter for exponential smoothing)
- Details of beat detection algorithm (peak detection, onset detection, etc.)
- Synth preset definitions and their parameter surfaces
- Audio-visual demo reference composition

</decisions>

<specifics>
## Specific Ideas

- Visual atoms in compositions should feel like they're "reacting" rather than "being controlled" — smooth, natural responsiveness
- Compositions should work seamlessly with video capture (Phase 3) — timing must be precise and reproducible
- "I like when visuals subtly respond to bass differently than to mids" — frequency bands give different feels

</specifics>

<deferred>
## Deferred Ideas

- Advanced synths (FM, wavetable, granular) — Phase 2+ enhancement if basic synths feel limiting
- Sample/loop playback — add later if needed
- Automated composition generation — belongs in v2 (publishing automation phase)
- Real-time synthesis parameter visualization — nice-to-have but deferred
- Audio file import/loading from user libraries — Phase 2+ enhancement

</deferred>

---

*Phase: 02-audio-integration*
*Context gathered: 2026-01-30*
