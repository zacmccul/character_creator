/**
 * Configuration Sync Utilities
 * Helpers for syncing character state with configuration changes
 */

import type { CharacterSheet, Attributes, CombatStats } from '@/types/character.types';
import type { AttributesConfig } from '@/types/attribute-config.types';
import type { CombatStatsConfig } from '@/types/combat-stats-config.types';
import { AttributeType } from '@/types/character.types';

/**
 * Sync combat stats with configuration
 * - Removes stats not in config
 * - Adds missing stats with default values from config
 * - Preserves existing stat values that are still in config
 */
export const syncCombatStatsWithConfig = (
  currentStats: CombatStats,
  config: CombatStatsConfig
): CombatStats => {
  const syncedStats: Record<string, number> = {};

  // Iterate through config stats and populate synced object
  for (const statConfig of config.stats) {
    // Use existing value if present, otherwise use default from schema
    syncedStats[statConfig.id] = currentStats[statConfig.id] ?? (statConfig.schema.default ?? 0);
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
    const attrKey = attrConfig.id as AttributeType;
    // Use existing value if present, otherwise use default from schema
    syncedAttributes[attrKey] = currentAttributes[attrKey] ?? (attrConfig.schema.default ?? 0);
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
 * Check if combat stats need syncing with config
 * Returns true if there are stats in character that aren't in config,
 * or if there are stats in config missing from character
 */
export const needsCombatStatsSync = (
  currentStats: CombatStats,
  config: CombatStatsConfig
): boolean => {
  const configStatIds = new Set(config.stats.map(s => s.id));
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
