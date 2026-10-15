/**
 * Download Screen — Record music from YouTube links or direct audio.
 *
 * Implements real downloads via expo-file-system, clipboard pasting via
 * expo-clipboard, live progress, and a nostalgic cassette recording animation.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { RetroColors } from '@/constants/colors';
import { useDownloads } from '@/contexts/DownloadsContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { SAMPLE_PRESETS, formatBytes } from '@/services/downloadService';
import type { Track } from '@/types/music';

// ── Validate YouTube URL or Direct Audio ───────────────────────────
function isValidUrl(url: string): boolean {
  const trimmed = url.trim();
  const ytPatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/music\.youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  const isYt = ytPatterns.some((p) => p.test(trimmed));
  const isDirectAudio = /\.(mp3|m4a|wav|ogg|aac)(\?.*)?$/i.test(trimmed);
  const isHttp = /^https?:\/\/.+/i.test(trimmed);

  return isYt || isDirectAudio || isHttp;
}

// ── REC Blinking LED Indicator ─────────────────────────────────────
function RecIndicator() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.recContainer, animatedStyle]}>
      <View style={styles.recDot} />
      <Text style={styles.recText}>REC</Text>
    </Animated.View>
  );
}

// ── Spinning Cassette Reel ─────────────────────────────────────────
function MiniReel({ spinning }: { spinning: boolean }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (spinning) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1800, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [spinning, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.miniReel, animatedStyle]}>
      <View style={styles.miniReelHole} />
      <View style={[styles.miniReelTooth, { transform: [{ rotate: '0deg' }] }]} />
      <View style={[styles.miniReelTooth, { transform: [{ rotate: '60deg' }] }]} />
      <View style={[styles.miniReelTooth, { transform: [{ rotate: '120deg' }] }]} />
    </Animated.View>
  );
}

// ── Main Download Screen ───────────────────────────────────────────
export default function DownloadScreen() {
  const {
    downloadSong,
    isDownloading,
    downloadProgress,
    downloadBytes,
    downloadedTracks,
    exportSong,
    shareSong,
  } = useDownloads();
  const { playTrack } = usePlayer();

  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadedTrack, setDownloadedTrack] = useState<Track | null>(null);
  const inputRef = useRef<TextInput>(null);
  const hasAutoCheckedClipboard = useRef(false);

  // Auto-check clipboard for links ONLY ONCE when screen opens
  useEffect(() => {
    if (hasAutoCheckedClipboard.current) return;
    hasAutoCheckedClipboard.current = true;

    async function checkClipboard() {
      try {
        const hasText = await Clipboard.hasStringAsync();
        if (hasText) {
          const text = await Clipboard.getStringAsync();
          if (text && isValidUrl(text)) {
            setUrl(text.trim());
          }
        }
      } catch {
        // silently ignore clipboard read errors
      }
    }
    checkClipboard();
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handleGoToDownloads = useCallback(() => {
    router.push('/downloads');
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text.trim());
        setErrorMsg('');
      } else {
        Alert.alert('Área de Transferência', 'Nenhum texto encontrado na área de transferência.');
      }
    } catch {
      Alert.alert('Aviso', 'Não foi possível ler a área de transferência.');
    }
  }, []);

  const handleStartDownload = useCallback(
    async (targetUrl?: string) => {
      const linkToDownload = (targetUrl || url).trim();
      Keyboard.dismiss();

      if (!linkToDownload) {
        setErrorMsg('Cole um link do YouTube ou áudio');
        return;
      }

      if (!isValidUrl(linkToDownload)) {
        setErrorMsg('Link inválido. Use um link do YouTube ou URL direta de áudio.');
        return;
      }

      setErrorMsg('');
      setDownloadedTrack(null);

      try {
        const track = await downloadSong(linkToDownload);
        setDownloadedTrack(track);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Falha ao baixar fita.';
        setErrorMsg(message);
        Alert.alert('Erro no Download', message);
      }
    },
    [url, downloadSong],
  );

  const handleSelectPreset = useCallback(
    (presetUrl: string) => {
      setUrl(presetUrl);
      handleStartDownload(presetUrl);
    },
    [handleStartDownload],
  );

  const handlePlayNow = useCallback(() => {
    if (downloadedTrack) {
      playTrack(downloadedTrack);
      router.back();
    }
  }, [downloadedTrack, playTrack]);

  const handleReset = useCallback(() => {
    setUrl('');
    setDownloadedTrack(null);
    setErrorMsg('');
    inputRef.current?.focus();
  }, []);

  const isDone = Boolean(downloadedTrack);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ──────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerIconButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>GRAVAR FITA</Text>
            <Text style={styles.headerSubtitle}>TAPE RECORDER • STEREO</Text>
          </View>
          <Pressable onPress={handleGoToDownloads} style={styles.headerBadgeButton}>
            <Text style={styles.headerBadgeIcon}>📼</Text>
            {downloadedTracks.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{downloadedTracks.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Tape Recorder Visual Box ─────────────────────── */}
          <View style={styles.recorderDeck}>
            <View style={styles.cassetteChamber}>
              <View
                style={[
                  styles.cassetteBody,
                  downloadedTrack?.cassetteColor
                    ? { borderColor: downloadedTrack.cassetteColor }
                    : null,
                ]}
              >
                {/* Cassette Header Bar */}
                <View style={styles.cassetteTopBar}>
                  <Text style={styles.cassetteModelText}>
                    {downloadedTrack?.cassetteType ?? 'TYPE I • NORMAL POSITION'}
                  </Text>
                  {isDownloading ? (
                    <RecIndicator />
                  ) : isDone ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>✓ GRAVADO</Text>
                    </View>
                  ) : (
                    <Text style={styles.blankBadgeText}>○ VIRGEM</Text>
                  )}
                </View>

                {/* Cassette Window with Reels */}
                <View style={styles.cassetteWindow}>
                  <MiniReel spinning={isDownloading} />
                  <View style={styles.tapeCenterBridge}>
                    <View style={styles.tapeStrip} />
                  </View>
                  <MiniReel spinning={isDownloading} />
                </View>

                {/* Label Sticker */}
                <View style={styles.cassetteSticker}>
                  <Text
                    style={styles.stickerTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {downloadedTrack
                      ? downloadedTrack.title
                      : isDownloading
                      ? 'GRAVANDO NOVO ÁUDIO...'
                      : 'FITA VIRGEM — RETROS'}
                  </Text>
                  <Text
                    style={styles.stickerArtist}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {downloadedTrack
                      ? downloadedTrack.artist
                      : isDownloading
                      ? 'Aguarde a gravação magnética'
                      : 'Pronta para gravação'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tape Status Meter */}
            <View style={styles.deckMeterRow}>
              <View style={styles.meterItem}>
                <Text style={styles.meterLabel}>SPEED</Text>
                <Text style={styles.meterValue}>4.76 cm/s</Text>
              </View>
              <View style={styles.meterDivider} />
              <View style={styles.meterItem}>
                <Text style={styles.meterLabel}>DOLBY NR</Text>
                <Text style={styles.meterValueActive}>B-TYPE ON</Text>
              </View>
              <View style={styles.meterDivider} />
              <View style={styles.meterItem}>
                <Text style={styles.meterLabel}>STATUS</Text>
                <Text
                  style={[
                    styles.meterValue,
                    isDownloading && styles.meterValueRed,
                    isDone && styles.meterValueGreen,
                  ]}
                >
                  {isDownloading ? 'RECORDING' : isDone ? 'READY' : 'STANDBY'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Live Download Progress ───────────────────────── */}
          {isDownloading && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>GRAVANDO DADOS MAGNÉTICOS</Text>
                <Text style={styles.progressPercent}>
                  {Math.round(downloadProgress * 100)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(5, downloadProgress * 100)}%` },
                  ]}
                />
              </View>
              <View style={styles.progressBytesRow}>
                <Text style={styles.progressBytesText}>
                  {downloadBytes.total > 0
                    ? `${formatBytes(downloadBytes.written)} / ${formatBytes(
                        downloadBytes.total,
                      )}`
                    : 'Conectando ao servidor de áudio...'}
                </Text>
                <Text style={styles.progressLed}>● REC</Text>
              </View>
            </View>
          )}

          {/* ── Input Section ─────────────────────────────────── */}
          {!isDone && (
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>
                COLE O LINK DO YOUTUBE OU ÁUDIO (.MP3)
              </Text>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={url}
                    onChangeText={(val) => {
                      setUrl(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Cole o link do YouTube ou áudio .mp3..."
                    placeholderTextColor={RetroColors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    returnKeyType="done"
                    editable={!isDownloading}
                  />
                  {url.length > 0 && !isDownloading ? (
                    <Pressable
                      onPress={() => {
                        setUrl('');
                        setErrorMsg('');
                        inputRef.current?.focus();
                      }}
                      style={styles.clearButton}
                      hitSlop={8}
                    >
                      <Text style={styles.clearIcon}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Pressable
                  onPress={handlePaste}
                  style={styles.pasteButton}
                  disabled={isDownloading}
                >
                  <Text style={styles.pasteIcon}>📋</Text>
                </Pressable>
              </View>

              {errorMsg ? (
                <Text style={styles.errorText}>⚠ {errorMsg}</Text>
              ) : null}
            </View>
          )}

          {/* ── Presets Section (Quick Test Links) ────────────── */}
          {!isDone && (
            <View style={styles.presetsSection}>
              <Text style={styles.sectionLabel}>
                📻 FITAS RETRÔ RÁPIDAS (1-TOQUE)
              </Text>
              <Text style={styles.presetsHelp}>
                Toque em uma fita para testar o download instantaneamente:
              </Text>
              <View style={styles.presetsList}>
                {SAMPLE_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.id}
                    onPress={() => handleSelectPreset(preset.title)}
                    style={[
                      styles.presetCard,
                      isDownloading && styles.presetCardDisabled,
                    ]}
                    disabled={isDownloading}
                  >
                    <View style={styles.presetSpine} />
                    <View style={styles.presetContent}>
                      <Text style={styles.presetTitle} numberOfLines={1}>
                        {preset.title}
                      </Text>
                      <Text style={styles.presetArtist}>{preset.artist}</Text>
                    </View>
                    <Text style={styles.presetDownloadIcon}>⬇</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ── Completion Card ──────────────────────────────── */}
          {isDone && downloadedTrack && (
            <View style={styles.completionCard}>
              <Text style={styles.completionTitle}>
                FITA GRAVADA COM SUCESSO!
              </Text>
              <Text style={styles.completionSubtitle}>
                O arquivo de áudio foi salvo no armazenamento offline do seu
                dispositivo.
              </Text>
              <View style={styles.trackDetailsBox}>
                <Text style={styles.detailsTitle}>{downloadedTrack.title}</Text>
                <Text style={styles.detailsArtist}>
                  {downloadedTrack.artist}
                </Text>
                <View style={styles.detailsMetaRow}>
                  <Text style={styles.detailsMeta}>
                    💾 {downloadedTrack.formattedSize || '3.5 MB'}
                  </Text>
                  <Text style={styles.detailsMeta}>
                    🏷 {downloadedTrack.cassetteType || 'TYPE I'}
                  </Text>
                  <Text style={styles.detailsMeta}>🟢 100% Salvo</Text>
                </View>
              </View>

              <View style={{ gap: 8, marginTop: 12 }}>
                <Pressable
                  onPress={async () => {
                    try {
                      const ok = await exportSong(downloadedTrack);
                      if (ok) {
                        Alert.alert(
                          'Fita Salva no Celular!',
                          `A música "${downloadedTrack.title}" foi salva com sucesso no formato .mp3 na pasta escolhida do seu aparelho!\n\nVocê já pode encontrá-la no app Meus Arquivos / Downloads.`,
                        );
                      }
                    } catch {
                      Alert.alert('Aviso', 'Não foi possível salvar na pasta selecionada.');
                    }
                  }}
                  style={styles.exportCompletionButton}
                >
                  <Text style={styles.exportCompletionText}>
                    💾 SALVAR NA PASTA DO CELULAR (.MP3)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    try {
                      await shareSong(downloadedTrack);
                    } catch {
                      Alert.alert('Aviso', 'Não foi possível compartilhar a fita.');
                    }
                  }}
                  style={[
                    styles.exportCompletionButton,
                    { backgroundColor: RetroColors.surfaceLight, borderColor: RetroColors.surfaceElevated },
                  ]}
                >
                  <Text style={[styles.exportCompletionText, { color: RetroColors.amber }]}>
                    📤 COMPARTILHAR OU SALVAR VIA APP
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ── Action Buttons ───────────────────────────────── */}
          <View style={styles.actions}>
            {isDone ? (
              <>
                <Pressable
                  onPress={handlePlayNow}
                  style={[styles.actionButton, styles.primaryButton]}
                >
                  <Text style={[styles.actionText, styles.primaryText]}>
                    ▶ OUVIR NO CASSETE
                  </Text>
                </Pressable>
                <View style={styles.doneButtonsRow}>
                  <Pressable
                    onPress={handleGoToDownloads}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>
                      📼 MINHAS FITAS
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleReset}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>
                      GRAVAR OUTRA
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                onPress={() => handleStartDownload()}
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                  isDownloading && styles.disabledButton,
                ]}
                disabled={isDownloading}
              >
                <Text style={[styles.actionText, styles.primaryText]}>
                  {isDownloading ? '● GRAVANDO NA FITA...' : '⬇ GRAVAR FITA'}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
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
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RetroColors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: RetroColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: RetroColors.amber,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: RetroColors.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  headerBadgeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RetroColors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBadgeIcon: {
    fontSize: 18,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: RetroColors.amber,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: RetroColors.background,
    fontSize: 10,
    fontWeight: '900',
  },

  // ── Cassette Recorder Deck ──────────
  recorderDeck: {
    backgroundColor: RetroColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cassetteChamber: {
    alignItems: 'center',
  },
  cassetteBody: {
    width: '100%',
    backgroundColor: '#1C1917',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: RetroColors.cassetteBorder,
    padding: 12,
    gap: 10,
  },
  cassetteTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2926',
  },
  cassetteModelText: {
    color: RetroColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  blankBadgeText: {
    color: RetroColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  doneBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: RetroColors.activeGreen,
  },
  doneBadgeText: {
    color: RetroColors.activeGreen,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cassetteWindow: {
    height: 60,
    backgroundColor: '#0D0B08',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#292524',
  },
  tapeCenterBridge: {
    flex: 1,
    height: 14,
    backgroundColor: '#1E1B18',
    marginHorizontal: 16,
    borderRadius: 3,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tapeStrip: {
    height: 4,
    backgroundColor: '#442200',
    borderRadius: 2,
  },

  // ── Mini Spinning Reels ─────────────
  miniReel: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3E8D6',
    borderWidth: 2,
    borderColor: '#D4C4A8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniReelHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0D0B08',
  },
  miniReelTooth: {
    position: 'absolute',
    width: 3,
    height: 28,
    backgroundColor: '#A89984',
    borderRadius: 1,
  },

  // ── Cassette Sticker ────────────────
  cassetteSticker: {
    backgroundColor: '#F5F0E6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2D9C8',
  },
  stickerTitle: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  stickerArtist: {
    color: '#78716C',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // ── Deck Meter Row ──────────────────
  deckMeterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#141210',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#26221E',
  },
  meterItem: {
    alignItems: 'center',
  },
  meterLabel: {
    color: RetroColors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  meterValue: {
    color: RetroColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  meterValueActive: {
    color: RetroColors.amber,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  meterValueRed: {
    color: RetroColors.recRed,
  },
  meterValueGreen: {
    color: RetroColors.activeGreen,
  },
  meterDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#26221E',
  },

  // ── REC Indicator ───────────────────
  recContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RetroColors.recRed,
  },
  recText: {
    color: RetroColors.recRed,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // ── Progress Section ────────────────
  progressSection: {
    backgroundColor: RetroColors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: RetroColors.amber,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  progressPercent: {
    color: RetroColors.amber,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1E1A16',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RetroColors.amber,
    borderRadius: 4,
  },
  progressBytesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  progressBytesText: {
    color: RetroColors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  progressLed: {
    color: RetroColors.recRed,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ── Input Section ───────────────────
  inputSection: {
    gap: 8,
  },
  sectionLabel: {
    color: RetroColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RetroColors.surface,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: RetroColors.textPrimary,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  clearButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    color: RetroColors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  pasteButton: {
    width: 48,
    backgroundColor: RetroColors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteIcon: {
    fontSize: 18,
  },
  errorText: {
    color: RetroColors.recRed,
    fontSize: 12,
    marginTop: 2,
  },

  // ── Presets Section ─────────────────
  presetsSection: {
    gap: 10,
  },
  presetsHelp: {
    color: RetroColors.textMuted,
    fontSize: 11,
  },
  presetsList: {
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RetroColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingRight: 14,
  },
  presetCardDisabled: {
    opacity: 0.5,
  },
  presetSpine: {
    width: 6,
    height: '100%',
    backgroundColor: RetroColors.amber,
    marginRight: 12,
  },
  presetContent: {
    flex: 1,
  },
  presetTitle: {
    color: RetroColors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  presetArtist: {
    color: RetroColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  presetDownloadIcon: {
    color: RetroColors.amber,
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Completion Card ─────────────────
  completionCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: 16,
    gap: 10,
  },
  completionTitle: {
    color: RetroColors.activeGreen,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  completionSubtitle: {
    color: RetroColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  trackDetailsBox: {
    backgroundColor: RetroColors.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
    gap: 4,
  },
  detailsTitle: {
    color: RetroColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  detailsArtist: {
    color: RetroColors.amber,
    fontSize: 12,
  },
  detailsMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  detailsMeta: {
    color: RetroColors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },

  // ── Actions ─────────────────────────
  actions: {
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: RetroColors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
  },
  primaryButton: {
    backgroundColor: RetroColors.amber,
    borderColor: RetroColors.amberDark,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionText: {
    color: RetroColors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  primaryText: {
    color: RetroColors.background,
  },
  doneButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: RetroColors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RetroColors.surfaceElevated,
  },
  secondaryButtonText: {
    color: RetroColors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  exportCompletionButton: {
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: RetroColors.amber,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  exportCompletionText: {
    color: RetroColors.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});
