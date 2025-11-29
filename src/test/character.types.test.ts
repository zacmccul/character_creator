/**
 * Character Types Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  Species,
  CharacterClass,
  createEmptyCharacter,
  calculateTotalLevel,
  calculateEquipmentSlots,
  calculateConsumableSlots,
  calculateExperienceBankSlots,
} from '@/types/character.types';

describe('Character Types', () => {
  describe('createEmptyCharacter', () => {
    it('should create a valid empty character', () => {
      const character = createEmptyCharacter();
      
      expect(character.version).toBe('1.0.0');
      expect(character.name).toBe('');
      expect(character.level).toEqual([]);
      expect(character.species).toBe(Species.HUMAN);
      expect(character.combatStats.hp).toBe(10);
      expect(character.combatStats.mp).toBe(0);
      expect(character.resourceCounters).toEqual([]);
    });

    it('should have all attributes initialized to 0', () => {
      const character = createEmptyCharacter();
      
      expect(character.attributes.STR).toBe(0);
      expect(character.attributes.DEX).toBe(0);
      expect(character.attributes.INT).toBe(0);
      expect(character.attributes.WIS).toBe(0);
      expect(character.attributes.CHA).toBe(0);
    });

    it('should have combat stats record initialized', () => {
      const character = createEmptyCharacter();
      
      expect(character.combatStats).toBeDefined();
      expect(typeof character.combatStats).toBe('object');
      // Should have default combat stats
      expect(character.combatStats.hp).toBe(10);
      expect(character.combatStats.mp).toBe(0);
      expect(character.combatStats.movementRange).toBe(30);
    });
  });

  describe('calculateTotalLevel', () => {
    it('should return 0 for empty level array', () => {
      expect(calculateTotalLevel([])).toBe(0);
    });

    it('should calculate total for single class', () => {
      const levels = [{ class: CharacterClass.FIGHTER, level: 5 }];
      expect(calculateTotalLevel(levels)).toBe(5);
    });

    it('should calculate total for multiclass', () => {
      const levels = [
        { class: CharacterClass.FIGHTER, level: 3 },
        { class: CharacterClass.WIZARD, level: 2 },
      ];
      expect(calculateTotalLevel(levels)).toBe(5);
    });
  });

  describe('calculateEquipmentSlots', () => {
    it('should return 0 for STR of 0', () => {
      expect(calculateEquipmentSlots(0)).toBe(0);
    });

    it('should return correct number for positive STR', () => {
      expect(calculateEquipmentSlots(3)).toBe(3);
    });

    it('should handle max STR value', () => {
      expect(calculateEquipmentSlots(4)).toBe(4);
    });
  });

  describe('calculateConsumableSlots', () => {
    it('should return 0 for DEX of 0', () => {
      expect(calculateConsumableSlots(0)).toBe(0);
    });

    it('should return correct number for positive DEX', () => {
      expect(calculateConsumableSlots(2)).toBe(2);
    });
  });

  describe('calculateExperienceBankSlots', () => {
    it('should return 0 for INT of 0', () => {
      expect(calculateExperienceBankSlots(0)).toBe(0);
    });

    it('should return correct number for positive INT', () => {
      expect(calculateExperienceBankSlots(4)).toBe(4);
    });
  });
});
