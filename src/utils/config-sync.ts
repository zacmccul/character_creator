/**
 * Configuration Sync Utilities
 * Helpers for syncing character state with configuration changes
 */

import type { CharacterSheet, Attributes, CombatStats, CharacterInfo, InventorySlots } from '@/types/character.types';
import type { AttributesConfig } from '@/types/attribute-config.types';
import type { CombatStatsConfig, CombatStatConfig, CombatStatOrPair } from '@/types/combat-stats-config.types';
import type { CharacterInfoConfig } from '@/types/character-info-config.types';
import type { InventoryConfig } from '@/types/inventory-config.types';
import { evaluateFormula } from './formula-evaluator';

// Type guard for paired stats
const isPairedStat = (stat: CombatStatOrPair): stat is readonly [CombatStatConfig, CombatStatConfig] => {
  return Array.isArray(stat);
};

/**
 * Sync combat stats with configuration
 * - Removes stats not in config
 * - Adds missing stats with default values from config
 * - Preserves existing stat values that are still in config
 * - Handles both single stats and paired stats (e.g., HP/Max HP)
 */
export const syncCombatStatsWithConfig = (
  currentStats: CombatStats,
  config: CombatStatsConfig
): CombatStats => {
  const syncedStats: Record<string, number> = {};

  // Iterate through config stats and populate synced object
  for (const statOrPair of config.stats) {
    if (isPairedStat(statOrPair)) {
      // Paired stat - handle both stats in the pair
      const [firstStat, secondStat] = statOrPair;
      syncedStats[firstStat.id] = currentStats[firstStat.id] ?? (firstStat.schema.default ?? 0);
      syncedStats[secondStat.id] = currentStats[secondStat.id] ?? (secondStat.schema.default ?? 0);
    } else {
      // Single stat - TypeScript now knows statOrPair is CombatStatConfig
      syncedStats[statOrPair.id] = currentStats[statOrPair.id] ?? (statOrPair.schema.default ?? 0);
    }
  }

  return syncedStats as CombatStats;
};

/**
 * Sync attributes with configuration
 * - Ensures all attributes from config exist in character
 * - Removes attributes not in config
 * - Preserves existing attribute values that are still in config
 */
export const syncAttributesWithConfig = (
  currentAttributes: Attributes,
  config: AttributesConfig
): Attributes => {
  const syncedAttributes: Record<string, number> = {};

  // Iterate through config attributes and populate synced object
  for (const attrConfig of config.attributes) {
    // Use existing value if present, otherwise use default from schema
    syncedAttributes[attrConfig.id] = currentAttributes[attrConfig.id] ?? (attrConfig.schema.default ?? 0);
  }

  return syncedAttributes as unknown as Attributes;
};

/**
 * Sync entire character sheet with all configurations
 * - Syncs attributes with attributes config
 * - Syncs combat stats with combat stats config
 */
export const syncCharacterWithConfigs = (
  character: CharacterSheet,
  attributesConfig: AttributesConfig,
  combatStatsConfig: CombatStatsConfig
): CharacterSheet => {
  return {
    ...character,
    attributes: syncAttributesWithConfig(character.attributes, attributesConfig),
    combatStats: syncCombatStatsWithConfig(character.combatStats, combatStatsConfig),
  };
};

/**
 * Sync character info with configuration
 * - Removes fields not in config
 * - Adds missing fields with default values (empty string or first enum value)
 * - Preserves existing field values that are still in config
 */
export const syncCharacterInfoWithConfig = (
  currentInfo: CharacterInfo,
  config: CharacterInfoConfig,
  getEnumDefaultValue: (enumId: string) => string = () => ''
): CharacterInfo => {
  const syncedInfo: Record<string, string> = {};

  // Iterate through config fields and populate synced object
  for (const fieldConfig of config.fields) {
    // Use existing value if present
    if (currentInfo[fieldConfig.id]) {
      syncedInfo[fieldConfig.id] = currentInfo[fieldConfig.id];
    } else {
      // For enum fields, get first value from enum; for text fields, use empty string
      if (fieldConfig.type === 'enum') {
        syncedInfo[fieldConfig.id] = getEnumDefaultValue(fieldConfig.enumRef.enumId);
      } else {
        syncedInfo[fieldConfig.id] = '';
      }
    }
  }

  return syncedInfo as CharacterInfo;
};

/**
 * Check if combat stats need syncing with config
 * Returns true if there are stats in character that aren't in config,
 * or if there are stats in config missing from character
 */
export const needsCombatStatsSync = (
  currentStats: CombatStats,
  config: CombatStatsConfig
): boolean => {
  // Collect all stat IDs from config (handling both single and paired stats)
  const configStatIds = new Set<string>();
  for (const statOrPair of config.stats) {
    if (isPairedStat(statOrPair)) {
      const [firstStat, secondStat] = statOrPair;
      configStatIds.add(firstStat.id);
      configStatIds.add(secondStat.id);
    } else {
      // TypeScript now knows statOrPair is CombatStatConfig
      configStatIds.add(statOrPair.id);
    }
  }
  
  const currentStatIds = new Set(Object.keys(currentStats));

  // Check if current has stats not in config
  for (const statId of currentStatIds) {
    if (!configStatIds.has(statId)) {
      return true;
    }
  }

  // Check if config has stats not in current
  for (const statId of configStatIds) {
    if (!currentStatIds.has(statId)) {
      return true;
    }
  }

  return false;
};

/**
 * Check if attributes need syncing with config
 */
export const needsAttributesSync = (
  currentAttributes: Attributes,
  config: AttributesConfig
): boolean => {
  const configAttrIds = new Set(config.attributes.map(a => a.id));
  const currentAttrIds = new Set(Object.keys(currentAttributes));

  // Check if sizes differ
  if (configAttrIds.size !== currentAttrIds.size) {
    return true;
  }

  // Check if all config attributes exist in current
  for (const attrId of configAttrIds) {
    if (!currentAttrIds.has(attrId)) {
      return true;
    }
  }

  return false;
};

/**
 * Check if character info needs syncing with config
 */
export const needsCharacterInfoSync = (
  currentInfo: CharacterInfo,
  config: CharacterInfoConfig
): boolean => {
  const configFieldIds = new Set(config.fields.map(f => f.id));
  const currentFieldIds = new Set(Object.keys(currentInfo));

  // Check if current has fields not in config
  for (const fieldId of currentFieldIds) {
    if (!configFieldIds.has(fieldId)) {
      return true;
    }
  }

  // Check if config has fields not in current
  for (const fieldId of configFieldIds) {
    if (!currentFieldIds.has(fieldId)) {
      return true;
    }
  }

  return false;
};

/**
 * Sync inventory slots with configuration
 * - Calculates slot counts using formulas from config
 * - Adjusts arrays to match new slot counts
 * - Preserves existing item values where possible
 * - Fills new slots with empty string (matching first enum value)
 */
export const syncInventorySlotsWithConfig = (
  currentSlots: InventorySlots,
  config: InventoryConfig,
  attributes: Attributes,
  getEnumDefaultValue: (enumId: string) => string = () => ''
): InventorySlots => {
  const syncedSlots: Record<string, readonly string[]> = {};

  for (const tabConfig of config.tabs) {
    // Calculate slot count using formula
    const slotCount = evaluateFormula(tabConfig.slotFormula, attributes);
    
    // Get current slots for this tab, or empty array if doesn't exist
    const currentTabSlots = currentSlots[tabConfig.id] || [];
    
    // Get default value for this tab's items
    const defaultValue = getEnumDefaultValue(tabConfig.itemEnumId);
    
    // Adjust array to match new slot count
    let newTabSlots: string[];
    
    if (currentTabSlots.length === slotCount) {
      // No change needed
      newTabSlots = [...currentTabSlots];
    } else if (currentTabSlots.length < slotCount) {
      // Need to add slots - fill with default value
      const slotsToAdd = slotCount - currentTabSlots.length;
      newTabSlots = [...currentTabSlots, ...Array(slotsToAdd).fill(defaultValue)];
    } else {
      // Need to remove slots - truncate array
      newTabSlots = currentTabSlots.slice(0, slotCount);
    }
    
    syncedSlots[tabConfig.id] = newTabSlots;
  }

  return syncedSlots as InventorySlots;
};

/**
 * Check if inventory slots need syncing with config
 * Returns true if tab structure has changed or if slot counts differ
 */
export const needsInventorySlotsSync = (
  currentSlots: InventorySlots,
  config: InventoryConfig,
  attributes: Attributes
): boolean => {
  const configTabIds = new Set(config.tabs.map(t => t.id));
  const currentTabIds = new Set(Object.keys(currentSlots));

  // Check if tab IDs match
  if (configTabIds.size !== currentTabIds.size) {
    return true;
  }

  for (const tabId of configTabIds) {
    if (!currentTabIds.has(tabId)) {
      return true;
    }
  }

  // Check if slot counts match for each tab
  for (const tabConfig of config.tabs) {
    const expectedCount = evaluateFormula(tabConfig.slotFormula, attributes);
    const currentCount = (currentSlots[tabConfig.id] || []).length;
    
    if (expectedCount !== currentCount) {
      return true;
    }
  }

  return false;
};

