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
import type { AttributesConfig } from '@/types/attribute-config.types';
import type { CombatStatsConfig } from '@/types/combat-stats-config.types';
import type { InventoryConfig } from '@/types/inventory-config.types';
import { syncAttributesWithConfig, syncCombatStatsWithConfig, syncInventorySlotsWithConfig } from '@/utils/config-sync';
import { getEnumById } from '@/utils/config-manager';

// ============================================================================
// Store Interface
// ============================================================================

interface CharacterState {
  // Character data
  character: CharacterSheet;
  
  // Internal config references for dynamic recalculation
  _inventoryConfig: InventoryConfig | null;
  
  // Actions - Character info (dynamic)
  updateCharacterInfo: (fieldId: string, value: string) => void;
  
  // DEPRECATED: Individual field updaters (kept for backward compatibility)
  updateName: (name: string) => void;
  updateSpecies: (species: Species) => void;
  updateExperience: (experience: Experience) => void;
  updateMovementRange: (value: number) => void;
  
  // Actions - Combat stats (dynamic)
  updateCombatStat: (statId: string, value: number) => void;
  
  // DEPRECATED: Individual stat updaters (kept for backward compatibility)
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
  
  // Actions - Inventory slots (dynamic)
  updateInventorySlot: (tabId: string, index: number, value: string) => void;
  
  // DEPRECATED: Equipment slots (use updateInventorySlot with tabId='equipment' instead)
  updateEquipmentSlot: (index: number, item: EquipmentItem) => void;
  
  // DEPRECATED: Consumable slots (use updateInventorySlot with tabId='consumables' instead)
  updateConsumableSlot: (index: number, item: ConsumableItem) => void;
  
  // DEPRECATED: Experience bank (use updateInventorySlot with tabId='experience' instead)
  updateExperienceBankSlot: (index: number, item: ExperienceBankItem) => void;
  
  // Actions - Resource counters
  addResourceCounter: (name: string, type: 'number' | 'boolean') => void;
  updateResourceCounter: (id: string, value: number | boolean) => void;
  updateResourceCounterName: (id: string, name: string) => void;
  deleteResourceCounter: (id: string) => void;
  
  // Actions - Character management
  loadCharacter: (data: CharacterSheet) => void;
  resetCharacter: () => void;
  syncWithConfigs: (attributesConfig: AttributesConfig, combatStatsConfig: CombatStatsConfig) => void;
  syncWithAllConfigs: (attributesConfig: AttributesConfig, combatStatsConfig: CombatStatsConfig, inventoryConfig: InventoryConfig) => void;
  
  // Utility
  validateCurrentCharacter: () => boolean;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useCharacterStore = create<CharacterState>((set, get) => ({
  // Initial state
  character: createEmptyCharacter(),
  _inventoryConfig: null,
  
  // Character info updater (dynamic)
  updateCharacterInfo: (fieldId, value) => {
    set((state) => ({
      character: {
        ...state.character,
        characterInfo: {
          ...state.character.characterInfo,
          [fieldId]: value,
        },
      },
    }));
  },
  
  // DEPRECATED: Individual field updaters (use updateCharacterInfo instead)
  updateName: (name) => {
    get().updateCharacterInfo('name', name);
    set((state) => ({
      character: { ...state.character, name },
    }));
  },
  
  updateSpecies: (species) => {
    get().updateCharacterInfo('character_species', species);
    set((state) => ({
      character: { ...state.character, species },
    }));
  },
  
  updateExperience: (experience) => {
    get().updateCharacterInfo('character_experience', experience);
    set((state) => ({
      character: { ...state.character, experience },
    }));
  },
  
  updateMovementRange: (value) => {
    set((state) => ({
      character: { 
        ...state.character, 
        movementRange: value,
        combatStats: {
          ...state.character.combatStats,
          movementRange: value,
        },
      },
    }));
  },
  
  // Combat stat updater (dynamic)
  updateCombatStat: (statId, value) => {
    set((state) => ({
      character: {
        ...state.character,
        combatStats: {
          ...state.character.combatStats,
          [statId]: value,
        },
      },
    }));
  },
  
  // DEPRECATED: Individual stat updaters (use updateCombatStat instead)
  updateHP: (value) => {
    get().updateCombatStat('hp', Math.floor(value));
  },
  
  updateMP: (value) => {
    get().updateCombatStat('mp', Math.max(0, Math.floor(value)));
  },
  
  updateAbilityBonus: (value) => {
    get().updateCombatStat('abilityBonus', Math.floor(value));
  },
  
  updateAttackPower: (value) => {
    get().updateCombatStat('attackPower', Math.floor(value));
  },
  
  updateSpellPower: (value) => {
    get().updateCombatStat('spellPower', Math.floor(value));
  },
  
  updateRange: (value) => {
    get().updateCombatStat('range', Math.max(1, Math.floor(value)));
  },
  
  // Attribute updates with derived state recalculation
  updateAttribute: (attribute, value) => {
    set((state) => {
      const clampedValue = Math.max(0, Math.min(4, Math.floor(value)));
      const newAttributes: Attributes = {
        ...state.character.attributes,
        [attribute]: clampedValue,
      };
      
      // Recalculate slot counts for backward compatibility (deprecated fields)
      const equipmentSlotsCount = calculateEquipmentSlots(newAttributes.STR);
      const consumableSlotsCount = calculateConsumableSlots(newAttributes.DEX);
      const experienceBankCount = calculateExperienceBankSlots(newAttributes.INT);
      
      // Adjust deprecated arrays to match new counts
      const adjustArray = <T>(arr: readonly T[] | undefined, newLength: number, defaultValue: T): T[] => {
        const safeArr = arr || [];
        if (safeArr.length === newLength) return [...safeArr];
        if (safeArr.length < newLength) {
          return [...safeArr, ...Array(newLength - safeArr.length).fill(defaultValue)];
        }
        return safeArr.slice(0, newLength) as T[];
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
      
      // Recalculate dynamic inventory slots if config is available
      let newInventorySlots = state.character.inventorySlots;
      if (state._inventoryConfig) {
        const getEnumDefaultValue = (enumId: string): string => {
          const enumDef = getEnumById(enumId);
          return enumDef?.values[0] || '';
        };
        
        newInventorySlots = syncInventorySlotsWithConfig(
          state.character.inventorySlots,
          state._inventoryConfig,
          newAttributes,
          getEnumDefaultValue
        );
      }
      
      return {
        character: {
          ...state.character,
          attributes: newAttributes,
          equipmentSlots,
          consumableSlots,
          experienceBank,
          inventorySlots: newInventorySlots,
        },
        _inventoryConfig: state._inventoryConfig,
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
  
  // Inventory slots (dynamic)
  updateInventorySlot: (tabId, index, value) => {
    set((state) => {
      const currentTabSlots = state.character.inventorySlots[tabId] || [];
      const newTabSlots = [...currentTabSlots];
      
      if (index >= 0 && index < newTabSlots.length) {
        newTabSlots[index] = value;
      }
      
      return {
        character: {
          ...state.character,
          inventorySlots: {
            ...state.character.inventorySlots,
            [tabId]: newTabSlots,
          },
        },
      };
    });
  },
  
  // DEPRECATED: Equipment slots (use updateInventorySlot instead)
  updateEquipmentSlot: (index, item) => {
    // Update both new and deprecated fields for backward compatibility
    get().updateInventorySlot('equipment', index, item);
    
    set((state) => {
      const newSlots = [...(state.character.equipmentSlots || [])];
      if (index >= 0 && index < newSlots.length) {
        newSlots[index] = item;
      }
      
      return {
        character: { ...state.character, equipmentSlots: newSlots },
      };
    });
  },
  
  // DEPRECATED: Consumable slots (use updateInventorySlot instead)
  updateConsumableSlot: (index, item) => {
    // Update both new and deprecated fields for backward compatibility
    get().updateInventorySlot('consumables', index, item);
    
    set((state) => {
      const newSlots = [...(state.character.consumableSlots || [])];
      if (index >= 0 && index < newSlots.length) {
        newSlots[index] = item;
      }
      
      return {
        character: { ...state.character, consumableSlots: newSlots },
      };
    });
  },
  
  // DEPRECATED: Experience bank (use updateInventorySlot instead)
  updateExperienceBankSlot: (index, item) => {
    // Update both new and deprecated fields for backward compatibility
    get().updateInventorySlot('experience_bank', index, item);
    
    set((state) => {
      const newSlots = [...(state.character.experienceBank || [])];
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
  
  syncWithConfigs: (attributesConfig, combatStatsConfig) => {
    set((state) => ({
      character: {
        ...state.character,
        attributes: syncAttributesWithConfig(state.character.attributes, attributesConfig),
        combatStats: syncCombatStatsWithConfig(state.character.combatStats, combatStatsConfig),
      },
    }));
  },
  
  syncWithAllConfigs: (attributesConfig, combatStatsConfig, inventoryConfig) => {
    set((state) => {
      // Helper to get first enum value
      const getEnumDefaultValue = (enumId: string): string => {
        const enumDef = getEnumById(enumId);
        return enumDef?.values[0] || '';
      };
      
      return {
        character: {
          ...state.character,
          attributes: syncAttributesWithConfig(state.character.attributes, attributesConfig),
          combatStats: syncCombatStatsWithConfig(state.character.combatStats, combatStatsConfig),
          inventorySlots: syncInventorySlotsWithConfig(
            state.character.inventorySlots,
            inventoryConfig,
            state.character.attributes,
            getEnumDefaultValue
          ),
        },
        _inventoryConfig: inventoryConfig,
      };
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
