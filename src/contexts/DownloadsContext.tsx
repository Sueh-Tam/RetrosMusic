/**
 * DownloadsContext — Reactive state for downloaded music tracks.
 *
 * Keeps the downloaded tracks list synchronized across all screens,
 * allows deleting, downloading with real progress, exporting to phone
 * storage, and statistics.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Track } from '@/types/music';
import {
  deleteDownloadedTrack,
  downloadMusicTrack,
  exportTrackToPhoneFolder,
  formatBytes,
  getDownloadedTracks,
  shareTrackAudio,
} from '@/services/downloadService';

interface DownloadsContextValue {
  downloadedTracks: Track[];
  isLoading: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  downloadBytes: { written: number; total: number };
  totalSizeFormatted: string;
  refreshDownloads: () => Promise<void>;
  downloadSong: (
    url: string,
    customTitle?: string,
    customArtist?: string,
  ) => Promise<Track>;
  deleteSong: (trackId: string) => Promise<boolean>;
  exportSong: (track: Track) => Promise<boolean>;
  shareSong: (track: Track) => Promise<boolean>;
}

const DownloadsContext = createContext<DownloadsContextValue | null>(null);

export function DownloadsProvider({ children }: { children: React.ReactNode }) {
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadBytes, setDownloadBytes] = useState({ written: 0, total: 0 });

  const refreshDownloads = useCallback(async () => {
    try {
      setIsLoading(true);
      const tracks = await getDownloadedTracks();
      setDownloadedTracks(tracks);
    } catch (err) {
      console.error('[DownloadsContext] Error loading downloaded tracks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load downloads on initial mount
  useEffect(() => {
    refreshDownloads();
  }, [refreshDownloads]);

  const downloadSong = useCallback(
    async (url: string, customTitle?: string, customArtist?: string) => {
      setIsDownloading(true);
      setDownloadProgress(0);
      setDownloadBytes({ written: 0, total: 0 });

      try {
        const newTrack = await downloadMusicTrack({
          url,
          customTitle,
          customArtist,
          onProgress: (pct, written, total) => {
            setDownloadProgress(pct);
            setDownloadBytes({ written, total });
          },
        });

        // Update list immediately
        setDownloadedTracks((prev) => [
          newTrack,
          ...prev.filter((t) => t.id !== newTrack.id),
        ]);
        return newTrack;
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  const deleteSong = useCallback(async (trackId: string) => {
    const success = await deleteDownloadedTrack(trackId);
    if (success) {
      setDownloadedTracks((prev) => prev.filter((t) => t.id !== trackId));
    }
    return success;
  }, []);

  const exportSong = useCallback(async (track: Track) => {
    return await exportTrackToPhoneFolder(track);
  }, []);

  const shareSong = useCallback(async (track: Track) => {
    return await shareTrackAudio(track);
  }, []);

  // Total size of all downloaded songs
  const totalSizeFormatted = useMemo(() => {
    const totalBytes = downloadedTracks.reduce(
      (acc, t) => acc + (t.fileSize || 0),
      0,
    );
    return formatBytes(totalBytes);
  }, [downloadedTracks]);

  const value = useMemo<DownloadsContextValue>(
    () => ({
      downloadedTracks,
      isLoading,
      isDownloading,
      downloadProgress,
      downloadBytes,
      totalSizeFormatted,
      refreshDownloads,
      downloadSong,
      deleteSong,
      exportSong,
      shareSong,
    }),
    [
      downloadedTracks,
      isLoading,
      isDownloading,
      downloadProgress,
      downloadBytes,
      totalSizeFormatted,
      refreshDownloads,
      downloadSong,
      deleteSong,
      exportSong,
      shareSong,
    ],
  );

  return (
    <DownloadsContext.Provider value={value}>
      {children}
    </DownloadsContext.Provider>
  );
}

export function useDownloads(): DownloadsContextValue {
  const ctx = useContext(DownloadsContext);
  if (!ctx) {
    throw new Error('useDownloads must be used within a <DownloadsProvider>');
  }
  return ctx;
}
