/**
 * Version History Type Definitions
 * Types for managing character sheet version history
 */

import type { CharacterSheet } from './character.types';
import { z } from 'zod';
import { CharacterSheetSchema } from '@/schemas/character.schema';

// ============================================================================
// Interfaces
// ============================================================================

/**
 * A single version history entry containing a snapshot of character data
 */
export interface VersionHistoryEntry {
  readonly timestamp: string; // ISO 8601 date string
  readonly version: string; // Schema version at time of save
  readonly characterData: CharacterSheet;
  readonly label?: string; // Optional user-provided description
}

/**
 * Complete version history storage
 */
export interface VersionHistory {
  readonly entries: readonly VersionHistoryEntry[];
  readonly maxEntries: number; // Maximum number of versions to keep
}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Version history entry schema
 */
export const VersionHistoryEntrySchema = z.object({
  timestamp: z.string().datetime(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  characterData: CharacterSheetSchema,
  label: z.string().optional(),
});

/**
 * Version history schema
 */
export const VersionHistorySchema = z.object({
  entries: z.array(VersionHistoryEntrySchema),
  maxEntries: z.number().int().positive().default(50),
});

// ============================================================================
// Type Inference
// ============================================================================

export type VersionHistoryEntryValidated = z.infer<typeof VersionHistoryEntrySchema>;
export type VersionHistoryValidated = z.infer<typeof VersionHistorySchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a new version history entry
 */
export const createVersionEntry = (
  characterData: CharacterSheet,
  label?: string
): VersionHistoryEntry => ({
  timestamp: new Date().toISOString(),
  version: characterData.version,
  characterData,
  label,
});

/**
 * Create an empty version history
 */
export const createEmptyVersionHistory = (maxEntries = 50): VersionHistory => ({
  entries: [],
  maxEntries,
});

/**
 * Add a version to history, maintaining max entries limit
 */
export const addVersionToHistory = (
  history: VersionHistory,
  entry: VersionHistoryEntry
): VersionHistory => {
  const newEntries = [entry, ...history.entries];
  
  // Trim to max entries (keep most recent)
  const trimmedEntries = newEntries.slice(0, history.maxEntries);
  
  return {
    ...history,
    entries: trimmedEntries,
  };
};

/**
 * Get a version from history by timestamp
 */
export const getVersionByTimestamp = (
  history: VersionHistory,
  timestamp: string
): VersionHistoryEntry | undefined => {
  return history.entries.find(entry => entry.timestamp === timestamp);
};

/**
 * Delete a version from history by timestamp
 */
export const deleteVersionByTimestamp = (
  history: VersionHistory,
  timestamp: string
): VersionHistory => {
  return {
    ...history,
    entries: history.entries.filter(entry => entry.timestamp !== timestamp),
  };
};

/**
 * Get sorted version list (newest first)
 */
export const getSortedVersions = (history: VersionHistory): readonly VersionHistoryEntry[] => {
  return [...history.entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get a short relative time description
 */
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return formatTimestamp(timestamp);
};

/**
 * Validate version history data
 */
export const validateVersionHistory = (data: unknown) => {
  return VersionHistorySchema.safeParse(data);
};

/**
 * Parse version history data, throwing on error
 */
export const parseVersionHistory = (data: unknown): VersionHistoryValidated => {
  return VersionHistorySchema.parse(data);
};
