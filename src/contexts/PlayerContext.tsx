/**
 * PlayerContext — Global player state management with expo-audio.
 *
 * Plays real audio files on Android and iOS (Expo Go and standalone builds),
 * synchronizes tape reel animation with playback, and plays mechanical click SFX.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';

import type { PlayerState, RepeatMode, Track } from '@/types/music';
import { getDownloadedTracks } from '@/services/downloadService';

// Bundled Retro Audio Tracks (Guaranteed to play offline on device!)
const SOUND_SYNTHWAVE = require('../../assets/sounds/retro_synthwave.wav');
const SOUND_LOFI = require('../../assets/sounds/lofi_tape.wav');
const SOUND_CLICK = require('../../assets/sounds/cassette_click.wav');

// Initial Demo Cassette Tapes with real playable audio
export const DEMO_TRACKS: Track[] = [
  {
    id: 'demo-1',
    title: 'Midnight Synthwave Drive',
    artist: 'Retro Horizon',
    duration: 24,
    uri: SOUND_SYNTHWAVE,
    source: 'local',
    cassetteType: 'Type II',
  },
  {
    id: 'demo-2',
    title: 'Cassette Lo-Fi Chill',
    artist: 'Vintage Deck',
    duration: 20,
    uri: SOUND_LOFI,
    source: 'local',
    cassetteType: 'Type I',
  },
  {
    id: 'demo-3',
    title: 'Neon Nights 1984',
    artist: 'Analog Memory',
    duration: 24,
    uri: SOUND_SYNTHWAVE,
    source: 'local',
    cassetteType: 'Type IV',
  },
];

interface PlayerContextValue extends PlayerState {
  /** Progress from 0 to 1 */
  progress: number;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  seekToProgress: (progress: number) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  playTrack: (track: Track) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  /** Callback invoked right before a track transition (for SFX) */
  onTrackTransition?: () => void;
  setOnTrackTransition: (cb: (() => void) | undefined) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEMO_TRACKS[0]!);
  const [queue, setQueueState] = useState<Track[]>(DEMO_TRACKS);
  const [queueIndex, setQueueIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState(false);
  const [isPlaylist, setIsPlaylist] = useState(true);
  const [playlistName, setPlaylistName] = useState<string | undefined>('Fitas Retrô');

  const transitionCbRef = useRef<(() => void) | undefined>(undefined);

  // Mechanical cassette click sound player
  const clickPlayer = useAudioPlayer(SOUND_CLICK);

  // Main music player
  const player = useAudioPlayer(DEMO_TRACKS[0]?.uri ?? SOUND_SYNTHWAVE, {
    updateInterval: 250,
  });
  const status = useAudioPlayerStatus(player);

  // Configure audio session on mount to ensure sound plays even in silent mode
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
      } catch (err) {
        console.warn('[PlayerContext] Audio session config error:', err);
      }
    })();
  }, []);

  // Load user's downloaded tracks on mount so their real tapes are loaded instead of demo test sounds
  useEffect(() => {
    (async () => {
      try {
        const saved = await getDownloadedTracks();
        if (saved && saved.length > 0) {
          setQueueState(saved);
          setCurrentTrack(saved[0]!);
          setQueueIndex(0);
          setIsPlaylist(saved.length > 1);
          setPlaylistName('Minhas Fitas Gravadas');
          if (saved[0]?.uri) {
            const src =
              typeof saved[0].uri === 'string'
                ? { uri: saved[0].uri }
                : saved[0].uri;
            player.replace(src);
            player.seekTo(0);
          }
        }
      } catch (err) {
        console.warn('[PlayerContext] Failed to load initial downloaded tracks:', err);
      }
    })();
  }, [player]);

  const playClickSfx = useCallback(() => {
    try {
      clickPlayer.seekTo(0);
      clickPlayer.play();
    } catch {
      // ignore sfx error
    }
  }, [clickPlayer]);

  // Derive playback state from actual native audio player
  const isPlaying = status.playing;
  const currentTime = status.currentTime;
  const duration =
    status.duration > 0 ? status.duration : (currentTrack?.duration ?? 24);
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  // Track switching helper
  const loadAndPlayTrack = useCallback(
    (track: Track, autoPlay = true) => {
      setCurrentTrack(track);
      if (track.uri) {
        try {
          const audioSource =
            typeof track.uri === 'string' ? { uri: track.uri } : track.uri;
          player.replace(audioSource);
          player.seekTo(0);
          if (autoPlay) {
            player.play();
          }
        } catch (err) {
          console.error('[PlayerContext] Error loading audio track:', err);
        }
      }
    },
    [player],
  );

  const goToTrack = useCallback(
    (index: number) => {
      transitionCbRef.current?.();
      playClickSfx();
      const clampedIndex = Math.max(0, Math.min(index, queue.length - 1));
      setQueueIndex(clampedIndex);
      const nextTrack = queue[clampedIndex]!;
      loadAndPlayTrack(nextTrack, true);
    },
    [queue, loadAndPlayTrack, playClickSfx],
  );

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      try {
        player.seekTo(0);
        player.play();
      } catch {
        // ignore seek error
      }
      return;
    }

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // End of queue
        player.pause();
        player.seekTo(0);
        return;
      }
    }

    goToTrack(nextIndex);
  }, [queue.length, queueIndex, repeatMode, player, goToTrack]);

  // Auto-advance when track finishes
  useEffect(() => {
    if (status.didJustFinish) {
      handleNext();
    }
  }, [status.didJustFinish, handleNext]);

  // ── Playback Controls ────────────────────────────────────────
  const play = useCallback(() => {
    playClickSfx();
    try {
      player.play();
    } catch (err) {
      console.error('[PlayerContext] play error:', err);
    }
  }, [player, playClickSfx]);

  const pause = useCallback(() => {
    playClickSfx();
    try {
      player.pause();
    } catch (err) {
      console.error('[PlayerContext] pause error:', err);
    }
  }, [player, playClickSfx]);

  const togglePlayPause = useCallback(() => {
    if (status.playing) {
      pause();
    } else {
      play();
    }
  }, [status.playing, pause, play]);

  const previous = useCallback(() => {
    if (status.currentTime > 3) {
      // Restart current track if played more than 3s
      player.seekTo(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    goToTrack(prevIndex);
  }, [status.currentTime, queue.length, queueIndex, repeatMode, player, goToTrack]);

  const seekTo = useCallback(
    (seconds: number) => {
      try {
        player.seekTo(seconds);
      } catch (err) {
        console.error('[PlayerContext] seekTo error:', err);
      }
    },
    [player],
  );

  const seekToProgress = useCallback(
    (prog: number) => {
      const dur = status.duration > 0 ? status.duration : (currentTrack?.duration ?? 0);
      if (dur > 0) {
        seekTo(Math.max(0, Math.min(prog, 1)) * dur);
      }
    },
    [status.duration, currentTrack?.duration, seekTo],
  );

  const setQueue = useCallback(
    (tracks: Track[], startIndex = 0) => {
      setQueueState(tracks);
      setQueueIndex(startIndex);
      setIsPlaylist(tracks.length > 1);
      const startTrack = tracks[startIndex];
      if (startTrack) {
        loadAndPlayTrack(startTrack, true);
      }
    },
    [loadAndPlayTrack],
  );

  const addToQueue = useCallback((track: Track) => {
    setQueueState((prev) => [...prev, track]);
  }, []);

  const playTrack = useCallback(
    (track: Track) => {
      transitionCbRef.current?.();
      playClickSfx();

      setQueueState((prev) => {
        // Exclude demo tracks so queue only contains user's actual tracks
        const realTracks = prev.filter((t) => t.source !== 'local');
        const existingIdx = realTracks.findIndex((t) => t.id === track.id);
        if (existingIdx >= 0) {
          setQueueIndex(existingIdx);
          return realTracks;
        }
        setQueueIndex(0);
        return [track, ...realTracks];
      });

      loadAndPlayTrack(track, true);
    },
    [loadAndPlayTrack, playClickSfx],
  );

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIdx = modes.indexOf(prev);
      return modes[(currentIdx + 1) % modes.length]!;
    });
  }, []);

  const setOnTrackTransition = useCallback((cb: (() => void) | undefined) => {
    transitionCbRef.current = cb;
  }, []);

  // ── Context Value ────────────────────────────────────────────
  const value = useMemo<PlayerContextValue>(
    () => ({
      currentTrack,
      queue,
      queueIndex,
      isPlaying,
      currentTime,
      duration,
      repeatMode,
      isShuffled,
      isPlaylist,
      playlistName,
      progress,
      play,
      pause,
      togglePlayPause,
      next: handleNext,
      previous,
      seekTo,
      seekToProgress,
      setQueue,
      addToQueue,
      playTrack,
      toggleShuffle,
      cycleRepeatMode,
      setOnTrackTransition,
    }),
    [
      currentTrack,
      queue,
      queueIndex,
      isPlaying,
      currentTime,
      duration,
      repeatMode,
      isShuffled,
      isPlaylist,
      playlistName,
      progress,
      play,
      pause,
      togglePlayPause,
      handleNext,
      previous,
      seekTo,
      seekToProgress,
      setQueue,
      addToQueue,
      playTrack,
      toggleShuffle,
      cycleRepeatMode,
      setOnTrackTransition,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a <PlayerProvider>');
  }
  return ctx;
}
