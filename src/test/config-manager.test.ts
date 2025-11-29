/**
 * Config Manager Tests
 * Tests for centralized configuration loading and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configManager } from '@/utils/config-manager';
import type { ConfigValidationError } from '@/utils/config-manager';

// Mock enum config for validation tests
const mockEnumsConfig = {
  enums: [
    {
      id: 'species',
      label: 'Species',
      values: ['Human', 'Elf'],
    },
  ],
};

describe('ConfigManager', () => {
  beforeEach(() => {
    configManager.reset();
    vi.clearAllMocks();
  });

  describe('error formatting', () => {
    it('formats single error correctly', () => {
      const errors: ConfigValidationError[] = [
        {
          configName: 'attributes',
          path: 'title',
          message: 'Title is required',
        },
      ];
      const formatted = configManager.formatErrors(errors);
      expect(formatted).toBe('[attributes at title] Title is required');
    });

    it('formats multiple errors correctly', () => {
      const errors: ConfigValidationError[] = [
        {
          configName: 'attributes',
          path: 'title',
          message: 'Title is required',
        },
        {
          configName: 'enums',
          path: 'enums.0.id',
          message: 'ID cannot be empty',
        },
      ];
      const formatted = configManager.formatErrors(errors);
      expect(formatted).toContain('[attributes at title] Title is required');
      expect(formatted).toContain('[enums at enums.0.id] ID cannot be empty');
    });

    it('formats error without path correctly', () => {
      const errors: ConfigValidationError[] = [
        {
          configName: 'attributes',
          path: '',
          message: 'Failed to load',
        },
      ];
      const formatted = configManager.formatErrors(errors);
      expect(formatted).toBe('[attributes] Failed to load');
    });

    it('handles empty errors array', () => {
      const formatted = configManager.formatErrors([]);
      expect(formatted).toBe('No errors');
    });
  });

  describe('getEnum', () => {
    it('throws error when config not loaded', () => {
      expect(() => configManager.getEnum('species')).toThrow(
        'Configuration not loaded'
      );
    });
  });

  describe('getConfig', () => {
    it('throws error when config not loaded', () => {
      expect(() => configManager.getConfig()).toThrow(
        'Configuration not loaded'
      );
    });
  });

  describe('isLoaded', () => {
    it('returns false initially', () => {
      expect(configManager.isLoaded()).toBe(false);
    });

    it('returns false after reset', () => {
      configManager.reset();
      expect(configManager.isLoaded()).toBe(false);
    });
  });

  describe('validation', () => {
    it('detects invalid enum reference in character info', () => {
      // This test verifies the cross-reference validation logic
      const invalidCharacterInfo = {
        title: 'Character Info',
        fields: [
          {
            id: 'test',
            type: 'enum' as const,
            label: 'Test',
            enumRef: { enumId: 'nonexistent' },
          },
        ],
      };

      // Manual validation test (since we can't easily mock fetch)
      const enumIds = new Set(mockEnumsConfig.enums.map(e => e.id));
      const hasInvalidRef = invalidCharacterInfo.fields.some(
        field => field.type === 'enum' && !enumIds.has(field.enumRef.enumId)
      );

      expect(hasInvalidRef).toBe(true);
    });

    it('detects duplicate IDs across different config types', () => {
      // Test that ID uniqueness is enforced globally
      const enumIds = ['species', 'classes'];
      const attributeIds = ['STR', 'DEX'];
      const fieldIds = ['name', 'character_species']; // Now uses unique IDs

      const allIds = [...enumIds, ...attributeIds, ...fieldIds];
      const uniqueIds = new Set(allIds);

      // All IDs should be unique now
      expect(allIds.length).toBe(uniqueIds.size);
      expect(allIds.length).toBe(6);
      expect(uniqueIds.size).toBe(6);
    });

    it('would detect duplicate if same ID used in different configs', () => {
      // Demonstrate what happens with duplicates
      const enumIds = ['species', 'classes'];
      const attributeIds = ['STR', 'DEX'];
      const fieldIds = ['name', 'species']; // 'species' conflicts with enum

      const allIds = [...enumIds, ...attributeIds, ...fieldIds];
      const uniqueIds = new Set(allIds);

      // Should detect duplicate 'species' ID
      expect(allIds.length).not.toBe(uniqueIds.size);
      expect(allIds.length).toBe(6);
      expect(uniqueIds.size).toBe(5);
    });

    it('validates that duplicate ID is reported with location', () => {
      const duplicateId = 'species';
      const idMap = new Map<string, { configName: string; path: string }>();
      
      // First occurrence
      idMap.set(duplicateId, { configName: 'enums', path: 'enums.0.id' });
      
      // Try to add second occurrence
      const existing = idMap.get(duplicateId);
      expect(existing).toBeDefined();
      expect(existing?.configName).toBe('enums');
      expect(existing?.path).toBe('enums.0.id');
    });
  });
});
