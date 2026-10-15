/**
 * CassetteReel — Animated tape reel component.
 *
 * Draws a reel with hub, spokes, and wound tape using pure Views.
 * Rotates continuously when playing, stops on pause.
 * Tape radius varies proportionally to playback progress.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { RetroColors } from '@/constants/colors';

interface CassetteReelProps {
  /** Whether the tape is currently playing */
  isPlaying: boolean;
  /** Playback progress from 0 to 1 */
  progress: number;
  /** Which side the reel is on — determines tape winding direction */
  side: 'supply' | 'takeup';
  /** Overall size of the reel container */
  size: number;
}

const SPOKE_COUNT = 6;
const MIN_TAPE_RATIO = 0.38; // minimum visible tape (hub only)
const MAX_TAPE_RATIO = 0.92; // maximum wound tape fills nearly all space

export function CassetteReel({ isPlaying, progress, side, size }: CassetteReelProps) {
  const rotation = useSharedValue(0);

  // ── Rotation Animation ───────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: 1800,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      cancelAnimation(rotation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // ── Tape Size Calculation ────────────────────────────────────
  // Supply reel: starts full, decreases with progress
  // Takeup reel: starts empty, increases with progress
  const tapeRatio =
    side === 'supply'
      ? MAX_TAPE_RATIO - progress * (MAX_TAPE_RATIO - MIN_TAPE_RATIO)
      : MIN_TAPE_RATIO + progress * (MAX_TAPE_RATIO - MIN_TAPE_RATIO);

  const tapeSize = size * tapeRatio;
  const hubSize = size * 0.38;
  const centerSize = size * 0.1;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Wound Tape — variable size circle */}
      <Animated.View style={[styles.reelWrapper, animatedStyle]}>
        <View
          style={[
            styles.tape,
            {
              width: tapeSize,
              height: tapeSize,
              borderRadius: tapeSize / 2,
            },
          ]}
        >
          {/* Tape sheen ring */}
          <View
            style={[
              styles.tapeSheen,
              {
                width: tapeSize - 4,
                height: tapeSize - 4,
                borderRadius: (tapeSize - 4) / 2,
              },
            ]}
          />

          {/* Hub — fixed size gray center */}
          <View
            style={[
              styles.hub,
              {
                width: hubSize,
                height: hubSize,
                borderRadius: hubSize / 2,
              },
            ]}
          >
            {/* Spokes */}
            {Array.from({ length: SPOKE_COUNT }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.spoke,
                  {
                    width: hubSize * 0.85,
                    height: 2,
                    transform: [{ rotate: `${(i * 180) / SPOKE_COUNT}deg` }],
                  },
                ]}
              />
            ))}

            {/* Center Hole */}
            <View
              style={[
                styles.center,
                {
                  width: centerSize,
                  height: centerSize,
                  borderRadius: centerSize / 2,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tape: {
    backgroundColor: RetroColors.tape,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RetroColors.tapeLight,
  },
  tapeSheen: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: RetroColors.tapeSheen,
    opacity: 0.3,
  },
  hub: {
    backgroundColor: RetroColors.reelHub,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: RetroColors.reelHubDark,
  },
  spoke: {
    position: 'absolute',
    backgroundColor: RetroColors.reelSpoke,
    borderRadius: 1,
  },
  center: {
    position: 'absolute',
    backgroundColor: RetroColors.reelCenter,
    borderWidth: 1,
    borderColor: '#333333',
  },
});
