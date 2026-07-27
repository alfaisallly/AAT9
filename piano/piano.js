/**
 * Professional Piano — Web Audio synthesis engine
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const START_OCTAVE = 3;
const NUM_OCTAVES = 3;

const KEYBOARD_MAP = {
  'a': { note: 'C', octave: 4 },
  'w': { note: 'C#', octave: 4 },
  's': { note: 'D', octave: 4 },
  'e': { note: 'D#', octave: 4 },
  'd': { note: 'E', octave: 4 },
  'f': { note: 'F', octave: 4 },
  't': { note: 'F#', octave: 4 },
  'g': { note: 'G', octave: 4 },
  'y': { note: 'G#', octave: 4 },
  'h': { note: 'A', octave: 4 },
  'u': { note: 'A#', octave: 4 },
  'j': { note: 'B', octave: 4 },
  'k': { note: 'C', octave: 5 },
  'o': { note: 'C#', octave: 5 },
  'l': { note: 'D', octave: 5 },
  'p': { note: 'D#', octave: 5 },
  ';': { note: 'E', octave: 5 },
  "'": { note: 'F', octave: 5 },
  'z': { note: 'C', octave: 3 },
  'x': { note: 'D', octave: 3 },
  'c': { note: 'E', octave: 3 },
  'v': { note: 'F', octave: 3 },
  'b': { note: 'G', octave: 3 },
  'n': { note: 'A', octave: 3 },
  'm': { note: 'B', octave: 3 },
  ',': { note: 'C', octave: 4 },
};

const SONGS = {
  'fur-elise': {
    name: 'Für Elise',
    bpm: 120,
    notes: [
      ['E5', 0.25], ['D#5', 0.25], ['E5', 0.25], ['D#5', 0.25], ['E5', 0.25], ['B4', 0.25], ['D5', 0.25], ['C5', 0.25], ['A4', 0.5],
      ['rest', 0.25], ['C4', 0.25], ['E4', 0.25], ['A4', 0.25], ['B4', 0.5],
      ['rest', 0.25], ['E4', 0.25], ['G#4', 0.25], ['B4', 0.25], ['C5', 0.5],
      ['rest', 0.25], ['E4', 0.25], ['E5', 0.25], ['D#5', 0.25], ['E5', 0.25], ['D#5', 0.25], ['E5', 0.25], ['B4', 0.25], ['D5', 0.25], ['C5', 0.25], ['A4', 0.5],
      ['rest', 0.25], ['C4', 0.25], ['E4', 0.25], ['A4', 0.25], ['B4', 0.5],
      ['rest', 0.25], ['E4', 0.25], ['C5', 0.25], ['B4', 0.25], ['A4', 0.5],
    ],
  },
  'happy-birthday': {
    name: 'Happy Birthday',
    bpm: 120,
    notes: [
      ['rest', 0.25], ['C4', 0.25], ['C4', 0.5], ['D4', 0.5], ['C4', 0.5], ['F4', 0.5], ['E4', 1],
      ['C4', 0.25], ['C4', 0.5], ['D4', 0.5], ['C4', 0.5], ['G4', 0.5], ['F4', 1],
      ['C4', 0.25], ['C4', 0.5], ['C5', 0.5], ['A4', 0.5], ['F4', 0.5], ['E4', 0.5], ['D4', 1],
      ['A#4', 0.25], ['A#4', 0.5], ['A4', 0.5], ['F4', 0.5], ['G4', 0.5], ['F4', 1],
    ],
  },
  'twinkle': {
    name: 'Twinkle Twinkle Little Star',
    bpm: 120,
    notes: [
      ['C4', 0.5], ['C4', 0.5], ['G4', 0.5], ['G4', 0.5], ['A4', 0.5], ['A4', 0.5], ['G4', 1],
      ['F4', 0.5], ['F4', 0.5], ['E4', 0.5], ['E4', 0.5], ['D4', 0.5], ['D4', 0.5], ['C4', 1],
      ['G4', 0.5], ['G4', 0.5], ['F4', 0.5], ['F4', 0.5], ['E4', 0.5], ['E4', 0.5], ['D4', 1],
      ['G4', 0.5], ['G4', 0.5], ['F4', 0.5], ['F4', 0.5], ['E4', 0.5], ['E4', 0.5], ['D4', 1],
      ['C4', 0.5], ['C4', 0.5], ['G4', 0.5], ['G4', 0.5], ['A4', 0.5], ['A4', 0.5], ['G4', 1],
      ['F4', 0.5], ['F4', 0.5], ['E4', 0.5], ['E4', 0.5], ['D4', 0.5], ['D4', 0.5], ['C4', 1],
    ],
  },
  'canon': {
    name: 'Canon in D',
    bpm: 60,
    notes: [
      ['F#5', 1], ['E5', 1], ['D5', 1], ['C#5', 1], ['B4', 1], ['A4', 1], ['B4', 1], ['C#5', 1],
      ['D5', 1], ['C#5', 1], ['B4', 1], ['A4', 1], ['G4', 1], ['F#4', 1], ['G4', 1], ['A4', 1],
      ['B4', 2], ['G4', 1], ['B4', 1], ['D5', 2],
      ['F#5', 1], ['E5', 1], ['D5', 1], ['C#5', 1], ['B4', 1], ['A4', 1], ['B4', 1], ['C#5', 1],
      ['D5', 1], ['C#5', 1], ['B4', 1], ['A4', 1], ['G4', 1], ['F#4', 1], ['G4', 1], ['A4', 1],
      ['D5', 2], ['F#5', 1], ['A5', 1], ['D5', 2],
    ],
  },
};

const BLACK_KEY_OFFSETS = {
  'C#': 0.72,
  'D#': 1.72,
  'F#': 3.72,
  'G#': 4.72,
  'A#': 5.72,
};

class PianoEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.activeNotes = new Map();
    this.sustain = false;
    this.sustainedNotes = new Set();
    this.volume = 0.75;
    this.reverbAmount = 0.35;
  }

  init() {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.audioContext.destination);

    this.dryGain = this.audioContext.createGain();
    this.dryGain.gain.value = 1 - this.reverbAmount * 0.6;
    this.dryGain.connect(this.masterGain);

    this.reverbGain = this.audioContext.createGain();
    this.reverbGain.gain.value = this.reverbAmount * 0.8;
    this.reverbNode = this._createReverb();
    this.reverbGain.connect(this.reverbNode);
    this.reverbNode.connect(this.masterGain);
  }

  _createReverb() {
    const convolver = this.audioContext.createConvolver();
    const rate = this.audioContext.sampleRate;
    const length = rate * 2.5;
    const impulse = this.audioContext.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }

    convolver.buffer = impulse;
    return convolver;
  }

  noteToFrequency(noteName) {
    const match = noteName.match(/^([A-G]#?)(\d)$/);
    if (!match) return 440;

    const [, name, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    const semitone = NOTE_NAMES.indexOf(name);
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  noteId(noteName) {
    return noteName;
  }

  playNote(noteName, duration = null) {
    this.init();
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const id = this.noteId(noteName);
    if (this.activeNotes.has(id)) {
      this.stopNote(noteName, false);
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const freq = this.noteToFrequency(noteName);

    const harmonics = [
      { ratio: 1, gain: 1.0 },
      { ratio: 2, gain: 0.5 },
      { ratio: 3, gain: 0.25 },
      { ratio: 4, gain: 0.125 },
      { ratio: 5, gain: 0.06 },
      { ratio: 6, gain: 0.03 },
    ];

    const noteGain = ctx.createGain();
    noteGain.connect(this.dryGain);
    noteGain.connect(this.reverbGain);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(8000, freq * 8);
    filter.Q.value = 0.7;
    filter.connect(noteGain);

    const oscillators = [];
    const attack = 0.005;
    const decay = duration ? Math.min(duration * 0.3, 0.4) : 0.3;
    const sustainLevel = duration ? 0.4 : 0.6;
    const release = duration ? 0.15 : 0.8;

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.85, now + attack);
    noteGain.gain.exponentialRampToValueAtTime(sustainLevel * 0.85 + 0.001, now + attack + decay);

    if (duration) {
      const noteEnd = now + duration;
      noteGain.gain.setValueAtTime(sustainLevel * 0.85 + 0.001, noteEnd - release);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteEnd);
    }

    for (const h of harmonics) {
      const osc = ctx.createOscillator();
      osc.type = h.ratio <= 2 ? 'sine' : 'triangle';
      osc.frequency.value = freq * h.ratio;

      const hGain = ctx.createGain();
      hGain.gain.value = h.gain * (1 / h.ratio);

      osc.connect(hGain);
      hGain.connect(filter);
      osc.start(now);
      oscillators.push(osc);
    }

    const stopTime = duration ? now + duration + 0.1 : null;

    if (duration) {
      oscillators.forEach(osc => osc.stop(stopTime));
      setTimeout(() => {
        noteGain.disconnect();
        filter.disconnect();
        this.activeNotes.delete(id);
      }, duration * 1000 + 200);
    }

    this.activeNotes.set(id, { oscillators, noteGain, filter, noteName });

    return id;
  }

  stopNote(noteName, allowSustain = true) {
    const id = this.noteId(noteName);
    const note = this.activeNotes.get(id);
    if (!note) return;

    if (allowSustain && this.sustain) {
      this.sustainedNotes.add(id);
      return;
    }

    const ctx = this.audioContext;
    if (!ctx) return;

    const now = ctx.currentTime;
    const release = 0.3;

    try {
      note.noteGain.gain.cancelScheduledValues(now);
      note.noteGain.gain.setValueAtTime(note.noteGain.gain.value, now);
      note.noteGain.gain.exponentialRampToValueAtTime(0.001, now + release);
      note.oscillators.forEach(osc => {
        try { osc.stop(now + release + 0.05); } catch (_) { /* already stopped */ }
      });
    } catch (_) { /* ignore */ }

    setTimeout(() => {
      note.noteGain.disconnect();
      note.filter.disconnect();
      this.activeNotes.delete(id);
      this.sustainedNotes.delete(id);
    }, release * 1000 + 100);
  }

  releaseSustain() {
    for (const id of this.sustainedNotes) {
      const note = this.activeNotes.get(id);
      if (note) this.stopNote(note.noteName, false);
    }
    this.sustainedNotes.clear();
  }

  setVolume(value) {
    this.volume = value;
    if (this.masterGain) this.masterGain.gain.value = value;
  }

  setReverb(value) {
    this.reverbAmount = value;
    if (this.dryGain) this.dryGain.gain.value = 1 - value * 0.6;
    if (this.reverbGain) this.reverbGain.gain.value = value * 0.8;
  }
}

class PianoApp {
  constructor() {
    this.engine = new PianoEngine();
    this.pianoEl = document.getElementById('piano');
    this.currentNoteEl = document.getElementById('current-note');
    this.playBtn = document.getElementById('play-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.sustainBtn = document.getElementById('sustain-btn');
    this.progressFill = document.getElementById('progress-fill');

    this.keys = new Map();
    this.pressedKeys = new Set();
    this.selectedSong = 'fur-elise';
    this.isPlaying = false;
    this.playbackTimeouts = [];
    this.playbackRAF = null;

    this._buildPiano();
    this._bindEvents();
  }

  _buildPiano() {
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

    let whiteIndex = 0;
    const totalWhiteKeys = NUM_OCTAVES * 7;

    for (let oct = START_OCTAVE; oct < START_OCTAVE + NUM_OCTAVES; oct++) {
      for (let i = 0; i < 7; i++) {
        const note = whiteNotes[i];
        const noteName = `${note}${oct}`;
        const keyEl = document.createElement('button');
        keyEl.className = 'key white';
        keyEl.dataset.note = noteName;
        keyEl.setAttribute('aria-label', noteName);

        const kbEntry = Object.entries(KEYBOARD_MAP).find(([, v]) => v.note === note && v.octave === oct);
        if (kbEntry) {
          const label = document.createElement('span');
          label.className = 'key-label';
          label.textContent = kbEntry[0].toUpperCase();
          keyEl.appendChild(label);
        }

        keyEl.addEventListener('mousedown', (e) => { e.preventDefault(); this._pressKey(noteName); });
        keyEl.addEventListener('mouseup', () => this._releaseKey(noteName));
        keyEl.addEventListener('mouseleave', () => this._releaseKey(noteName));
        keyEl.addEventListener('touchstart', (e) => { e.preventDefault(); this._pressKey(noteName); }, { passive: false });
        keyEl.addEventListener('touchend', () => this._releaseKey(noteName));

        this.pianoEl.appendChild(keyEl);
        this.keys.set(noteName, keyEl);

        const black = blackNotes[i];
        if (black) {
          const blackName = `${black}${oct}`;
          const blackEl = document.createElement('button');
          blackEl.className = 'key black';
          blackEl.dataset.note = blackName;
          blackEl.setAttribute('aria-label', blackName);

          const offset = BLACK_KEY_OFFSETS[black];
          blackEl.style.left = `calc(${((whiteIndex + offset) / totalWhiteKeys) * 100}%)`;

          const kbBlack = Object.entries(KEYBOARD_MAP).find(([, v]) => v.note === black && v.octave === oct);
          if (kbBlack) {
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = kbBlack[0].toUpperCase();
            blackEl.appendChild(label);
          }

          blackEl.addEventListener('mousedown', (e) => { e.preventDefault(); this._pressKey(blackName); });
          blackEl.addEventListener('mouseup', () => this._releaseKey(blackName));
          blackEl.addEventListener('mouseleave', () => this._releaseKey(blackName));
          blackEl.addEventListener('touchstart', (e) => { e.preventDefault(); this._pressKey(blackName); }, { passive: false });
          blackEl.addEventListener('touchend', () => this._releaseKey(blackName));

          this.pianoEl.appendChild(blackEl);
          this.keys.set(blackName, blackEl);
        }

        whiteIndex++;
      }
    }
  }

  _bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const mapping = KEYBOARD_MAP[key];
      if (!mapping) return;

      e.preventDefault();
      const noteName = `${mapping.note}${mapping.octave}`;
      this._pressKey(noteName);
    });

    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      const mapping = KEYBOARD_MAP[key];
      if (!mapping) return;

      const noteName = `${mapping.note}${mapping.octave}`;
      this._releaseKey(noteName);
    });

    document.getElementById('volume').addEventListener('input', (e) => {
      this.engine.setVolume(e.target.value / 100);
    });

    document.getElementById('reverb').addEventListener('input', (e) => {
      this.engine.setReverb(e.target.value / 100);
    });

    this.sustainBtn.addEventListener('click', () => {
      const pressed = this.sustainBtn.getAttribute('aria-pressed') === 'true';
      this.sustainBtn.setAttribute('aria-pressed', !pressed);
      this.engine.sustain = !pressed;
      if (pressed) this.engine.releaseSustain();
    });

    document.querySelectorAll('.btn-song').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isPlaying) this.stopPlayback();
        document.querySelectorAll('.btn-song').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSong = btn.dataset.song;
      });
    });

    this.playBtn.addEventListener('click', () => this.startPlayback());
    this.stopBtn.addEventListener('click', () => this.stopPlayback());

    document.body.addEventListener('click', () => {
      this.engine.init();
    }, { once: true });
  }

  _pressKey(noteName) {
    if (this.pressedKeys.has(noteName)) return;
    this.pressedKeys.add(noteName);

    this.engine.init();
    this.engine.playNote(noteName);

    const keyEl = this.keys.get(noteName);
    if (keyEl) keyEl.classList.add('pressed');

    this.currentNoteEl.textContent = noteName;
    this.currentNoteEl.classList.add('active');
  }

  _releaseKey(noteName) {
    if (!this.pressedKeys.has(noteName)) return;
    this.pressedKeys.delete(noteName);

    this.engine.stopNote(noteName);

    const keyEl = this.keys.get(noteName);
    if (keyEl) keyEl.classList.remove('pressed');

    if (this.pressedKeys.size === 0) {
      this.currentNoteEl.classList.remove('active');
    }
  }

  _highlightKey(noteName, active) {
    const keyEl = this.keys.get(noteName);
    if (keyEl) keyEl.classList.toggle('active', active);
  }

  startPlayback() {
    if (this.isPlaying) return;

    this.engine.init();
    this.isPlaying = true;
    this.playBtn.classList.add('playing');
    this.playBtn.disabled = true;
    this.stopBtn.disabled = false;

    const song = SONGS[this.selectedSong];
    const beatDuration = 60 / song.bpm;
    const totalBeats = song.notes.reduce((sum, [, dur]) => sum + dur, 0);
    const totalMs = totalBeats * beatDuration * 1000;

    let elapsed = 0;
    const startTime = performance.now();

    const updateProgress = () => {
      if (!this.isPlaying) return;
      const progress = Math.min((performance.now() - startTime) / totalMs, 1);
      this.progressFill.style.width = `${progress * 100}%`;
      if (progress < 1) {
        this.playbackRAF = requestAnimationFrame(updateProgress);
      }
    };
    this.playbackRAF = requestAnimationFrame(updateProgress);

    song.notes.forEach(([note, duration]) => {
      const delay = elapsed;
      elapsed += duration * beatDuration * 1000;

      const timeoutId = setTimeout(() => {
        if (!this.isPlaying) return;

        if (note !== 'rest') {
          this.engine.playNote(note, duration * beatDuration);
          this._highlightKey(note, true);
          this.currentNoteEl.textContent = note;
          this.currentNoteEl.classList.add('active');

          const offId = setTimeout(() => {
            this._highlightKey(note, false);
          }, duration * beatDuration * 1000 - 50);
          this.playbackTimeouts.push(offId);
        }
      }, delay);
      this.playbackTimeouts.push(timeoutId);
    });

    const endId = setTimeout(() => {
      if (this.isPlaying) this.stopPlayback();
    }, totalMs + 500);
    this.playbackTimeouts.push(endId);
  }

  stopPlayback() {
    this.isPlaying = false;
    this.playbackTimeouts.forEach(clearTimeout);
    this.playbackTimeouts = [];
    cancelAnimationFrame(this.playbackRAF);

    this.playBtn.classList.remove('playing');
    this.playBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.progressFill.style.width = '0%';
    this.currentNoteEl.textContent = '—';
    this.currentNoteEl.classList.remove('active');

    document.querySelectorAll('.key.active').forEach(k => k.classList.remove('active'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PianoApp();
});
