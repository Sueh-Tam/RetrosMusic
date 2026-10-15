/**
 * RetroHeader — App header with the brand name.
 *
 * Displays "RetrosMusic" in an amber/gold vintage style.
 * Tapping the name navigates back to the home screen.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { RetroColors } from '@/constants/colors';

export function RetroHeader() {
  const handlePress = () => {
    // Navigate to home / reset to initial state
    if (router.canGoBack()) {
      router.back();
    }
    // If already at index, this is a no-op — could add a "reset player" action here
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.pressable}>
        <Text style={styles.brandText}>RetrosMusic</Text>
      </Pressable>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  pressable: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    color: RetroColors.amber,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: RetroColors.amberDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: RetroColors.divider,
    marginTop: 6,
  },
});
