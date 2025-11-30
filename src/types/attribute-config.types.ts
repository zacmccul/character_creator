/**
 * Attribute Configuration Types
 * Types for configuration-driven attribute system
 */

/**
 * OpenAPI-style numeric schema for attribute constraints
 * Based on OpenAPI 3.0 numeric schema properties
 * Supports "dynamic" as maximum to indicate value should be capped by paired stat
 */
export interface NumericSchema {
  readonly type: 'integer' | 'number';
  readonly minimum?: number;
  readonly maximum?: number | 'dynamic';
  readonly exclusiveMinimum?: number;
  readonly exclusiveMaximum?: number;
  readonly multipleOf?: number;
  readonly default?: number;
}

/**
 * Single attribute definition in configuration
 */
export interface AttributeConfig {
  readonly id: string; // Unique identifier (e.g., "STR", "DEX")
  readonly label: string; // Display name (e.g., "Strength")
  readonly description: string; // Tooltip description
  readonly emoji?: string; // Optional emoji icon
  readonly color?: string; // Optional Chakra UI color scheme
  readonly schema: NumericSchema; // OpenAPI-style numeric constraints
}

/**
 * Complete attributes section configuration
 */
export interface AttributesConfig {
  readonly title: string; // Section title
  readonly attributes: readonly AttributeConfig[]; // List of attributes
}

/**
 * Reference to an attribute ID for use in other components
 * This allows other components to reference attribute values by ID
 */
export interface AttributeReference {
  readonly attributeId: string; // ID of the attribute to reference
  readonly formula?: string; // Optional formula (for future use)
}
