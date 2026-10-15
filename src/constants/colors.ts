/**
 * RetrosMusic — Retro K7 Color Palette
 *
 * All colors used across the app follow this centralized palette.
 * Two cassette variants exist: standard (beige/cream) and playlist (transparent blue).
 */

export const RetroColors = {
  // ── Background & Surfaces ──────────────────────────────
  background: '#0D0B08',
  surface: '#1A1714',
  surfaceLight: '#2A2520',
  surfaceElevated: '#322D28',

  // ── Standard Cassette Body (Type I — Ferro) ────────────
  cassetteBody: '#C4B48A',
  cassetteBodyLight: '#D4C8A0',
  cassetteBodyDark: '#A89870',
  cassetteBorder: '#8A7A5A',
  cassetteInnerBorder: '#B8A880',
  cassetteWindow: '#0A0806',
  cassetteWindowBorder: '#3A3530',

  // ── Tape & Reels ──────────────────────────────────────
  tape: '#1C1208',
  tapeLight: '#2A1F14',
  tapeSheen: '#3A2F20',
  reelHub: '#6B6B6B',
  reelHubDark: '#4A4A4A',
  reelHubLight: '#888888',
  reelSpoke: '#555555',
  reelCenter: '#222222',

  // ── Label (Paper) ─────────────────────────────────────
  label: '#F5F0E1',
  labelAlt: '#EBE4D2',
  labelLines: '#D0C8B8',
  labelText: '#2A2520',
  labelTextFaded: '#6A6050',

  // ── Playlist Variant (Type II — Cromo) ─────────────────
  playlistBody: '#3A5A7A',
  playlistBodyLight: '#4A6A8A',
  playlistBodyDark: '#2A4A6A',
  playlistBorder: '#1A3A5A',
  playlistLabel: '#E0E8F0',
  playlistLabelText: '#1A2A3A',
  playlistLabelLines: '#C0C8D8',

  // ── Accents (Amber) ───────────────────────────────────
  amber: '#E5A835',
  amberGlow: '#FFD26B',
  amberDark: '#B88520',
  amberMuted: '#9A7A30',

  // ── Metallic Buttons ──────────────────────────────────
  metallic: '#8C8C8C',
  metallicLight: '#B0B0B0',
  metallicDark: '#5A5A5A',
  metallicBorder: '#404040',
  buttonFace: '#7A7A7A',
  buttonHighlight: '#ABABAB',
  buttonShadow: '#4A4A4A',
  buttonPressed: '#606060',

  // ── Status Indicators ─────────────────────────────────
  recRed: '#FF3333',
  recRedGlow: '#FF6666',
  activeGreen: '#44CC44',

  // ── Text ──────────────────────────────────────────────
  textPrimary: '#E8DCC8',
  textSecondary: '#9A8E7A',
  textMuted: '#6A5E4A',
  textOnCassette: '#3A3020',

  // ── Misc ──────────────────────────────────────────────
  divider: '#2A2520',
  screw: '#5A5A5A',
  screwHighlight: '#7A7A7A',
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export type RetroColor = keyof typeof RetroColors;
