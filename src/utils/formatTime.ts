/**
 * Format seconds into mm:ss display string.
 */
export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
