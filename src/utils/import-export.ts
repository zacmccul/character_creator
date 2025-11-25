/**
 * Import/Export Utilities
 * Handles JSON import and export of character data
 */

import type { CharacterSheet } from '@/types/character.types';
import { serializeCharacter, deserializeCharacter } from './persistence';

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export character data as JSON file
 */
export const exportCharacterJSON = (
  character: CharacterSheet,
  filename?: string
): void => {
  const json = serializeCharacter(character);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Generate filename if not provided
  const finalFilename =
    filename ||
    `${character.name || 'character'}-${new Date().toISOString().slice(0, 10)}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Export character data as JSON string (for copying)
 */
export const exportCharacterString = (character: CharacterSheet): string => {
  return serializeCharacter(character);
};

// ============================================================================
// Import Functions
// ============================================================================

export interface ImportResult {
  success: boolean;
  data?: CharacterSheet;
  error?: string;
}

/**
 * Import character from JSON string
 */
export const importCharacterFromString = (json: string): ImportResult => {
  const result = deserializeCharacter(json);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
};

/**
 * Import character from File object
 */
export const importCharacterFromFile = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const result = importCharacterFromString(json);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file',
      });
    };
    
    reader.readAsText(file);
  });
};

/**
 * Open file picker and import character
 */
export const openFilePickerAndImport = (): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const result = await importCharacterFromFile(file);
        resolve(result);
      } else {
        resolve({
          success: false,
          error: 'No file selected',
        });
      }
      
      document.body.removeChild(input);
    };
    
    input.oncancel = () => {
      resolve({
        success: false,
        error: 'File selection cancelled',
      });
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
  });
};

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate if a string is valid JSON
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if file is a valid JSON file
 */
export const isJSONFile = (file: File): boolean => {
  return (
    file.type === 'application/json' ||
    file.name.toLowerCase().endsWith('.json')
  );
};

/**
 * Get file size in human-readable format
 */
export const getFileSizeString = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ============================================================================
// Clipboard Functions
// ============================================================================

/**
 * Copy character JSON to clipboard
 */
export const copyCharacterToClipboard = async (
  character: CharacterSheet
): Promise<boolean> => {
  try {
    const json = serializeCharacter(character);
    await navigator.clipboard.writeText(json);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Import character from clipboard
 */
export const importCharacterFromClipboard = async (): Promise<ImportResult> => {
  try {
    const text = await navigator.clipboard.readText();
    return importCharacterFromString(text);
  } catch (error) {
    return {
      success: false,
      error: `Failed to read clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};
