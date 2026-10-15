/**
 * RetrosMusic — Core Type Definitions
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
  uri?: string; // audio file path or URL
  artwork?: string; // artwork image URI
  source: 'local' | 'youtube' | 'download';
  fileSize?: number;
  formattedSize?: string;
  downloadedAt?: number;
  cassetteColor?: string;
  cassetteType?: 'Type I' | 'Type II' | 'Type IV';
  youtubeUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  artwork?: string;
  createdAt: number; // timestamp
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number; // seconds elapsed
  duration: number; // total duration in seconds
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isPlaylist: boolean;
  playlistName?: string;
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  artist: string;
  progress: number; // 0-1
  status: 'pending' | 'downloading' | 'completed' | 'error';
  filePath?: string;
  fileSize?: number;
  formattedSize?: string;
  artwork?: string;
  error?: string;
  downloadedAt?: number;
}

