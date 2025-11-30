/**
 * Persistence Utilities
 * Handles serialization, deserialization, and HTML embedding of character data
 */

import type { CharacterSheet } from '@/types/character.types';
import type { VersionHistory } from '@/types/version-history.types';
import { validateCharacterSheet } from '@/schemas/character.schema';
import { validateVersionHistory } from '@/types/version-history.types';

// ============================================================================
// Constants
// ============================================================================

const CHARACTER_DATA_ID = 'character-data';
const VERSION_HISTORY_ID = 'version-history-data';

// ============================================================================
// Data Structure
// ============================================================================

export interface EmbeddedData {
  character: CharacterSheet | null;
  history: VersionHistory | null;
}

// ============================================================================
// Serialization
// ============================================================================

/**
 * Serialize character data to JSON string
 */
export const serializeCharacter = (character: CharacterSheet): string => {
  return JSON.stringify(character, null, 2);
};

/**
 * Serialize version history to JSON string
 */
export const serializeHistory = (history: VersionHistory): string => {
  return JSON.stringify(history, null, 2);
};

/**
 * Serialize both character and history to a single object
 */
export const serializeAll = (
  character: CharacterSheet,
  history: VersionHistory
): string => {
  return JSON.stringify({ character, history }, null, 2);
};

// ============================================================================
// Deserialization
// ============================================================================

/**
 * Deserialize and validate character data from JSON string
 * Uses permissive validation to allow loading characters during migration
 */
export const deserializeCharacter = (
  json: string
): { success: true; data: CharacterSheet } | { success: false; error: string } => {
  try {
    const parsed = JSON.parse(json);
    const validation = validateCharacterSheet(parsed);
    
    if (validation.success) {
      return { success: true, data: validation.data };
    } else {
      // Log validation errors but still try to use the data
      console.debug('Character validation issues (non-fatal):', validation.error.issues);
      
      // Try to extract the data anyway since we're using passthrough()
      // This allows old formats to load during migration
      if (parsed.version && parsed.level && parsed.attributes && parsed.combatStats && 
          parsed.characterInfo && parsed.inventorySlots && parsed.resourceCounters) {
        console.debug('Loading character with validation warnings - some fields may be outdated');
        return { success: true, data: parsed as CharacterSheet };
      }
      
      return {
        success: false,
        error: `Validation failed: ${validation.error.message}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Deserialize and validate version history from JSON string
 */
export const deserializeHistory = (
  json: string
): { success: true; data: VersionHistory } | { success: false; error: string } => {
  try {
    const parsed = JSON.parse(json);
    const validation = validateVersionHistory(parsed);
    
    if (validation.success) {
      return { success: true, data: validation.data };
    } else {
      return {
        success: false,
        error: `Validation failed: ${validation.error.message}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// ============================================================================
// HTML Embedding
// ============================================================================

/**
 * Load embedded data from the current HTML document
 */
export const loadEmbeddedData = (): EmbeddedData => {
  const result: EmbeddedData = {
    character: null,
    history: null,
  };
  
  // Try to load character data
  const characterScript = document.getElementById(CHARACTER_DATA_ID);
  if (characterScript?.textContent) {
    const deserializedChar = deserializeCharacter(characterScript.textContent);
    if (deserializedChar.success) {
      result.character = deserializedChar.data;
    } else {
      console.debug('Failed to load character data:', deserializedChar.error);
    }
  }
  
  // Try to load version history
  const historyScript = document.getElementById(VERSION_HISTORY_ID);
  if (historyScript?.textContent) {
    const deserializedHistory = deserializeHistory(historyScript.textContent);
    if (deserializedHistory.success) {
      result.history = deserializedHistory.data;
    } else {
      console.debug('Failed to load version history:', deserializedHistory.error);
    }
  }
  
  return result;
};

/**
 * Create script tag content for embedding data
 */
const createScriptTag = (id: string, data: string): string => {
  return `<script type="application/json" id="${id}">\n${data}\n</script>`;
};

/**
 * Generate HTML with embedded character data
 * This creates a modified version of the current HTML with data embedded
 */
export const generateEmbeddedHTML = async (
  character: CharacterSheet,
  history: VersionHistory
): Promise<string> => {
  // Get the current HTML document as a string
  const htmlDoc = document.documentElement.outerHTML;
  
  // Create script tags for data
  const characterScript = createScriptTag(
    CHARACTER_DATA_ID,
    serializeCharacter(character)
  );
  const historyScript = createScriptTag(
    VERSION_HISTORY_ID,
    serializeHistory(history)
  );
  
  // Remove existing data scripts if present
  let modifiedHTML = htmlDoc.replace(
    new RegExp(`<script[^>]*id="${CHARACTER_DATA_ID}"[^>]*>.*?</script>`, 's'),
    ''
  );
  modifiedHTML = modifiedHTML.replace(
    new RegExp(`<script[^>]*id="${VERSION_HISTORY_ID}"[^>]*>.*?</script>`, 's'),
    ''
  );
  
  // Insert new data scripts at the end of the body
  const bodyEndIndex = modifiedHTML.lastIndexOf('</body>');
  if (bodyEndIndex !== -1) {
    modifiedHTML =
      modifiedHTML.slice(0, bodyEndIndex) +
      '\n' +
      characterScript +
      '\n' +
      historyScript +
      '\n' +
      modifiedHTML.slice(bodyEndIndex);
  } else {
    // Fallback: append at the end
    modifiedHTML = modifiedHTML + '\n' + characterScript + '\n' + historyScript;
  }
  
  return modifiedHTML;
};

/**
 * Download the HTML file with embedded data
 */
export const downloadEmbeddedHTML = async (
  character: CharacterSheet,
  history: VersionHistory,
  filename = 'character-sheet.html'
): Promise<void> => {
  const html = await generateEmbeddedHTML(character, history);
  
  // Create blob and download
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// ============================================================================
// Auto-save Utilities
// ============================================================================

/**
 * Save data to localStorage as backup
 */
export const saveToLocalStorage = (
  character: CharacterSheet,
  history: VersionHistory
): void => {
  try {
    localStorage.setItem('character-backup', serializeCharacter(character));
    localStorage.setItem('history-backup', serializeHistory(history));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

/**
 * Load data from localStorage backup
 */
export const loadFromLocalStorage = (): EmbeddedData => {
  const result: EmbeddedData = {
    character: null,
    history: null,
  };
  
  try {
    const characterJson = localStorage.getItem('character-backup');
    if (characterJson) {
      const deserializedChar = deserializeCharacter(characterJson);
      if (deserializedChar.success) {
        result.character = deserializedChar.data;
      }
    }
    
    const historyJson = localStorage.getItem('history-backup');
    if (historyJson) {
      const deserializedHistory = deserializeHistory(historyJson);
      if (deserializedHistory.success) {
        result.history = deserializedHistory.data;
      }
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  
  return result;
};

/**
 * Clear localStorage backup
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem('character-backup');
    localStorage.removeItem('history-backup');
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize character data from embedded data or localStorage
 * Priority: Embedded data > localStorage > Empty character
 */
export const initializeData = (): EmbeddedData => {
  // First try embedded data (from saved HTML file)
  const embeddedData = loadEmbeddedData();
  
  if (embeddedData.character && embeddedData.history) {
    console.log('Loaded data from embedded HTML');
    return embeddedData;
  }
  
  // Fallback to localStorage
  const localStorageData = loadFromLocalStorage();
  
  if (localStorageData.character || localStorageData.history) {
    console.log('Loaded data from localStorage backup');
    return localStorageData;
  }
  
  console.log('No saved data found, starting with empty character');
  return {
    character: null,
    history: null,
  };
};
