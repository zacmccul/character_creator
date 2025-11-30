/**
 * Enums Configuration Types
 * Types for defining reusable enum lists
 */

/**
 * Enum value - can be a simple string or an object with name and description
 */
export type EnumValue = string | { name: string; desc?: string };

/**
 * Single enum definition
 * Maps an ID to a list of values (strings or objects)
 */
export interface EnumDefinition {
  readonly id: string; // Unique identifier (e.g., "species", "classes")
  readonly label: string; // Human-readable name for the enum
  readonly description?: string; // Optional description
  readonly values: readonly EnumValue[]; // Array of enum values
}

/**
 * Complete enums configuration
 * Collection of all enum definitions
 */
export interface EnumsConfig {
  readonly enums: readonly EnumDefinition[];
}
