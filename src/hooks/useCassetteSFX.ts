/**
 * useCassetteSFX — Hook for cassette tape mechanical sound effects.
 *
 * Provides methods to play K7 sounds (tape starting, stopping, ejecting).
 * Currently set up with placeholders — drop real audio files into
 * assets/sounds/ and update the paths below.
 *
 * Expected sound files:
 *   assets/sounds/tape-play.mp3     — Tape starting to roll
 *   assets/sounds/tape-pause.mp3    — Tape stopping (mechanical click)
 *   assets/sounds/tape-eject.mp3    — Tape being ejected / inserted
 *   assets/sounds/tape-ff.mp3       — Fast-forward whir
 *   assets/sounds/tape-rew.mp3      — Rewind whir
 *   assets/sounds/button-click.mp3  — Physical button press click
 */
import { useCallback, useRef } from 'react';

// TODO: Uncomment when expo-audio is ready and sound files exist
// import { useAudioPlayer } from 'expo-audio';

interface CassetteSFX {
  /** Play the tape-start sound */
  playTapeStart: () => void;
  /** Play the tape-stop/pause sound */
  playTapeStop: () => void;
  /** Play the eject/insert sound (used on track change) */
  playTapeEject: () => void;
  /** Play the fast-forward sound */
  playFastForward: () => void;
  /** Play the rewind sound */
  playRewind: () => void;
  /** Play the mechanical button click */
  playButtonClick: () => void;
  /** Whether SFX are enabled */
  sfxEnabled: boolean;
  /** Toggle SFX on/off */
  toggleSFX: () => void;
}

export function useCassetteSFX(): CassetteSFX {
  const sfxEnabledRef = useRef(true);

  // ── Sound file paths (update when assets are available) ──────
  // const tapeStartSound = useAudioPlayer(require('@/assets/sounds/tape-play.mp3'));
  // const tapeStopSound = useAudioPlayer(require('@/assets/sounds/tape-pause.mp3'));
  // const tapeEjectSound = useAudioPlayer(require('@/assets/sounds/tape-eject.mp3'));
  // const ffSound = useAudioPlayer(require('@/assets/sounds/tape-ff.mp3'));
  // const rewSound = useAudioPlayer(require('@/assets/sounds/tape-rew.mp3'));
  // const buttonClickSound = useAudioPlayer(require('@/assets/sounds/button-click.mp3'));

  const playTapeStart = useCallback(() => {
    if (!sfxEnabledRef.current) return;
    // TODO: tapeStartSound.seekTo(0); tapeStartSound.play();
    console.log('[SFX] 🎵 Tape start');
  }, []);

  const playTapeStop = useCallback(() => {
    if (!sfxEnabledRef.current) return;
    // TODO: tapeStopSound.seekTo(0); tapeStopSound.play();
    console.log('[SFX] ⏸ Tape stop');
  }, []);

  const playTapeEject = useCallback(() => {
    if (!sfxEnabledRef.current) return;
    // TODO: tapeEjectSound.seekTo(0); tapeEjectSound.play();
    console.log('[SFX] ⏏ Tape eject');
  }, []);

  const playFastForward = useCallback(() => {
    if (!sfxEnabledRef.current) return;
    // TODO: ffSound.seekTo(0); ffSound.play();
    console.log('[SFX] ⏩ Fast forward');
  }, []);

  const playRewind = useCallback(() => {
    if (!sfxEnabledRef.current) return;
    // TODO: rewSound.seekTo(0); rewSound.play();
    console.log('[SFX] ⏪ Rewind');
  }, []);

  const playButtonClick = useCallback(() => {
    if (!sfxEnabledRef.current) return;
    // TODO: buttonClickSound.seekTo(0); buttonClickSound.play();
    console.log('[SFX] 🔘 Button click');
  }, []);

  const toggleSFX = useCallback(() => {
    sfxEnabledRef.current = !sfxEnabledRef.current;
  }, []);

  return {
    playTapeStart,
    playTapeStop,
    playTapeEject,
    playFastForward,
    playRewind,
    playButtonClick,
    sfxEnabled: sfxEnabledRef.current,
    toggleSFX,
  };
}
