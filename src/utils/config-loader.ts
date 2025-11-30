/**
 * Configuration Loading Utility
 * Utilities for loading and validating configuration JSON files
 */

import { AttributesConfigSchema } from '@/schemas/attribute-config.schema';
import type { AttributesConfig, AttributeConfig } from '@/types/attribute-config.types';

/**
 * Load and validate attributes configuration from JSON file
 * @param path - Path to the attributes.json file (relative to public directory)
 * @returns Validated attributes configuration
 * @throws Error if configuration is invalid or fails to load
 */
export async function loadAttributesConfig(path: string = '/config/attributes.json'): Promise<AttributesConfig> {
  try {
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.status} ${response.statusText}`);
    }
    
    const json = await response.json();
    
    // Validate with Zod schema
    const result = AttributesConfigSchema.safeParse(json);
    
    if (!result.success) {
      console.error('Configuration validation errors:', result.error.format());
      throw new Error(`Invalid attributes configuration: ${result.error.message}`);
    }
    
    return result.data;
  } catch (error) {
    console.error('Failed to load attributes configuration:', error);
    throw error;
  }
}

/**
 * Get attribute configuration by ID
 * @param config - Attributes configuration
 * @param id - Attribute ID to find
 * @returns Attribute configuration or undefined if not found
 */
export function getAttributeById(config: AttributesConfig, id: string): AttributeConfig | undefined {
  return config.attributes.find(attr => attr.id === id);
}

/**
 * Get all attribute IDs from configuration
 * @param config - Attributes configuration
 * @returns Array of attribute IDs
 */
export function getAttributeIds(config: AttributesConfig): string[] {
  return config.attributes.map(attr => attr.id);
}

/**
 * Validate that an attribute value conforms to its schema constraints
 * @param attribute - Attribute configuration
 * @param value - Value to validate
 * @param dynamicMaxValue - Optional maximum value when schema.maximum is "dynamic"
 * @returns True if valid, false otherwise
 */
export function validateAttributeValue(
  attribute: AttributeConfig, 
  value: number, 
  dynamicMaxValue?: number
): boolean {
  const { schema } = attribute;
  
  // Check type
  if (schema.type === 'integer' && !Number.isInteger(value)) {
    return false;
  }
  
  // Check minimum
  if (schema.minimum !== undefined && value < schema.minimum) {
    return false;
  }
  
  // Check maximum
  if (schema.maximum !== undefined) {
    if (schema.maximum === 'dynamic') {
      // Use the provided dynamic max value if available
      if (dynamicMaxValue !== undefined && value > dynamicMaxValue) {
        return false;
      }
    } else if (value > schema.maximum) {
      return false;
    }
  }
  
  // Check exclusive minimum
  if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
    return false;
  }
  
  // Check exclusive maximum
  if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
    return false;
  }
  
  // Check multiple of
  if (schema.multipleOf !== undefined && value % schema.multipleOf !== 0) {
    return false;
  }
  
  return true;
}

/**
 * Get the default value for an attribute from its schema
 * @param attribute - Attribute configuration
 * @returns Default value or 0 if not specified
 */
export function getAttributeDefault(attribute: AttributeConfig): number {
  return attribute.schema.default ?? 0;
}

/**
 * Get min/max bounds for an attribute
 * @param attribute - Attribute configuration
 * @param dynamicMaxValue - Optional maximum value when schema.maximum is "dynamic"
 * @returns Object with min and max values
 */
export function getAttributeBounds(
  attribute: AttributeConfig, 
  dynamicMaxValue?: number
): { min: number; max: number } {
  const { schema } = attribute;
  
  let min = schema.minimum ?? Number.MIN_SAFE_INTEGER;
  let max: number;
  
  if (schema.maximum === 'dynamic') {
    max = dynamicMaxValue ?? Number.MAX_SAFE_INTEGER;
  } else {
    max = schema.maximum ?? Number.MAX_SAFE_INTEGER;
  }
  
  // Adjust for exclusive bounds
  if (schema.exclusiveMinimum !== undefined) {
    min = Math.max(min, schema.exclusiveMinimum + (schema.type === 'integer' ? 1 : Number.EPSILON));
  }
  
  if (schema.exclusiveMaximum !== undefined) {
    max = Math.min(max, schema.exclusiveMaximum - (schema.type === 'integer' ? 1 : Number.EPSILON));
  }
  
  return { min, max };
}

/**
 * Get attribute value from character by attribute ID
 * Useful for components that reference attributes from configuration
 * @param character - Character data
 * @param attributeId - Attribute ID to get value for
 * @returns Attribute value or undefined if not found
 */
export function getAttributeValue(character: { attributes: Record<string, number> }, attributeId: string): number | undefined {
  return character.attributes[attributeId];
}

/**
 * Evaluate a simple formula referencing an attribute
 * For now, supports simple references like "STR" or basic math like "STR * 2"
 * This can be extended in the future for more complex formulas
 * @param character - Character data
 * @param formula - Formula string (e.g., "STR", "DEX * 2", "INT + 1")
 * @returns Evaluated result or undefined if formula is invalid
 */
export function evaluateAttributeFormula(character: { attributes: Record<string, number> }, formula: string): number | undefined {
  try {
    // Simple case: just an attribute ID
    if (formula in character.attributes) {
      return character.attributes[formula];
    }
    
    // For now, return undefined for complex formulas
    // This can be extended later with a proper expression evaluator
    return undefined;
  } catch {
    return undefined;
  }
}
