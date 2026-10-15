/**
 * CassetteTape — Full cassette tape assembly.
 *
 * Composes the outer shell, label, window with animated reels,
 * and tape strip into a complete K7 cassette visualization.
 * Supports two visual modes: standard (single track) and playlist.
 */
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { RetroColors } from '@/constants/colors';

import { CassetteLabel } from './CassetteLabel';
import { CassetteReel } from './CassetteReel';
import { TapeStrip } from './TapeStrip';

interface CassetteTapeProps {
  title: string;
  artist: string;
  isPlaying: boolean;
  progress: number;
  isPlaylist: boolean;
  playlistName?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CASSETTE_WIDTH = Math.min(SCREEN_WIDTH - 40, 360);
const CASSETTE_HEIGHT = CASSETTE_WIDTH * 0.65;
const WINDOW_HEIGHT = CASSETTE_HEIGHT * 0.32;
const WINDOW_WIDTH = CASSETTE_WIDTH - 36;
const REEL_SIZE = WINDOW_HEIGHT * 0.78;

export function CassetteTape({
  title,
  artist,
  isPlaying,
  progress,
  isPlaylist,
  playlistName,
}: CassetteTapeProps) {
  const bodyColors = useMemo(
    () =>
      isPlaylist
        ? {
            body: RetroColors.playlistBody,
            bodyLight: RetroColors.playlistBodyLight,
            border: RetroColors.playlistBorder,
          }
        : {
            body: RetroColors.cassetteBody,
            bodyLight: RetroColors.cassetteBodyLight,
            border: RetroColors.cassetteBorder,
          },
    [isPlaylist],
  );

  return (
    <View style={styles.shadowWrapper}>
      {/* Drop shadow underneath */}
      <View style={styles.shadow} />

      {/* ── Outer Shell ─────────────────────────────────────── */}
      <View
        style={[
          styles.shell,
          {
            backgroundColor: bodyColors.body,
            borderColor: bodyColors.border,
            width: CASSETTE_WIDTH,
            height: CASSETTE_HEIGHT,
          },
        ]}
      >
        {/* Top highlight edge (3D effect) */}
        <View style={[styles.topEdge, { backgroundColor: bodyColors.bodyLight }]} />

        {/* ── Screw Details ──────────────────────────────────── */}
        <View style={[styles.screw, styles.screwTL]} />
        <View style={[styles.screw, styles.screwTR]} />
        <View style={[styles.screw, styles.screwBL]} />
        <View style={[styles.screw, styles.screwBR]} />

        {/* ── Label Area ─────────────────────────────────────── */}
        <CassetteLabel
          title={title}
          artist={artist}
          isPlaylist={isPlaylist}
          playlistName={playlistName}
        />

        {/* ── Window Area (shows reels & tape) ───────────────── */}
        <View style={styles.windowFrame}>
          <View
            style={[
              styles.window,
              { width: WINDOW_WIDTH, height: WINDOW_HEIGHT },
            ]}
          >
            {/* Tape strip between reels */}
            <TapeStrip windowWidth={WINDOW_WIDTH} windowHeight={WINDOW_HEIGHT} />

            {/* Left Reel (Supply — starts full) */}
            <View style={styles.reelLeft}>
              <CassetteReel
                isPlaying={isPlaying}
                progress={progress}
                side="supply"
                size={REEL_SIZE}
              />
            </View>

            {/* Right Reel (Takeup — starts empty) */}
            <View style={styles.reelRight}>
              <CassetteReel
                isPlaying={isPlaying}
                progress={progress}
                side="takeup"
                size={REEL_SIZE}
              />
            </View>
          </View>
        </View>

        {/* ── Bottom Details (guide teeth) ───────────────────── */}
        <View style={styles.bottomDetails}>
          <View style={styles.guideLeft} />
          <View style={styles.headSlot} />
          <View style={styles.guideRight} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    position: 'absolute',
    width: CASSETTE_WIDTH - 20,
    height: 20,
    bottom: -12,
    backgroundColor: 'transparent',
    borderRadius: CASSETTE_WIDTH / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  shell: {
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.6,
  },

  // ── Screws ───────────────────────────────────
  screw: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RetroColors.screw,
    borderWidth: 1,
    borderColor: RetroColors.screwHighlight,
  },
  screwTL: { top: 6, left: 6 },
  screwTR: { top: 6, right: 6 },
  screwBL: { bottom: 6, left: 6 },
  screwBR: { bottom: 6, right: 6 },

  // ── Window ───────────────────────────────────
  windowFrame: {
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 18,
  },
  window: {
    backgroundColor: RetroColors.cassetteWindow,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: RetroColors.cassetteWindowBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  reelLeft: {
    zIndex: 1,
  },
  reelRight: {
    zIndex: 1,
  },

  // ── Bottom Details ───────────────────────────
  bottomDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
    paddingHorizontal: 40,
  },
  guideLeft: {
    width: 30,
    height: 8,
    backgroundColor: RetroColors.metallicDark,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: RetroColors.metallic,
  },
  headSlot: {
    flex: 1,
    height: 10,
    backgroundColor: RetroColors.cassetteWindow,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: RetroColors.cassetteWindowBorder,
    marginHorizontal: 8,
  },
  guideRight: {
    width: 30,
    height: 8,
    backgroundColor: RetroColors.metallicDark,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: RetroColors.metallic,
  },
});
