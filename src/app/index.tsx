/**
 * Home Screen — The main cassette deck player view.
 *
 * Layout:
 *   ┌─────────────────────────┐
 *   │     RETROS MUSIC        │  ← Header
 *   ├─────────────────────────┤
 *   │                         │
 *   │   ┌─────────────────┐   │
 *   │   │  CASSETTE TAPE  │   │  ← Animated K7
 *   │   │  with reels     │   │
 *   │   └─────────────────┘   │
 *   │                         │
 *   │   ━━━━●━━━━━━━━━━━━━    │  ← Progress
 *   │   0:45        3:22     │
 *   │                         │
 *   │     ⏮   ▶   ⏭         │  ← Controls
 *   │                         │
 *   ├─────────────────────────┤
 *   │  🔀   ⬇   🔁   📋     │  ← Footer
 *   └─────────────────────────┘
 */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { CassetteTape } from '@/components/cassette/CassetteTape';
import { RetroHeader } from '@/components/layout/RetroHeader';
import { PlayerControls } from '@/components/player/PlayerControls';
import { ProgressBar } from '@/components/player/ProgressBar';
import { RetroColors } from '@/constants/colors';
import { useDownloads } from '@/contexts/DownloadsContext';
import { usePlayer } from '@/contexts/PlayerContext';

export default function HomeScreen() {
  const {
    currentTrack,
    isPlaying,
    progress,
    isPlaylist,
    playlistName,
    isShuffled,
    repeatMode,
    toggleShuffle,
    cycleRepeatMode,
    queue,
    queueIndex,
  } = usePlayer();

  const { downloadedTracks } = useDownloads();

  const handleDownload = useCallback(() => {
    router.push('/download');
  }, []);

  const handleOpenDownloads = useCallback(() => {
    router.push('/downloads');
  }, []);

  const repeatIcon =
    repeatMode === 'one' ? '🔂' : repeatMode === 'all' ? '🔁' : '➡️';

  const isDownloadedTrack = currentTrack?.source === 'download';

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* ── HEADER ──────────────────────────────────────── */}
        <RetroHeader />

        {/* ── BODY ────────────────────────────────────────── */}
        <View style={styles.body}>
          {/* Tape Type / Counter Banner */}
          <View style={styles.counterRow}>
            {isDownloadedTrack ? (
              <View style={styles.tapeSourceBadge}>
                <Text style={styles.tapeSourceText}>
                  📼 FITA GRAVADA • {currentTrack?.cassetteType || 'TYPE I'}
                </Text>
              </View>
            ) : queue.length > 1 ? (
              <Text style={styles.trackCounter}>
                FAIXA {queueIndex + 1} DE {queue.length}
              </Text>
            ) : null}
          </View>

          {/* Cassette Tape */}
          <CassetteTape
            title={currentTrack?.title ?? 'No Track'}
            artist={currentTrack?.artist ?? '---'}
            isPlaying={isPlaying}
            progress={progress}
            isPlaylist={isPlaylist && !isDownloadedTrack}
            playlistName={playlistName}
          />

          {/* Progress Bar */}
          <View style={styles.progressWrapper}>
            <ProgressBar />
          </View>

          {/* Player Controls */}
          <PlayerControls />
        </View>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <View style={styles.footer}>
          <Pressable
            onPress={toggleShuffle}
            style={[styles.footerButton, isShuffled && styles.footerButtonActive]}
          >
            <Text style={[styles.footerIcon, isShuffled && styles.footerIconActive]}>
              🔀
            </Text>
            <Text style={[styles.footerLabel, isShuffled && styles.footerLabelActive]}>
              Shuffle
            </Text>
          </Pressable>

          <Pressable onPress={handleDownload} style={styles.footerButton}>
            <Text style={styles.footerIcon}>⬇️</Text>
            <Text style={styles.footerLabel}>Gravar</Text>
          </Pressable>

          <Pressable onPress={handleOpenDownloads} style={styles.footerButton}>
            <View style={styles.footerIconBadgeWrapper}>
              <Text style={styles.footerIcon}>📼</Text>
              {downloadedTracks.length > 0 && (
                <View style={styles.footerBadge}>
                  <Text style={styles.footerBadgeText}>
                    {downloadedTracks.length}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.footerLabel}>Minhas Fitas</Text>
          </Pressable>

          <Pressable
            onPress={cycleRepeatMode}
            style={[
              styles.footerButton,
              repeatMode !== 'off' && styles.footerButtonActive,
            ]}
          >
            <Text
              style={[
                styles.footerIcon,
                repeatMode !== 'off' && styles.footerIconActive,
              ]}
            >
              {repeatIcon}
            </Text>
            <Text
              style={[
                styles.footerLabel,
                repeatMode !== 'off' && styles.footerLabelActive,
              ]}
            >
              {repeatMode === 'one' ? 'Repetir 1' : repeatMode === 'all' ? 'Repetir' : 'Loop'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: RetroColors.background,
  },
  safeArea: {
    flex: 1,
  },

  // ── Body ────────────────────────────
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  trackCounter: {
    fontSize: 11,
    color: RetroColors.textMuted,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  progressWrapper: {
    width: '100%',
    marginTop: 20,
    marginBottom: 4,
  },

  // ── Footer ──────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: RetroColors.divider,
  },
  footerButton: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  footerButtonActive: {
    backgroundColor: RetroColors.surfaceLight,
  },
  footerIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  footerIconActive: {
    opacity: 1,
  },
  footerLabel: {
    fontSize: 9,
    color: RetroColors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerLabelActive: {
    color: RetroColors.amber,
  },
  counterRow: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tapeSourceBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderWidth: 1,
    borderColor: RetroColors.amber,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tapeSourceText: {
    color: RetroColors.amber,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  footerIconBadgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: RetroColors.amber,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  footerBadgeText: {
    color: RetroColors.background,
    fontSize: 9,
    fontWeight: '900',
  },
});
