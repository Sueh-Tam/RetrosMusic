/**
 * PlayerControls — Tape deck-style control buttons.
 *
 * Renders the classic ⏮ ▶/⏸ ⏭ controls with a metallic,
 * beveled button aesthetic that mimics physical tape deck buttons.
 * Includes press-down animation for tactile feedback.
 */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { RetroColors } from '@/constants/colors';
import { usePlayer } from '@/contexts/PlayerContext';
import { useCassetteSFX } from '@/hooks/useCassetteSFX';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── Individual Deck Button ─────────────────────────────────────────
interface DeckButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'normal' | 'large';
}

function DeckButton({ icon, onPress, size = 'normal' }: DeckButtonProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(2, { damping: 15, stiffness: 300 });
  }, [scale, translateY]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
    translateY.value = withSpring(0, { damping: 12, stiffness: 250 });
  }, [scale, translateY]);

  const isLarge = size === 'large';
  const buttonSize = isLarge ? 64 : 52;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        },
      ]}
    >
      <Text style={[styles.buttonIcon, isLarge && styles.buttonIconLarge]}>
        {icon}
      </Text>
    </AnimatedPressable>
  );
}

// ── Controls Panel ─────────────────────────────────────────────────
export function PlayerControls() {
  const { isPlaying, togglePlayPause, next, previous } = usePlayer();
  const { playTapeStart, playTapeStop, playButtonClick } = useCassetteSFX();

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      playTapeStop();
    } else {
      playTapeStart();
    }
    playButtonClick();
    togglePlayPause();
  }, [isPlaying, playTapeStart, playTapeStop, playButtonClick, togglePlayPause]);

  const handlePrev = useCallback(() => {
    playButtonClick();
    previous();
  }, [playButtonClick, previous]);

  const handleNext = useCallback(() => {
    playButtonClick();
    next();
  }, [playButtonClick, next]);

  return (
    <View style={styles.container}>
      {/* Metallic panel background */}
      <View style={styles.panel}>
        <DeckButton icon="⏮" onPress={handlePrev} />
        <DeckButton
          icon={isPlaying ? '⏸' : '▶'}
          onPress={handlePlayPause}
          size="large"
        />
        <DeckButton icon="⏭" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: RetroColors.surfaceLight,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,

    // Inner shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  button: {
    backgroundColor: RetroColors.metallic,
    alignItems: 'center',
    justifyContent: 'center',

    // Beveled 3D effect
    borderWidth: 2,
    borderTopColor: RetroColors.buttonHighlight,
    borderLeftColor: RetroColors.buttonHighlight,
    borderBottomColor: RetroColors.buttonShadow,
    borderRightColor: RetroColors.buttonShadow,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonIcon: {
    fontSize: 20,
    color: RetroColors.surface,
    textAlign: 'center',
  },
  buttonIconLarge: {
    fontSize: 26,
  },
});
