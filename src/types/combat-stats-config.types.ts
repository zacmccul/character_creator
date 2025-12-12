/**
 * Combat Stats Configuration Types
 * Types for configuration-driven combat stats system
 */

import type { NumericSchema } from './attribute-config.types';

/**
 * Single combat stat definition
 */
export interface CombatStatConfig {
  readonly id: string; // Unique identifier (e.g., "hp", "mp", "movementRange")
  readonly label: string; // Display name (e.g., "HP", "MP")
  readonly description: string; // Tooltip description
  readonly emoji?: string; // Optional emoji icon
  readonly schema: NumericSchema; // OpenAPI-style numeric constraints
  readonly automated?: boolean; // Optional toggle determing if stat value is automatically calculated
}

/**
 * Paired combat stat definition (e.g., HP/Max HP, DR/DR Max)
 * First stat is the current value, second is the maximum
 */
export type PairedCombatStatConfig = readonly [CombatStatConfig, CombatStatConfig];

/**
 * Combat stat or paired stat union type
 */
export type CombatStatOrPair = CombatStatConfig | PairedCombatStatConfig;

/**
 * Complete combat stats section configuration
 */
export interface CombatStatsConfig {
  readonly title: string; // Section title
  readonly stats: readonly CombatStatOrPair[]; // List of combat stats (single or paired)
}
