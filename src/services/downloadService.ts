/**
 * Download Service — Manages music downloads, YouTube audio stream extraction,
 * persistent local storage, and export to phone folders.
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { Track } from '@/types/music';

const MUSIC_DIR = `${FileSystem.documentDirectory}retros_music/`;
const INDEX_FILE = `${MUSIC_DIR}library.json`;

// Retro cassette skin palettes
const CASSETTE_PALETTES = [
  { color: '#D97706', type: 'Type I' as const }, // Classic Amber
  { color: '#2563EB', type: 'Type II' as const }, // Chrome Blue
  { color: '#DC2626', type: 'Type I' as const }, // Vintage Red
  { color: '#059669', type: 'Type II' as const }, // Metal Jade
  { color: '#7C3AED', type: 'Type IV' as const }, // Neon Synthwave
  { color: '#4B5563', type: 'Type I' as const }, // Dark Ferric
];

// Presets for demo recording
export const SAMPLE_PRESETS = [
  {
    id: 'sample-1',
    title: 'Midnight Synthwave Drive',
    artist: 'Retro Horizon',
    duration: 24,
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
  },
  {
    id: 'sample-2',
    title: 'Neon Dreams 1984',
    artist: 'Analog Memory',
    duration: 20,
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
  },
  {
    id: 'sample-3',
    title: 'Cassette Tape Lo-Fi Chill',
    artist: 'Vintage Deck',
    duration: 24,
    artwork: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
  },
];

export interface ExtractedMetadata {
  title: string;
  artist: string;
  artwork?: string;
  videoId?: string;
  duration?: number;
}

/**
 * Format bytes to human readable string (e.g. 3.4 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Clean up titles by removing noise like (Official Video), (4K Remaster), etc.
 */
function cleanSongTitle(rawTitle: string): { title: string; artist?: string } {
  const cleaned = rawTitle
    .replace(
      /\s*[\(\[](official\s*(music\s*)?video|video\s*oficial|audio|4k\s*remaster|hd|lyric\s*video|visualizer|clip\s*officiel)[\)\]]/gi,
      '',
    )
    .trim();

  // Check if title has "Artist - Track" or "Artist — Track"
  const separators = [' - ', ' — ', ' – ', ' : '];
  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep);
      if (parts.length >= 2) {
        const artist = parts[0]?.trim();
        const title = parts.slice(1).join(sep).trim();
        if (artist && title) {
          return { artist, title };
        }
      }
    }
  }

  return { title: cleaned };
}

/**
 * Extract YouTube Video ID from any URL format
 */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|music\.youtube\.com\/watch\?v=))([\w-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1]! : null;
}

/**
 * Fetch video metadata via YouTube oEmbed (no API key required)
 */
export async function fetchYouTubeMetadata(url: string): Promise<ExtractedMetadata> {
  const videoId = extractYouTubeId(url);
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url,
    )}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      const rawTitle = data.title ?? 'Fita Desconhecida';
      const parsed = cleanSongTitle(rawTitle);

      return {
        title: parsed.title,
        artist: parsed.artist || data.author_name || 'Artista Desconhecido',
        artwork:
          data.thumbnail_url ||
          (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined),
        videoId: videoId ?? undefined,
      };
    }
  } catch (err) {
    console.warn('[DownloadService] Failed to fetch oEmbed metadata:', err);
  }

  return {
    title: videoId ? `YouTube Track #${videoId.slice(0, 6)}` : 'Música Retrô',
    artist: 'YouTube Audio',
    artwork: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined,
    videoId: videoId ?? undefined,
  };
}

/**
 * Resolve direct audio stream from a YouTube video
 * Tries multiple public Invidious instances to locate the real audio track.
 */
async function fetchYouTubeAudioStreamUrl(videoId: string): Promise<string | null> {
  const instances = [
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://invidious.private.coffee',
    'https://yt.artemislena.eu',
    'https://invidious.projectsegfau.lt',
  ];

  for (const instance of instances) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        // Check adaptiveFormats for audio stream
        if (Array.isArray(data.adaptiveFormats)) {
          const audioFormats = data.adaptiveFormats.filter((f: any) =>
            f.type?.includes('audio') || f.container === 'm4a' || f.container === 'mp3'
          );
          if (audioFormats.length > 0) {
            const best =
              audioFormats.find((f: any) => f.container === 'm4a') || audioFormats[0];
            if (best?.url) {
              return best.url;
            }
          }
        }

        // Fallback to formatStreams (contains audio track)
        if (Array.isArray(data.formatStreams) && data.formatStreams.length > 0) {
          const directStream = data.formatStreams[0];
          if (directStream?.url) {
            return directStream.url;
          }
        }
      }
    } catch {
      // try next instance
    }
  }

  return null;
}

/**
 * Ensure music directory exists
 */
async function ensureDirectoryExists(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(MUSIC_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MUSIC_DIR, { intermediates: true });
  }
}

/**
 * Generates an authentic retro synthesizer WAV file in Base64 (for presets)
 */
function generateRetroAudioBase64(durationSeconds = 24): string {
  const sampleRate = 22050;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = totalSamples * 2;
  const bufferSize = 44 + dataSize;
  const u8 = new Uint8Array(bufferSize);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      u8[offset + i] = str.charCodeAt(i);
    }
  };

  const writeUInt16 = (offset: number, val: number) => {
    u8[offset] = val & 0xff;
    u8[offset + 1] = (val >> 8) & 0xff;
  };

  const writeUInt32 = (offset: number, val: number) => {
    u8[offset] = val & 0xff;
    u8[offset + 1] = (val >> 8) & 0xff;
    u8[offset + 2] = (val >> 16) & 0xff;
    u8[offset + 3] = (val >> 24) & 0xff;
  };

  writeString(0, 'RIFF');
  writeUInt32(4, 36 + dataSize);
  writeString(8, 'WAVE');

  writeString(12, 'fmt ');
  writeUInt32(16, 16);
  writeUInt16(20, 1);
  writeUInt16(22, 1);
  writeUInt32(24, sampleRate);
  writeUInt32(28, sampleRate * 2);
  writeUInt16(32, 2);
  writeUInt16(34, 16);

  writeString(36, 'data');
  writeUInt32(40, dataSize);

  const bassNotes = [110, 87.31, 130.81, 98.0];
  const arpScales = [
    [220, 261.63, 329.63, 440, 523.25, 440, 329.63, 261.63],
    [174.61, 220, 261.63, 349.23, 440, 349.23, 261.63, 220],
    [261.63, 329.63, 392, 523.25, 659.25, 523.25, 392, 329.63],
    [196, 246.94, 293.66, 392, 493.88, 392, 293.66, 246.94],
  ];

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t % 16) / 4);
    const bassFreq = bassNotes[chordIndex]!;
    const arpNotes = arpScales[chordIndex]!;

    const bass =
      ((t * bassFreq) % 1 - 0.5) * 0.28 +
      Math.sin(2 * Math.PI * bassFreq * 0.5 * t) * 0.25;

    const arpStep = Math.floor((t % 4) / 0.125) % arpNotes.length;
    const leadFreq = arpNotes[arpStep]!;
    const leadEnv = Math.exp(-((t % 0.125) / 0.125) * 4);
    const lead = Math.sin(2 * Math.PI * leadFreq * t) * leadEnv * 0.32;

    const beatPos = (t % 0.5) / 0.5;
    const beatNum = Math.floor(t / 0.5) % 4;
    let drum = 0;
    if (beatNum === 0 || beatNum === 2) {
      const kickEnv = Math.exp(-beatPos * 12);
      drum +=
        Math.sin(2 * Math.PI * (120 * Math.exp(-beatPos * 8)) * t) * kickEnv * 0.38;
    } else {
      const snareEnv = Math.exp(-beatPos * 8);
      drum += (Math.random() * 2 - 1) * snareEnv * 0.18;
    }

    const hiss = (Math.random() * 2 - 1) * 0.015;
    const mix = Math.max(-1, Math.min(1, (bass + lead + drum + hiss) * 0.8));
    const sampleVal = Math.floor(mix < 0 ? mix * 0x8000 : mix * 0x7fff);

    u8[offset] = sampleVal & 0xff;
    u8[offset + 1] = (sampleVal >> 8) & 0xff;
    offset += 2;
  }

  let binary = '';
  const len = u8.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = u8.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Read the list of downloaded tracks from disk
 */
export async function getDownloadedTracks(): Promise<Track[]> {
  try {
    await ensureDirectoryExists();
    const fileInfo = await FileSystem.getInfoAsync(INDEX_FILE);
    if (!fileInfo.exists) {
      return [];
    }
    const content = await FileSystem.readAsStringAsync(INDEX_FILE);
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[DownloadService] Error reading downloaded tracks index:', err);
    return [];
  }
}

/**
 * Save track list index to disk
 */
async function saveTracksIndex(tracks: Track[]): Promise<void> {
  await ensureDirectoryExists();
  await FileSystem.writeAsStringAsync(INDEX_FILE, JSON.stringify(tracks, null, 2));
}

/**
 * Download a track with progress callback and save to local storage
 */
export async function downloadMusicTrack({
  url,
  customTitle,
  customArtist,
  onProgress,
}: {
  url: string;
  customTitle?: string;
  customArtist?: string;
  onProgress?: (progress: number, bytesWritten: number, totalBytes: number) => void;
}): Promise<Track> {
  await ensureDirectoryExists();

  const isYouTube = extractYouTubeId(url) !== null;
  const videoId = extractYouTubeId(url);
  let metadata: ExtractedMetadata;
  const isPreset = SAMPLE_PRESETS.some((p) => p.title === url || url.includes(p.id));

  if (isYouTube) {
    metadata = await fetchYouTubeMetadata(url);
  } else if (isPreset) {
    const preset = SAMPLE_PRESETS.find((p) => p.title === url || url.includes(p.id))!;
    metadata = {
      title: preset.title,
      artist: preset.artist,
      artwork: preset.artwork,
      duration: preset.duration,
    };
  } else {
    const filename = url.split('/').pop()?.split('?')[0] || 'audio.mp3';
    metadata = {
      title: customTitle || filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      artist: customArtist || 'Áudio Baixado',
    };
  }

  const title = customTitle || metadata.title;
  const artist = customArtist || metadata.artist;
  const trackId = `tape_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  // Note: ALWAYS store as .mp3 extension so Android / iOS file managers identify it correctly
  const localFileName = `${trackId}.mp3`;
  const fileDestination = `${MUSIC_DIR}${localFileName}`;

  let downloadSucceeded = false;

  // Case 1: Direct Audio URL (e.g. .mp3, .m4a, .wav, or raw link)
  const isDirectAudio = /\.(mp3|m4a|wav|ogg|aac)(\?.*)?$/i.test(url);
  if (isDirectAudio) {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileDestination,
        {},
        (downloadProgress) => {
          const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
          const pct =
            totalBytesExpectedToWrite > 0
              ? totalBytesWritten / totalBytesExpectedToWrite
              : 0.5;
          onProgress?.(pct, totalBytesWritten, totalBytesExpectedToWrite);
        },
      );
      const res = await downloadResumable.downloadAsync();
      if (res && res.uri) {
        downloadSucceeded = true;
      }
    } catch (err) {
      console.warn('[DownloadService] Direct audio download error:', err);
    }
  }

  // Case 2: YouTube URL — extract actual audio stream
  if (isYouTube && videoId) {
    // Notify progress: extracting
    onProgress?.(0.15, 150000, 1000000);
    const streamUrl = await fetchYouTubeAudioStreamUrl(videoId);

    if (streamUrl) {
      try {
        const downloadResumable = FileSystem.createDownloadResumable(
          streamUrl,
          fileDestination,
          {},
          (downloadProgress) => {
            const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
            const pct =
              totalBytesExpectedToWrite > 0
                ? totalBytesWritten / totalBytesExpectedToWrite
                : 0.5;
            onProgress?.(pct, totalBytesWritten, totalBytesExpectedToWrite);
          },
        );
        const res = await downloadResumable.downloadAsync();
        if (res && res.uri) {
          downloadSucceeded = true;
        }
      } catch (err) {
        console.warn('[DownloadService] Failed downloading YouTube stream:', err);
      }
    }
  }

  // Case 3: Preset Demo Tape
  if (isPreset && !downloadSucceeded) {
    const totalBytes = 1058444;
    for (let step = 1; step <= 8; step++) {
      const pct = step / 8;
      onProgress?.(pct, Math.floor(pct * totalBytes), totalBytes);
      await new Promise((r) => setTimeout(r, 80));
    }
    const base64Audio = generateRetroAudioBase64(metadata.duration || 24);
    await FileSystem.writeAsStringAsync(fileDestination, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });
    downloadSucceeded = true;
  }

  // If download failed for YouTube (due to strict IP rate-limiting by YouTube):
  if (!downloadSucceeded) {
    throw new Error(
      'Não foi possível extrair o áudio deste vídeo do YouTube no momento. Tente outro vídeo ou cole uma URL direta de áudio (.mp3)!',
    );
  }

  // Verify file on disk
  const fileInfo = await FileSystem.getInfoAsync(fileDestination);
  const fileSize =
    fileInfo.exists && typeof fileInfo.size === 'number' ? fileInfo.size : 1058444;
  const formattedSize = formatBytes(fileSize);

  const palette =
    CASSETTE_PALETTES[Math.floor(Math.random() * CASSETTE_PALETTES.length)]!;

  const newTrack: Track = {
    id: trackId,
    title,
    artist,
    duration: metadata.duration || 180,
    uri: fileDestination,
    artwork: metadata.artwork,
    source: 'download',
    fileSize,
    formattedSize,
    downloadedAt: Date.now(),
    cassetteColor: palette.color,
    cassetteType: palette.type,
    youtubeUrl: isYouTube ? url : undefined,
  };

  const existingTracks = await getDownloadedTracks();
  const updatedTracks = [newTrack, ...existingTracks];
  await saveTracksIndex(updatedTracks);

  return newTrack;
}

/**
 * Share audio file via native Android/iOS share sheet (expo-sharing)
 * Allows saving to Google Files, Drive, WhatsApp, etc.
 */
export async function shareTrackAudio(track: Track): Promise<boolean> {
  if (!track.uri) return false;
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Compartilhamento não disponível neste aparelho.');
    }
    await Sharing.shareAsync(track.uri, {
      mimeType: 'audio/mpeg',
      dialogTitle: `Salvar ou Compartilhar: ${track.title}.mp3`,
      UTI: 'public.mp3',
    });
    return true;
  } catch (err) {
    console.error('[DownloadService] Share error:', err);
    return false;
  }
}

/**
 * Export track directly to user's public phone folder (Download / Music)
 * using Android Storage Access Framework (SAF)
 * Explicitly appends .mp3 extension so file managers identify it properly.
 */
export async function exportTrackToPhoneFolder(track: Track): Promise<boolean> {
  if (!track.uri || typeof track.uri !== 'string') {
    throw new Error('Esta fita não possui arquivo de áudio local para exportar.');
  }

  try {
    if (Platform.OS === 'android') {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        return false;
      }

      // Clean file name and ensure it strictly ends with .mp3
      // Remove any internal dots that might confuse Android's DocumentProvider
      const cleanTitle = (track.title || 'Musica')
        .replace(/[/\\?%*:|"<>.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const cleanArtist = (track.artist || 'RetrosMusic')
        .replace(/[/\\?%*:|"<>.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const fileNameWithMp3 = `${cleanTitle} - ${cleanArtist}.mp3`;

      // Read audio file as Base64 from app sandbox
      const base64Data = await FileSystem.readAsStringAsync(track.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create new file directly in the public folder picked by user with .mp3
      const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileNameWithMp3,
        'audio/mpeg',
      );

      // Write content into public directory
      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        newFileUri,
        base64Data,
        {
          encoding: FileSystem.EncodingType.Base64,
        },
      );

      return true;
    } else {
      // iOS / other: use Sharing to save to Files
      return await shareTrackAudio(track);
    }
  } catch (err) {
    console.error('[DownloadService] Export error:', err);
    throw err;
  }
}

/**
 * Delete a downloaded track and remove its file
 */
export async function deleteDownloadedTrack(trackId: string): Promise<boolean> {
  try {
    const tracks = await getDownloadedTracks();
    const trackToDelete = tracks.find((t) => t.id === trackId);

    if (trackToDelete && trackToDelete.uri) {
      const fileInfo = await FileSystem.getInfoAsync(trackToDelete.uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(trackToDelete.uri, { idempotent: true });
      }
    }

    const updatedTracks = tracks.filter((t) => t.id !== trackId);
    await saveTracksIndex(updatedTracks);
    return true;
  } catch (err) {
    console.error('[DownloadService] Error deleting track:', err);
    return false;
  }
}

/**
 * Delete all downloaded tracks and clean directory
 */
export async function clearAllDownloadedTracks(): Promise<void> {
  try {
    await ensureDirectoryExists();
    await FileSystem.deleteAsync(MUSIC_DIR, { idempotent: true });
    await ensureDirectoryExists();
  } catch (err) {
    console.error('[DownloadService] Error clearing downloaded tracks:', err);
  }
}
