/**
 * CassetteLabel — The paper label on the cassette tape.
 *
 * Displays the track title in a handwritten-style font and the
 * artist name below it, all on a ruled-paper background.
 * Shows a different style for playlists vs single tracks.
 */
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { RetroColors } from '@/constants/colors';

interface CassetteLabelProps {
  title: string;
  artist: string;
  isPlaylist: boolean;
  playlistName?: string;
}

/**
 * Handwritten / cursive font — uses the system cursive on Android
 * and Snell Roundhand on iOS. Replace with a custom font like
 * Caveat for a more authentic "marker on cassette" look.
 */
const HANDWRITTEN_FONT = Platform.select({
  ios: 'Snell Roundhand',
  android: 'cursive',
  default: 'cursive',
});

export function CassetteLabel({ title, artist, isPlaylist, playlistName }: CassetteLabelProps) {
  const labelBg = isPlaylist ? RetroColors.playlistLabel : RetroColors.label;
  const lineColor = isPlaylist ? RetroColors.playlistLabelLines : RetroColors.labelLines;
  const textColor = isPlaylist ? RetroColors.playlistLabelText : RetroColors.labelText;
  const fadedColor = isPlaylist ? RetroColors.playlistLabelText : RetroColors.labelTextFaded;

  return (
    <View style={[styles.container, { backgroundColor: labelBg }]}>
      {/* Playlist badge */}
      {isPlaylist && playlistName ? (
        <View style={styles.playlistBadge}>
          <Text style={styles.playlistBadgeText}>⬤ MIXTAPE</Text>
        </View>
      ) : null}

      {/* Top ruled line */}
      <View style={[styles.ruledLine, { backgroundColor: lineColor }]} />

      {/* Track Title */}
      <Text
        style={[styles.title, { color: textColor, fontFamily: HANDWRITTEN_FONT }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        ♪ {title} ♪
      </Text>

      {/* Middle ruled line */}
      <View style={[styles.ruledLine, { backgroundColor: lineColor }]} />

      {/* Artist Name */}
      <Text style={[styles.artist, { color: fadedColor }]} numberOfLines={1}>
        {artist}
      </Text>

      {/* Bottom ruled line */}
      <View style={[styles.ruledLine, { backgroundColor: lineColor }]} />

      {/* Playlist name or tape type indicator */}
      <Text style={[styles.tapeType, { color: fadedColor }]}>
        {isPlaylist && playlistName ? playlistName : 'TYPE I • Fe₂O₃'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: RetroColors.labelLines,
    marginHorizontal: 14,
    marginTop: 10,
    minHeight: 80,
    justifyContent: 'center',
  },
  playlistBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: RetroColors.playlistBodyDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  playlistBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  ruledLine: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 3,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 2,
    letterSpacing: 0.5,
  },
  artist: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 1,
  },
  tapeType: {
    fontSize: 7,
    textAlign: 'right',
    marginTop: 2,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
});
