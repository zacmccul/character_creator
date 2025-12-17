/**
 * Enums Configuration Types
 * Types for defining reusable enum lists
 */

/**
 * Definition for enum data types (ClassData, etc)
 */
export type ClassData = {
  type: "martial" | "caster",
  hp: number,
};

/**
 * Type def for enum values that aren't strings (classes, items, etc.)
 */
export type EnumObjectValue = { name: string; desc?: string; data?: ClassData };

/**
 * Enum value - can be a simple string or an object with name and description
 */
export type EnumValue = string | EnumObjectValue;

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
