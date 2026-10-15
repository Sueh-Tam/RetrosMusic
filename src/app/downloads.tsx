/**
 * Downloads Screen — Visual cassette rack of all downloaded tracks.
 *
 * Displays saved music as retro cassette tapes, allows immediate playback
 * in the main deck, exporting to public phone folders (Meus Arquivos / Downloads),
 * sharing, and deleting local audio files.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { RetroColors } from '@/constants/colors';
import { useDownloads } from '@/contexts/DownloadsContext';
import { usePlayer } from '@/contexts/PlayerContext';
import type { Track } from '@/types/music';

// ── Cassette Tape Card Item ─────────────────────────────────────────
function CassetteItem({
  track,
  isCurrent,
  isPlaying,
  onPlay,
  onDelete,
  onExport,
  onShare,
}: {
  track: Track;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onDelete: (track: Track) => void;
  onExport: (track: Track) => void;
  onShare: (track: Track) => void;
}) {
  const accentColor = track.cassetteColor || RetroColors.amber;

  // Format date recorded
  const recordedDate = useMemo(() => {
    if (!track.downloadedAt) return 'Gravação recente';
    const d = new Date(track.downloadedAt);
    return `Gravada em ${d.getDate().toString().padStart(2, '0')}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
  }, [track.downloadedAt]);

  return (
    <View style={[styles.cassetteBox, isCurrent && styles.cassetteBoxActive]}>
      {/* Cassette Spine Color Strip */}
      <View style={[styles.cassetteSpine, { backgroundColor: accentColor }]} />

      {/* Main Cassette Body */}
      <View style={styles.cassetteCard}>
        {/* Top details bar */}
        <View style={styles.cassetteTopBar}>
          <View style={styles.typeBadge}>
            <Text style={[styles.typeBadgeText, { color: accentColor }]}>
              {track.cassetteType || 'TYPE I'}
            </Text>
          </View>
          <Text style={styles.recordedText}>{recordedDate}</Text>
          {track.formattedSize ? (
            <Text style={styles.sizeText}>{track.formattedSize}</Text>
          ) : null}
        </View>

        {/* Cassette Label Area */}
        <View style={styles.cassetteLabelArea}>
          <View style={styles.labelSticker}>
            <View style={styles.labelHeader}>
              <Text style={styles.labelHeaderSide}>SIDE A</Text>
              <Text style={styles.labelHeaderStereo}>STEREO</Text>
            </View>
            <Text
              style={styles.labelTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {track.title}
            </Text>
            <Text
              style={styles.labelArtist}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {track.artist}
            </Text>
          </View>
        </View>

        {/* Primary Play Action Row */}
        <View style={styles.cassetteActionsRow}>
          <Pressable
            onPress={() => onPlay(track)}
            style={[
              styles.playButton,
              isCurrent && styles.playButtonCurrent,
            ]}
          >
            <Text style={styles.playButtonIcon}>
              {isCurrent && isPlaying ? '⏸' : '▶'}
            </Text>
            <Text style={styles.playButtonText}>
              {isCurrent && isPlaying ? 'TOCANDO AGORA' : 'OUVIR NO DECK'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onDelete(track)}
            style={styles.deleteButton}
            hitSlop={8}
          >
            <Text style={styles.deleteButtonText}>🗑 APAGAR</Text>
          </Pressable>
        </View>

        {/* File Export and Share Actions */}
        <View style={styles.exportRow}>
          <Pressable
            onPress={() => onExport(track)}
            style={styles.exportButton}
          >
            <Text style={styles.exportButtonText}>💾 SALVAR (.MP3)</Text>
          </Pressable>
          <Pressable
            onPress={() => onShare(track)}
            style={styles.shareButton}
          >
            <Text style={styles.shareButtonText}>📤 COMPARTILHAR</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Main Downloads Screen ──────────────────────────────────────────
export default function DownloadsScreen() {
  const {
    downloadedTracks,
    isLoading,
    deleteSong,
    exportSong,
    shareSong,
    totalSizeFormatted,
  } = useDownloads();
  const { currentTrack, isPlaying, playTrack, setQueue } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleGoToDownload = useCallback(() => {
    router.push('/download');
  }, []);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return downloadedTracks;
    const q = searchQuery.toLowerCase().trim();
    return downloadedTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q),
    );
  }, [downloadedTracks, searchQuery]);

  // Play a single track immediately
  const handlePlayTrack = useCallback(
    (track: Track) => {
      playTrack(track);
      router.back(); // Return to main deck so user sees the cassette turning with real audio
    },
    [playTrack],
  );

  // Play all downloaded tracks in queue
  const handlePlayAll = useCallback(() => {
    if (downloadedTracks.length === 0) return;
    setQueue(downloadedTracks, 0);
    router.back();
  }, [downloadedTracks, setQueue]);

  // Export to public phone folder (Storage Access Framework)
  const handleExportTrack = useCallback(
    async (track: Track) => {
      try {
        const success = await exportSong(track);
        if (success) {
          Alert.alert(
            'Fita Salva no Celular!',
            `A música "${track.title}" foi salva com sucesso no formato .mp3 na pasta selecionada do seu celular!\n\nAgora você pode encontrá-la no app Meus Arquivos / Google Files / Downloads.`,
          );
        }
      } catch (err) {
        Alert.alert(
          'Erro ao Exportar',
          'Não foi possível salvar na pasta externa do celular.',
        );
      }
    },
    [exportSong],
  );

  // Share via system share sheet
  const handleShareTrack = useCallback(
    async (track: Track) => {
      try {
        await shareSong(track);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível compartilhar a fita.');
      }
    },
    [shareSong],
  );

  // Delete track with confirmation
  const handleDeleteTrack = useCallback(
    (track: Track) => {
      Alert.alert(
        'Apagar Fita',
        `Deseja realmente apagar a fita "${track.title}"? O arquivo será excluído da memória do aparelho.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Apagar',
            style: 'destructive',
            onPress: () => deleteSong(track.id),
          },
        ],
      );
    },
    [deleteSong],
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ──────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.headerButton}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>MINHAS FITAS</Text>
            <Text style={styles.headerSubtitle}>
              {downloadedTracks.length} FITAS GRAVADAS • {totalSizeFormatted}
            </Text>
          </View>
          <Pressable onPress={handleGoToDownload} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ GRAVAR</Text>
          </Pressable>
        </View>

        {/* ── Storage Hint Banner ─────────────────────────── */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>💡</Text>
          <Text style={styles.infoBannerText}>
            As fitas tocam offline no app. Toque em{' '}
            <Text style={styles.infoBannerHighlight}>
              "💾 SALVAR NO CELULAR"
            </Text>{' '}
            para copiá-las para sua pasta de Downloads / Músicas do aparelho.
          </Text>
        </View>

        {/* ── Toolbar: Play All & Search ───────────────────── */}
        {downloadedTracks.length > 0 && (
          <View style={styles.toolbar}>
            <Pressable onPress={handlePlayAll} style={styles.playAllButton}>
              <Text style={styles.playAllIcon}>▶</Text>
              <Text style={styles.playAllText}>TOCAR TODAS NO DECK</Text>
            </Pressable>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar fita ou artista..."
                placeholderTextColor={RetroColors.textMuted}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>
          </View>
        )}

        {/* ── Cassette List ─────────────────────────────────── */}
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CassetteItem
              track={item}
              isCurrent={currentTrack?.id === item.id}
              isPlaying={isPlaying}
              onPlay={handlePlayTrack}
              onDelete={handleDeleteTrack}
              onExport={handleExportTrack}
              onShare={handleShareTrack}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCassetteIconBox}>
                <Text style={styles.emptyCassetteIcon}>📼</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? 'NENHUMA FITA ENCONTRADA'
                  : 'ESTANTE DE FITAS VAZIA'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `Nenhuma gravação corresponde à busca "${searchQuery}".`
                  : 'Grave sua primeira fita a partir de links do YouTube ou presets para ouvir offline e com som no celular!'}
              </Text>
              {!searchQuery && (
                <Pressable
                  onPress={handleGoToDownload}
                  style={styles.emptyActionButton}
                >
                  <Text style={styles.emptyActionText}>
                    ⬇ GRAVAR PRIMEIRA FITA
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />

        {/* ── Bottom Cassette Rack Trim ─────────────────────── */}
        {downloadedTracks.length > 0 && (
          <View style={styles.rackTrim}>
            <View style={styles.rackTrimWood} />
            <Text style={styles.rackTrimText}>
              RETROS MUSIC TAPE RACK • {downloadedTracks.length} / 100 SLOTS
            </Text>
          </View>
        )}
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

  // ── Header ──────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: RetroColors.divider,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RetroColors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: RetroColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: RetroColors.amber,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: RetroColors.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: RetroColors.amber,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: RetroColors.background,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // ── Info Banner ─────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  infoBannerIcon: {
    fontSize: 16,
  },
  infoBannerText: {
    flex: 1,
    color: RetroColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  infoBannerHighlight: {
    color: RetroColors.amber,
    fontWeight: '700',
  },

  // ── Toolbar ─────────────────────────
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: RetroColors.surface,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RetroColors.surfaceLight,
    borderWidth: 1,
    borderColor: RetroColors.amber,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  playAllIcon: {
    color: RetroColors.amber,
    fontSize: 14,
  },
  playAllText: {
    color: RetroColors.amber,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RetroColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    paddingHorizontal: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    color: RetroColors.textPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
    paddingVertical: 8,
  },

  // ── List Content ────────────────────
  listContent: {
    padding: 16,
    gap: 14,
  },

  // ── Cassette Box Card ───────────────
  cassetteBox: {
    flexDirection: 'row',
    backgroundColor: RetroColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cassetteBoxActive: {
    borderColor: RetroColors.amber,
    borderWidth: 1.5,
  },
  cassetteSpine: {
    width: 8,
  },
  cassetteCard: {
    flex: 1,
    padding: 12,
    gap: 8,
  },

  // ── Top Details Bar ─────────────────
  cassetteTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: '#1E1A16',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#332D27',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  recordedText: {
    color: RetroColors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  sizeText: {
    color: RetroColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  // ── Label Area ──────────────────────
  cassetteLabelArea: {
    backgroundColor: '#0D0B08',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#292524',
  },
  labelSticker: {
    backgroundColor: '#F7F2E8',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: RetroColors.amber,
  },
  labelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelHeaderSide: {
    color: '#78716C',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  labelHeaderStereo: {
    color: '#78716C',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  labelTitle: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  labelArtist: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // ── Actions Row ─────────────────────
  cassetteActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RetroColors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
  },
  playButtonCurrent: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: RetroColors.amber,
  },
  playButtonIcon: {
    color: RetroColors.amber,
    fontSize: 12,
  },
  playButtonText: {
    color: RetroColors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: RetroColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },

  // ── Export and Share Actions ────────
  exportRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#26221E',
    paddingTop: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    borderRadius: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#38322B',
  },
  exportButtonText: {
    color: RetroColors.amber,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    borderRadius: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#38322B',
  },
  shareButtonText: {
    color: RetroColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },

  // ── Empty State ─────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyCassetteIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RetroColors.surface,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyCassetteIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    color: RetroColors.amber,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: RetroColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyActionButton: {
    backgroundColor: RetroColors.amber,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  emptyActionText: {
    color: RetroColors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // ── Rack Trim ───────────────────────
  rackTrim: {
    borderTopWidth: 1,
    borderTopColor: RetroColors.divider,
    backgroundColor: RetroColors.surface,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rackTrimWood: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: RetroColors.amberDark,
  },
  rackTrimText: {
    color: RetroColors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
});
