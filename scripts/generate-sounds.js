// Generates valid WAV audio files: a retro synthwave track, a lofi tape track, and cassette mechanical clicks
const fs = require('fs');
const path = require('path');

function createWavBuffer(samples, sampleRate = 22050) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(val), offset);
    offset += 2;
  }

  return buffer;
}

// 1. Generate Retro Synthwave Track (~24 seconds, looping melody)
function generateSynthwaveTrack() {
  const sampleRate = 22050;
  const duration = 24; // seconds
  const totalSamples = sampleRate * duration;
  const samples = new Float32Array(totalSamples);

  // Chord progression: Am - F - C - G
  const bassNotes = [110, 87.31, 130.81, 98.0]; // A2, F2, C3, G2
  // Arpeggio notes (80s synth lead frequencies)
  const arpScales = [
    [220, 261.63, 329.63, 440, 523.25, 440, 329.63, 261.63],
    [174.61, 220, 261.63, 349.23, 440, 349.23, 261.63, 220],
    [261.63, 329.63, 392, 523.25, 659.25, 523.25, 392, 329.63],
    [196, 246.94, 293.66, 392, 493.88, 392, 293.66, 246.94],
  ];

  const bpm = 120;
  const beatDuration = 60 / bpm; // 0.5 sec per beat
  const chordDuration = beatDuration * 8; // 4 seconds per chord (4 chords = 16s + 8s)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t % 16) / 4);
    const bassFreq = bassNotes[chordIndex];
    const arpNotes = arpScales[chordIndex];

    // Bassline (warm sawtooth + sub sine)
    const bassPhase = (t * bassFreq) % 1;
    const bass = (bassPhase - 0.5) * 0.3 + Math.sin(2 * Math.PI * bassFreq * 0.5 * t) * 0.25;

    // Arpeggio (16th notes: 0.125s each)
    const arpStep = Math.floor((t % 4) / 0.125) % arpNotes.length;
    const leadFreq = arpNotes[arpStep];
    const leadEnv = Math.exp(-((t % 0.125) / 0.125) * 4);
    const lead = Math.sin(2 * Math.PI * leadFreq * t) * leadEnv * 0.3;

    // 80s Drum Beat (kick on 1 & 3, snare on 2 & 4)
    const beatPos = (t % beatDuration) / beatDuration;
    const beatNum = Math.floor(t / beatDuration) % 4;
    let drum = 0;
    if (beatNum === 0 || beatNum === 2) {
      // Kick: pitch drop
      const kickEnv = Math.exp(-beatPos * 12);
      drum += Math.sin(2 * Math.PI * (120 * Math.exp(-beatPos * 8)) * t) * kickEnv * 0.4;
    } else {
      // Snare: noise burst
      const snareEnv = Math.exp(-beatPos * 8);
      drum += (Math.random() * 2 - 1) * snareEnv * 0.2;
    }

    // Tape hiss / vinyl texture
    const hiss = (Math.random() * 2 - 1) * 0.015;

    // Soft master limiter
    const mix = (bass + lead + drum + hiss) * 0.75;
    samples[i] = Math.tanh(mix);
  }

  return createWavBuffer(samples, sampleRate);
}

// 2. Generate Lo-Fi Cassette Tape Track (~20 seconds)
function generateLofiTrack() {
  const sampleRate = 22050;
  const duration = 20;
  const totalSamples = sampleRate * duration;
  const samples = new Float32Array(totalSamples);

  // Lo-Fi Electric Piano chords (Rhodes style): Dm9 - G13 - Cmaj9 - Am7
  const chords = [
    [146.83, 220, 261.63, 329.63, 349.23], // Dm9
    [98.0, 196, 246.94, 329.63, 440],     // G13
    [130.81, 196, 246.94, 329.63, 392],   // Cmaj9
    [110, 164.81, 220, 261.63, 329.63],   // Am7
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor((t % 20) / 5);
    const chord = chords[chordIdx];

    // Tape wobble / flutter (subtle pitch drift)
    const wobble = Math.sin(2 * Math.PI * 0.5 * t) * 0.008;

    // Keys chord
    let keys = 0;
    const chordTime = (t % 5);
    const chordEnv = Math.exp(-chordTime * 0.6);
    for (const freq of chord) {
      keys += Math.sin(2 * Math.PI * freq * (1 + wobble) * t) * 0.08 * chordEnv;
    }

    // Vinyl crackle / tape noise
    let crackle = 0;
    if (Math.random() < 0.002) {
      crackle = (Math.random() * 2 - 1) * 0.25;
    }
    const hiss = (Math.random() * 2 - 1) * 0.02;

    const mix = (keys + crackle + hiss) * 0.85;
    samples[i] = Math.tanh(mix);
  }

  return createWavBuffer(samples, sampleRate);
}

// 3. Generate Cassette Deck Mechanical Click SFX (~0.25s)
function generateCassetteClick() {
  const sampleRate = 22050;
  const duration = 0.25;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Metallic 'thud-click' of cassette head engaging
    const metallic = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 60) * 0.5;
    const thud = Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 30) * 0.7;
    const snap = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.4;
    samples[i] = Math.max(-1, Math.min(1, metallic + thud + snap));
  }

  return createWavBuffer(samples, sampleRate);
}

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

fs.writeFileSync(path.join(soundsDir, 'retro_synthwave.wav'), generateSynthwaveTrack());
fs.writeFileSync(path.join(soundsDir, 'lofi_tape.wav'), generateLofiTrack());
fs.writeFileSync(path.join(soundsDir, 'cassette_click.wav'), generateCassetteClick());

console.log('Audio files successfully generated in assets/sounds!');
