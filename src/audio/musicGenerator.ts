import { MusicContext } from '../shared/types';

// Note frequencies (Hz)
const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
};

interface MusicTrack {
  stopFn: () => void;
}

type NoteSequence = { freq: number; duration: number }[];

function scheduleArpeggio(
  ctx: AudioContext,
  dest: AudioNode,
  notes: NoteSequence,
  waveform: OscillatorType,
  volume: number,
  onLoop: () => void,
): { stop: () => void } {
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function playBar() {
    if (stopped) return;
    let offset = 0;
    for (const note of notes) {
      const startTime = ctx.currentTime + offset;
      const gain = ctx.createGain();
      gain.connect(dest);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.linearRampToValueAtTime(volume * 0.6, startTime + note.duration * 0.5);
      gain.gain.linearRampToValueAtTime(0, startTime + note.duration);

      const osc = ctx.createOscillator();
      osc.type = waveform;
      osc.frequency.setValueAtTime(note.freq, startTime);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + note.duration);

      offset += note.duration;
    }
    const totalDuration = notes.reduce((s, n) => s + n.duration, 0);
    timeoutId = setTimeout(() => {
      if (!stopped) {
        onLoop();
        playBar();
      }
    }, totalDuration * 1000);
  }

  playBar();

  return {
    stop() {
      stopped = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
    },
  };
}

function buildArpNotes(chords: number[][], noteDuration: number): NoteSequence {
  const notes: NoteSequence = [];
  for (const chord of chords) {
    for (const freq of chord) {
      notes.push({ freq, duration: noteDuration });
    }
  }
  return notes;
}

const trackBuilders: Record<MusicContext, (ctx: AudioContext, dest: AudioNode) => MusicTrack> = {
  [MusicContext.Title]: (ctx, dest) => {
    // Am - F - C - G arpeggios, slow
    const chords = [
      [NOTE.A3, NOTE.C4, NOTE.E4],
      [NOTE.F3, NOTE.A3, NOTE.C4],
      [NOTE.C4, NOTE.E4, NOTE.G4],
      [NOTE.G3, NOTE.B3, NOTE.D4],
    ];
    const notes = buildArpNotes(chords, 0.4);
    const handle = scheduleArpeggio(ctx, dest, notes, 'sine', 0.25, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.WorldMap]: (ctx, dest) => {
    const chords = [
      [NOTE.C4, NOTE.E4, NOTE.G4],
      [NOTE.G3, NOTE.B3, NOTE.D4],
      [NOTE.A3, NOTE.C4, NOTE.E4],
      [NOTE.F3, NOTE.A3, NOTE.C4],
    ];
    const notes = buildArpNotes(chords, 0.3);
    const handle = scheduleArpeggio(ctx, dest, notes, 'sine', 0.2, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.BaseCamp]: (ctx, dest) => {
    const chords = [
      [NOTE.C3, NOTE.E3, NOTE.G3],
      [NOTE.F3, NOTE.A3, NOTE.C4],
    ];
    const notes = buildArpNotes(chords, 0.6);
    const handle = scheduleArpeggio(ctx, dest, notes, 'sine', 0.15, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.BattlePlayer]: (ctx, dest) => {
    const chords = [
      [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A4],
      [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D4],
      [NOTE.E3, NOTE.G3, NOTE.B3, NOTE.E4],
      [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A4],
    ];
    const notes = buildArpNotes(chords, 0.15);
    const handle = scheduleArpeggio(ctx, dest, notes, 'square', 0.2, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.BattleEnemy]: (ctx, dest) => {
    const chords = [
      [NOTE.A3, NOTE.C4, NOTE.E4],
      [NOTE.D3, NOTE.F3, NOTE.A3],
      [NOTE.E3, NOTE.G3, NOTE.B3],
    ];
    const notes = buildArpNotes(chords, 0.18);
    const handle = scheduleArpeggio(ctx, dest, notes, 'square', 0.22, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.BossBattle]: (ctx, dest) => {
    const chords = [
      [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.G4],
      [NOTE.B3, NOTE.D4, NOTE.F4, NOTE.A4],
      [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.B4],
    ];
    const notes = buildArpNotes(chords, 0.12);
    const handle = scheduleArpeggio(ctx, dest, notes, 'sawtooth', 0.2, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.Victory]: (ctx, dest) => {
    const notes: NoteSequence = [
      { freq: NOTE.C4, duration: 0.2 },
      { freq: NOTE.E4, duration: 0.2 },
      { freq: NOTE.G4, duration: 0.2 },
      { freq: NOTE.C5, duration: 0.4 },
    ];
    const handle = scheduleArpeggio(ctx, dest, notes, 'sawtooth', 0.3, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.Defeat]: (ctx, dest) => {
    const notes: NoteSequence = [
      { freq: NOTE.A4, duration: 0.5 },
      { freq: NOTE.G4, duration: 0.5 },
      { freq: NOTE.F4, duration: 0.5 },
      { freq: NOTE.E4, duration: 0.8 },
    ];
    const handle = scheduleArpeggio(ctx, dest, notes, 'sine', 0.2, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.Story]: (ctx, dest) => {
    const chords = [
      [NOTE.C4, NOTE.E4, NOTE.G4],
      [NOTE.A3, NOTE.C4, NOTE.E4],
      [NOTE.F3, NOTE.A3, NOTE.C4],
      [NOTE.G3, NOTE.B3, NOTE.D4],
    ];
    const notes = buildArpNotes(chords, 0.35);
    const handle = scheduleArpeggio(ctx, dest, notes, 'triangle', 0.2, () => {});
    return { stopFn: handle.stop };
  },

  [MusicContext.Shop]: (ctx, dest) => {
    const chords = [
      [NOTE.C4, NOTE.E4, NOTE.G4],
      [NOTE.F4, NOTE.A4, NOTE.C5],
      [NOTE.G4, NOTE.B4, NOTE.D5],
      [NOTE.C4, NOTE.E4, NOTE.G4],
    ];
    const notes = buildArpNotes(chords, 0.2);
    const handle = scheduleArpeggio(ctx, dest, notes, 'triangle', 0.25, () => {});
    return { stopFn: handle.stop };
  },
};

export function startMusic(
  ctx: AudioContext,
  destination: AudioNode,
  context: MusicContext,
): MusicTrack {
  const builder = trackBuilders[context];
  return builder(ctx, destination);
}

export function stopMusicTrack(track: MusicTrack): void {
  track.stopFn();
}
