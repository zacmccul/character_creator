/**
 * Enums Configuration Types
 * Types for defining reusable enum lists
 */

/**
 * Single enum definition
 * Maps an ID to a list of string values
 */
export interface EnumDefinition {
  readonly id: string; // Unique identifier (e.g., "species", "classes")
  readonly label: string; // Human-readable name for the enum
  readonly description?: string; // Optional description
  readonly values: readonly string[]; // Array of enum values
}

/**
 * Complete enums configuration
 * Collection of all enum definitions
 */
export interface EnumsConfig {
  readonly enums: readonly EnumDefinition[];
}
