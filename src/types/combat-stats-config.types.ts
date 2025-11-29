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
}

/**
 * Complete combat stats section configuration
 */
export interface CombatStatsConfig {
  readonly title: string; // Section title
  readonly stats: readonly CombatStatConfig[]; // List of combat stats
}
