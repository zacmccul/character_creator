/**
 * Character Info Configuration Types
 * Types for defining character information fields
 */

/**
 * Field types supported in character info
 */
export type FieldType = 'text' | 'enum';

/**
 * Reference to an enum definition by ID
 */
export interface EnumReference {
  readonly enumId: string; // ID of the enum from enums.json
}

/**
 * Base field configuration
 */
interface BaseFieldConfig {
  readonly id: string; // Unique identifier for the field
  readonly label: string; // Display label
  readonly description?: string; // Optional tooltip description
  readonly required?: boolean; // Whether the field is required
  readonly placeholder?: string; // Placeholder text for text fields
}

/**
 * Text field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
  readonly type: 'text';
  readonly defaultValue?: string;
}

/**
 * Enum/dropdown field configuration
 */
export interface EnumFieldConfig extends BaseFieldConfig {
  readonly type: 'enum';
  readonly enumRef: EnumReference; // Reference to enum definition
  readonly defaultValue?: string; // Default selected value
}

/**
 * Union type for all field configurations
 */
export type FieldConfig = TextFieldConfig | EnumFieldConfig;

/**
 * Complete character info configuration
 */
export interface CharacterInfoConfig {
  readonly title: string; // Section title
  readonly fields: readonly FieldConfig[]; // Array of field definitions
}
