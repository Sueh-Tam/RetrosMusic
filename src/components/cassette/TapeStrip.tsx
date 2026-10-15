/**
 * TapeStrip — The visible magnetic tape between the two reels.
 *
 * Draws the two diagonal "legs" of tape going from each reel
 * down to the head area (bottom center of the window).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { RetroColors } from '@/constants/colors';

interface TapeStripProps {
  /** Width of the window area */
  windowWidth: number;
  /** Height of the window area */
  windowHeight: number;
}

export function TapeStrip({ windowWidth, windowHeight }: TapeStripProps) {
  // The tape runs from each reel (at ~30% and ~70% from left)
  // down to the head area (bottom center).
  // We simulate this with two thin angled views.

  const leftReelX = windowWidth * 0.28;
  const rightReelX = windowWidth * 0.72;
  const centerX = windowWidth * 0.5;
  const reelY = windowHeight * 0.45;
  const headY = windowHeight * 0.9;

  // Calculate angle and length for left tape leg
  const leftDx = centerX - leftReelX;
  const leftDy = headY - reelY;
  const leftLength = Math.sqrt(leftDx * leftDx + leftDy * leftDy);
  const leftAngle = Math.atan2(leftDy, leftDx) * (180 / Math.PI);

  // Calculate angle and length for right tape leg
  const rightDx = centerX - rightReelX;
  const rightDy = headY - reelY;
  const rightLength = Math.sqrt(rightDx * rightDx + rightDy * rightDy);
  const rightAngle = Math.atan2(rightDy, rightDx) * (180 / Math.PI);

  return (
    <View style={[styles.container, { width: windowWidth, height: windowHeight }]}>
      {/* Left tape leg */}
      <View
        style={[
          styles.tapeLeg,
          {
            width: leftLength,
            left: leftReelX,
            top: reelY,
            transform: [{ rotate: `${leftAngle}deg` }],
          },
        ]}
      />

      {/* Right tape leg */}
      <View
        style={[
          styles.tapeLeg,
          {
            width: rightLength,
            left: rightReelX,
            top: reelY,
            transform: [{ rotate: `${rightAngle}deg` }],
            transformOrigin: 'left center',
          },
        ]}
      />

      {/* Head area indicator (small rectangle at bottom center) */}
      <View
        style={[
          styles.headArea,
          {
            left: centerX - 20,
            top: headY - 3,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tapeLeg: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: RetroColors.tapeLight,
    transformOrigin: 'left center',
    opacity: 0.7,
  },
  headArea: {
    position: 'absolute',
    width: 40,
    height: 6,
    backgroundColor: RetroColors.metallicDark,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: RetroColors.metallic,
  },
});
