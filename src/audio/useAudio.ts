import { useSyncExternalStore } from 'react';
import * as Tone from 'tone';

/**
 * The kingdom's only door to Tone.js. Scenes and adventures use useAudio()
 * and never import Tone directly — see .claude/skills/audio/SKILL.md.
 *
 * Ground rules encoded here:
 * - No sound before a user gesture: start() must be called from a click
 *   handler (browsers block audio until then), and every play* call is a
 *   silent no-op until it has run.
 * - Children's ears first: a capped master volume plus a limiter, and soft
 *   triangle/sine voices with gentle attacks and releases.
 * - Mute is persistent (localStorage) and instant.
 */

const MUTE_KEY = 'math-kingdom-muted';
const MASTER_DB = -9;

interface Voices {
  chord: Tone.PolySynth<Tone.Synth>;
  drum: Tone.MembraneSynth;
  shaker: Tone.NoiseSynth;
  bell: Tone.FMSynth;
  trumpet: Tone.Synth;
}

let started = false;
let muted = localStorage.getItem(MUTE_KEY) === 'true';
let voices: Voices | null = null;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

function buildVoices(): Voices {
  const master = new Tone.Volume(MASTER_DB);
  master.chain(new Tone.Limiter(-3), Tone.getDestination());

  const chord = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.06, decay: 0.3, sustain: 0.4, release: 1.2 },
  }).connect(master);

  const drum = new Tone.MembraneSynth({
    envelope: { attack: 0.01, decay: 0.35, sustain: 0.01, release: 0.4 },
  }).connect(master);

  const shaker = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.005, decay: 0.09, sustain: 0 },
    volume: -10,
  }).connect(master);

  const bell = new Tone.FMSynth({
    harmonicity: 5.1,
    modulationIndex: 12,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.7, sustain: 0, release: 0.9 },
    volume: -6,
  }).connect(master);

  const trumpet = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.5 },
    volume: -4,
  }).connect(master);

  return { chord, drum, shaker, bell, trumpet };
}

/** Must run inside a user-gesture handler (e.g. the "turn on" button). */
async function start() {
  await Tone.start();
  if (!voices) voices = buildVoices();
  Tone.getDestination().mute = muted;
  started = true;
  emit();
}

function toggleMute() {
  muted = !muted;
  localStorage.setItem(MUTE_KEY, String(muted));
  if (started) Tone.getDestination().mute = muted;
  emit();
}

/** One or more note names (e.g. ["C3", "E3"]) played as a soft chord. */
function playChord(notes: string[]) {
  voices?.chord.triggerAttackRelease(notes, '2n');
}

function playNote(note: string) {
  playChord([note]);
}

function playDrum() {
  voices?.drum.triggerAttackRelease('C2', '8n');
}

function playShaker() {
  voices?.shaker.triggerAttackRelease('16n');
}

function playBell() {
  voices?.bell.triggerAttackRelease('G5', '8n');
}

function playTrumpet(note = 'C5') {
  voices?.trumpet.triggerAttackRelease(note, '8n');
}

export interface Audio {
  /** True once start() has resolved and sound can play. */
  ready: boolean;
  muted: boolean;
  start(): Promise<void>;
  toggleMute(): void;
  playChord(notes: string[]): void;
  playNote(note: string): void;
  playDrum(): void;
  playShaker(): void;
  playBell(): void;
  playTrumpet(note?: string): void;
}

export function useAudio(): Audio {
  const ready = useSyncExternalStore(subscribe, () => started);
  const isMuted = useSyncExternalStore(subscribe, () => muted);
  return {
    ready,
    muted: isMuted,
    start,
    toggleMute,
    playChord,
    playNote,
    playDrum,
    playShaker,
    playBell,
    playTrumpet,
  };
}
