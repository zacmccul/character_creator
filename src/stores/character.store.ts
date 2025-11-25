/**
 * Character State Store
 * Zustand store for managing character sheet data
 */

import { create } from 'zustand';
import type {
  CharacterSheet,
  LevelEntry,
  ResourceCounter,
  Attributes,
  Species,
  CharacterClass,
  Experience,
  AttributeType,
} from '@/types/character.types';
import {
  EquipmentItem,
  ConsumableItem,
  ExperienceBankItem,
  createEmptyCharacter,
  calculateTotalLevel,
  calculateEquipmentSlots,
  calculateConsumableSlots,
  calculateExperienceBankSlots,
} from '@/types/character.types';
import { validateCharacterSheet } from '@/schemas/character.schema';
import { nanoid } from 'nanoid';

// ============================================================================
// Store Interface
// ============================================================================

interface CharacterState {
  // Character data
  character: CharacterSheet;
  
  // Actions - Basic field updates
  updateName: (name: string) => void;
  updateSpecies: (species: Species) => void;
  updateExperience: (experience: Experience) => void;
  updateMovementRange: (value: number) => void;
  updateHP: (value: number) => void;
  updateMP: (value: number) => void;
  updateAbilityBonus: (value: number) => void;
  updateAttackPower: (value: number) => void;
  updateSpellPower: (value: number) => void;
  updateRange: (value: number) => void;
  
  // Actions - Attribute updates
  updateAttribute: (attribute: AttributeType, value: number) => void;
  
  // Actions - Level/Class management
  addLevel: (characterClass: CharacterClass) => void;
  updateLevel: (index: number, level: number) => void;
  updateLevelClass: (index: number, characterClass: CharacterClass) => void;
  removeLevel: (index: number) => void;
  
  // Actions - Equipment slots
  updateEquipmentSlot: (index: number, item: EquipmentItem) => void;
  
  // Actions - Consumable slots
  updateConsumableSlot: (index: number, item: ConsumableItem) => void;
  
  // Actions - Experience bank
  updateExperienceBankSlot: (index: number, item: ExperienceBankItem) => void;
  
  // Actions - Resource counters
  addResourceCounter: (name: string, type: 'number' | 'boolean') => void;
  updateResourceCounter: (id: string, value: number | boolean) => void;
  updateResourceCounterName: (id: string, name: string) => void;
  deleteResourceCounter: (id: string) => void;
  
  // Actions - Character management
  loadCharacter: (data: CharacterSheet) => void;
  resetCharacter: () => void;
  
  // Utility
  validateCurrentCharacter: () => boolean;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useCharacterStore = create<CharacterState>((set, get) => ({
  // Initial state
  character: createEmptyCharacter(),
  
  // Basic field updates
  updateName: (name) => {
    set((state) => ({
      character: { ...state.character, name },
    }));
  },
  
  updateSpecies: (species) => {
    set((state) => ({
      character: { ...state.character, species },
    }));
  },
  
  updateExperience: (experience) => {
    set((state) => ({
      character: { ...state.character, experience },
    }));
  },
  
  updateMovementRange: (value) => {
    set((state) => ({
      character: { ...state.character, movementRange: value },
    }));
  },
  
  updateHP: (value) => {
    set((state) => ({
      character: { ...state.character, hp: Math.floor(value) },
    }));
  },
  
  updateMP: (value) => {
    set((state) => ({
      character: { ...state.character, mp: Math.max(0, Math.floor(value)) },
    }));
  },
  
  updateAbilityBonus: (value) => {
    set((state) => ({
      character: { ...state.character, abilityBonus: Math.floor(value) },
    }));
  },
  
  updateAttackPower: (value) => {
    set((state) => ({
      character: { ...state.character, attackPower: Math.floor(value) },
    }));
  },
  
  updateSpellPower: (value) => {
    set((state) => ({
      character: { ...state.character, spellPower: Math.floor(value) },
    }));
  },
  
  updateRange: (value) => {
    set((state) => ({
      character: { ...state.character, range: Math.max(1, Math.floor(value)) },
    }));
  },
  
  // Attribute updates with derived state recalculation
  updateAttribute: (attribute, value) => {
    set((state) => {
      const clampedValue = Math.max(0, Math.min(4, Math.floor(value)));
      const newAttributes: Attributes = {
        ...state.character.attributes,
        [attribute]: clampedValue,
      };
      
      // Recalculate slot counts
      const equipmentSlotsCount = calculateEquipmentSlots(newAttributes.STR);
      const consumableSlotsCount = calculateConsumableSlots(newAttributes.DEX);
      const experienceBankCount = calculateExperienceBankSlots(newAttributes.INT);
      
      // Adjust arrays to match new counts
      const adjustArray = <T>(arr: readonly T[], newLength: number, defaultValue: T): T[] => {
        if (arr.length === newLength) return [...arr];
        if (arr.length < newLength) {
          return [...arr, ...Array(newLength - arr.length).fill(defaultValue)];
        }
        return arr.slice(0, newLength) as T[];
      };
      
      const equipmentSlots = adjustArray(
        state.character.equipmentSlots,
        equipmentSlotsCount,
        EquipmentItem.NONE
      );
      const consumableSlots = adjustArray(
        state.character.consumableSlots,
        consumableSlotsCount,
        ConsumableItem.NONE
      );
      const experienceBank = adjustArray(
        state.character.experienceBank,
        experienceBankCount,
        ExperienceBankItem.NONE
      );
      
      return {
        character: {
          ...state.character,
          attributes: newAttributes,
          equipmentSlots,
          consumableSlots,
          experienceBank,
        },
      };
    });
  },
  
  // Level/Class management
  addLevel: (characterClass) => {
    set((state) => {
      const newLevel: LevelEntry = { class: characterClass, level: 1 };
      const newLevels = [...state.character.level, newLevel];
      
      return {
        character: { ...state.character, level: newLevels },
      };
    });
  },
  
  updateLevel: (index, level) => {
    set((state) => {
      const newLevels = [...state.character.level];
      if (index >= 0 && index < newLevels.length) {
        newLevels[index] = { ...newLevels[index], level: Math.max(1, Math.floor(level)) };
      }
      
      return {
        character: { ...state.character, level: newLevels },
      };
    });
  },
  
  updateLevelClass: (index, characterClass) => {
    set((state) => {
      const newLevels = [...state.character.level];
      if (index >= 0 && index < newLevels.length) {
        newLevels[index] = { ...newLevels[index], class: characterClass };
      }
      
      return {
        character: { ...state.character, level: newLevels },
      };
    });
  },
  
  removeLevel: (index) => {
    set((state) => {
      const newLevels = state.character.level.filter((_, i) => i !== index);
      
      return {
        character: { ...state.character, level: newLevels },
      };
    });
  },
  
  // Equipment slots
  updateEquipmentSlot: (index, item) => {
    set((state) => {
      const newSlots = [...state.character.equipmentSlots];
      if (index >= 0 && index < newSlots.length) {
        newSlots[index] = item;
      }
      
      return {
        character: { ...state.character, equipmentSlots: newSlots },
      };
    });
  },
  
  // Consumable slots
  updateConsumableSlot: (index, item) => {
    set((state) => {
      const newSlots = [...state.character.consumableSlots];
      if (index >= 0 && index < newSlots.length) {
        newSlots[index] = item;
      }
      
      return {
        character: { ...state.character, consumableSlots: newSlots },
      };
    });
  },
  
  // Experience bank
  updateExperienceBankSlot: (index, item) => {
    set((state) => {
      const newSlots = [...state.character.experienceBank];
      if (index >= 0 && index < newSlots.length) {
        newSlots[index] = item;
      }
      
      return {
        character: { ...state.character, experienceBank: newSlots },
      };
    });
  },
  
  // Resource counters
  addResourceCounter: (name, type) => {
    set((state) => {
      const newCounter: ResourceCounter = {
        id: nanoid(),
        name,
        type,
        value: type === 'number' ? 0 : false,
      };
      
      return {
        character: {
          ...state.character,
          resourceCounters: [...state.character.resourceCounters, newCounter],
        },
      };
    });
  },
  
  updateResourceCounter: (id, value) => {
    set((state) => {
      const newCounters = state.character.resourceCounters.map((counter) =>
        counter.id === id ? { ...counter, value } : counter
      );
      
      return {
        character: { ...state.character, resourceCounters: newCounters },
      };
    });
  },
  
  updateResourceCounterName: (id, name) => {
    set((state) => {
      const newCounters = state.character.resourceCounters.map((counter) =>
        counter.id === id ? { ...counter, name } : counter
      );
      
      return {
        character: { ...state.character, resourceCounters: newCounters },
      };
    });
  },
  
  deleteResourceCounter: (id) => {
    set((state) => ({
      character: {
        ...state.character,
        resourceCounters: state.character.resourceCounters.filter(
          (counter) => counter.id !== id
        ),
      },
    }));
  },
  
  // Character management
  loadCharacter: (data) => {
    const validation = validateCharacterSheet(data);
    
    if (!validation.success) {
      console.error('Invalid character data:', validation.error);
      return;
    }
    
    set({
      character: data,
    });
  },
  
  resetCharacter: () => {
    const emptyCharacter = createEmptyCharacter();
    set({
      character: emptyCharacter,
    });
  },
  
  validateCurrentCharacter: () => {
    const state = get();
    const validation = validateCharacterSheet(state.character);
    return validation.success;
  },
}));

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get character data only (for read-only access)
 */
export const useCharacter = () => useCharacterStore((state) => state.character);

/**
 * Hook to get derived state (computed on-demand)
 */
export const useDerivedStats = () => {
  const character = useCharacterStore((state) => state.character);
  
  return {
    totalLevel: calculateTotalLevel(character.level),
    equipmentSlotsCount: calculateEquipmentSlots(character.attributes.STR),
    consumableSlotsCount: calculateConsumableSlots(character.attributes.DEX),
    experienceBankCount: calculateExperienceBankSlots(character.attributes.INT),
  };
};
