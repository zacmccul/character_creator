/**
 * Version History Store
 * Zustand store for managing character sheet version history
 */

import { create } from 'zustand';
import type { CharacterSheet } from '@/types/character.types';
import type {
  VersionHistory,
  VersionHistoryEntry,
} from '@/types/version-history.types';
import {
  createEmptyVersionHistory,
  createVersionEntry,
  addVersionToHistory,
  getVersionByTimestamp,
  deleteVersionByTimestamp,
  getSortedVersions,
} from '@/types/version-history.types';

// ============================================================================
// Store Interface
// ============================================================================

interface VersionHistoryState {
  // Version history data
  history: VersionHistory;
  
  // Actions
  saveVersion: (characterData: CharacterSheet, label?: string) => string;
  loadVersion: (timestamp: string) => VersionHistoryEntry | null;
  deleteVersion: (timestamp: string) => void;
  getVersionList: () => readonly VersionHistoryEntry[];
  clearHistory: () => void;
  setMaxEntries: (maxEntries: number) => void;
  loadHistoryData: (historyData: VersionHistory) => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useVersionHistoryStore = create<VersionHistoryState>((set, get) => ({
  // Initial state
  history: createEmptyVersionHistory(),
  
  // Save a new version
  saveVersion: (characterData, label) => {
    const entry = createVersionEntry(characterData, label);
    
    set((state) => ({
      history: addVersionToHistory(state.history, entry),
    }));
    
    return entry.timestamp;
  },
  
  // Load a version by timestamp
  loadVersion: (timestamp) => {
    const state = get();
    return getVersionByTimestamp(state.history, timestamp) ?? null;
  },
  
  // Delete a version by timestamp
  deleteVersion: (timestamp) => {
    set((state) => ({
      history: deleteVersionByTimestamp(state.history, timestamp),
    }));
  },
  
  // Get sorted list of versions (newest first)
  getVersionList: () => {
    const state = get();
    return getSortedVersions(state.history);
  },
  
  // Clear all version history
  clearHistory: () => {
    set((state) => ({
      history: createEmptyVersionHistory(state.history.maxEntries),
    }));
  },
  
  // Update max entries setting
  setMaxEntries: (maxEntries) => {
    set((state) => {
      // Trim entries if new max is smaller
      const trimmedEntries = state.history.entries.slice(0, maxEntries);
      
      return {
        history: {
          ...state.history,
          maxEntries,
          entries: trimmedEntries,
        },
      };
    });
  },
  
  // Load complete history data (for initialization from saved file)
  loadHistoryData: (historyData) => {
    set({
      history: historyData,
    });
  },
}));

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get version history entries only
 */
export const useVersionEntries = () =>
  useVersionHistoryStore((state) => state.history.entries);

/**
 * Hook to get version count
 */
export const useVersionCount = () =>
  useVersionHistoryStore((state) => state.history.entries.length);

/**
 * Hook to check if history is at max capacity
 */
export const useIsHistoryFull = () =>
  useVersionHistoryStore(
    (state) => state.history.entries.length >= state.history.maxEntries
  );
