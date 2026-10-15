/**
 * ProgressBar — Retro-styled playback progress indicator.
 *
 * Shows a thin track bar with an amber fill and knob,
 * plus time labels (elapsed / total).
 * Supports touch-to-seek interaction.
 */
import React, { useCallback, useRef } from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RetroColors } from '@/constants/colors';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime } from '@/utils/formatTime';

export function ProgressBar() {
  const { progress, currentTime, duration, seekToProgress } = usePlayer();
  const trackWidthRef = useRef(0);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
  }, []);

  const handleTouch = useCallback(
    (e: GestureResponderEvent) => {
      if (trackWidthRef.current <= 0) return;
      const touchX = e.nativeEvent.locationX;
      const newProgress = Math.max(0, Math.min(1, touchX / trackWidthRef.current));
      seekToProgress(newProgress);
    },
    [seekToProgress],
  );

  const fillWidth = `${Math.max(0, Math.min(100, progress * 100))}%`;

  return (
    <View style={styles.container}>
      {/* Track bar */}
      <View
        style={styles.track}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        {/* Fill */}
        <View style={[styles.fill, { width: fillWidth as unknown as number }]} />

        {/* Knob */}
        <View
          style={[
            styles.knob,
            { left: fillWidth as unknown as number },
          ]}
        />
      </View>

      {/* Time labels */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 4,
  },
  track: {
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 8,
    height: 4,
    backgroundColor: RetroColors.amber,
    borderRadius: 2,
  },
  knob: {
    position: 'absolute',
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: RetroColors.amberGlow,
    marginLeft: -6,
    borderWidth: 1.5,
    borderColor: RetroColors.amberDark,
    shadowColor: RetroColors.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: RetroColors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
