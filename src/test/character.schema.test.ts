/**
 * Character Schema Validation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateCharacterSheet,
  validateAttribute,
  validateMovementRange,
  validateHP,
  validateMP,
  validateRange,
  getValidationErrors,
} from '@/schemas/character.schema';
import { createEmptyCharacter, Species, CharacterClass } from '@/types/character.types';

describe('Character Schema Validation', () => {
  describe('validateCharacterSheet', () => {
    it('should validate character with minimum valid data', () => {
      const character = { ...createEmptyCharacter(), name: 'Test' };
      const result = validateCharacterSheet(character);
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format', () => {
      const character = { ...createEmptyCharacter(), version: 'invalid' };
      const result = validateCharacterSheet(character);
      
      expect(result.success).toBe(false);
    });

    it('should validate character with valid data', () => {
      const character = {
        ...createEmptyCharacter(),
        name: 'Test Hero',
        level: [{ class: CharacterClass.FIGHTER, level: 5 }],
        species: Species.ELF,
      };
      const result = validateCharacterSheet(character);
      
      expect(result.success).toBe(true);
    });

    it('should reject mismatched equipment slots', () => {
      const character = {
        ...createEmptyCharacter(),
        name: 'Test',
        attributes: {
          STR: 3,
          DEX: 0,
          INT: 0,
          WIS: 0,
          CHA: 0,
        },
        equipmentSlots: [], // Should be 3 slots
      };
      const result = validateCharacterSheet(character);
      
      expect(result.success).toBe(false);
    });
  });

  describe('validateAttribute', () => {
    it('should accept valid attribute values', () => {
      expect(validateAttribute(0)).toBe(true);
      expect(validateAttribute(2)).toBe(true);
      expect(validateAttribute(4)).toBe(true);
    });

    it('should reject invalid attribute values', () => {
      expect(validateAttribute(-1)).toBe(false);
      expect(validateAttribute(5)).toBe(false);
      expect(validateAttribute(1.5)).toBe(false);
      expect(validateAttribute('2')).toBe(false);
    });
  });

  describe('validateMovementRange', () => {
    it('should accept positive numbers', () => {
      expect(validateMovementRange(30)).toBe(true);
      expect(validateMovementRange(0.5)).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(validateMovementRange(0)).toBe(false);
      expect(validateMovementRange(-5)).toBe(false);
    });
  });

  describe('validateHP', () => {
    it('should accept integers', () => {
      expect(validateHP(10)).toBe(true);
      expect(validateHP(-5)).toBe(true);
      expect(validateHP(0)).toBe(true);
    });

    it('should reject non-integers', () => {
      expect(validateHP(10.5)).toBe(false);
      expect(validateHP('10')).toBe(false);
    });
  });

  describe('validateMP', () => {
    it('should accept non-negative integers', () => {
      expect(validateMP(0)).toBe(true);
      expect(validateMP(10)).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(validateMP(-1)).toBe(false);
    });
  });

  describe('validateRange', () => {
    it('should accept positive integers', () => {
      expect(validateRange(5)).toBe(true);
      expect(validateRange(100)).toBe(true);
    });

    it('should reject non-positive values', () => {
      expect(validateRange(0)).toBe(false);
      expect(validateRange(-1)).toBe(false);
      expect(validateRange(5.5)).toBe(false);
    });
  });

  describe('getValidationErrors', () => {
    it('should extract error messages', () => {
      const character = {
        ...createEmptyCharacter(),
        name: '',
        version: 'bad',
      };
      const result = validateCharacterSheet(character);
      
      if (!result.success) {
        const errors = getValidationErrors(result.error);
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }
    });
  });
});
