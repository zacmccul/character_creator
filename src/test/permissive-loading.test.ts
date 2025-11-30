/**
 * Permissive Loading Tests
 * Tests for loading characters with validation errors during migration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deserializeCharacter } from '@/utils/persistence';
import { createEmptyCharacter } from '@/types/character.types';

describe('Permissive Character Loading', () => {
  beforeEach(() => {
    // Clear console mocks
    vi.clearAllMocks();
  });

  describe('deserializeCharacter', () => {
    it('should load valid character data', () => {
      const character = createEmptyCharacter();
      const json = JSON.stringify(character);
      
      const result = deserializeCharacter(json);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({
          version: expect.any(String),
          level: expect.any(Array),
          attributes: expect.any(Object),
        });
      }
    });

    it('should load character with unknown fields (passthrough)', () => {
      const character = {
        ...createEmptyCharacter(),
        unknownField: 'some value',
        anotherUnknownField: 123,
      };
      const json = JSON.stringify(character);
      
      const result = deserializeCharacter(json);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('unknownField', 'some value');
        expect(result.data).toHaveProperty('anotherUnknownField', 123);
      }
    });

    it('should attempt to load character with missing optional fields', () => {
      const minimalCharacter = {
        version: '1.0.0',
        characterInfo: {},
        level: [],
        attributes: {},
        combatStats: {},
        inventorySlots: {},
        resourceCounters: [],
      };
      const json = JSON.stringify(minimalCharacter);
      
      const result = deserializeCharacter(json);
      
      expect(result.success).toBe(true);
    });

    it('should fail on completely invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      
      const result = deserializeCharacter(invalidJson);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Parse error');
      }
    });

    it('should fail on missing critical required fields', () => {
      const incompleteCharacter = {
        version: '1.0.0',
        // Missing required fields
      };
      const json = JSON.stringify(incompleteCharacter);
      
      const result = deserializeCharacter(json);
      
      expect(result.success).toBe(false);
    });

    it('should handle character with deprecated fields', () => {
      const characterWithDeprecated = {
        ...createEmptyCharacter(),
        species: 'Human', // deprecated field
        experience: 'Soldier', // deprecated field
        movementRange: 30, // deprecated field
      };
      const json = JSON.stringify(characterWithDeprecated);
      
      const result = deserializeCharacter(json);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('species');
        expect(result.data).toHaveProperty('experience');
        expect(result.data).toHaveProperty('movementRange');
      }
    });
  });
});
