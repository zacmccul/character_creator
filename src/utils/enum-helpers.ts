/**
 * Enum Helper Utilities
 * Helper functions for working with enum values that can be strings or objects
 */

import type { EnumValue } from '@/types/enums-config.types';

/**
 * Extract the name from an enum value (string or object)
 */
export function getEnumValueName(value: EnumValue): string {
  return typeof value === 'string' ? value : value.name;
}

/**
 * Extract the description from an enum value (if it exists)
 */
export function getEnumValueDescription(value: EnumValue): string | undefined {
  return typeof value === 'string' ? undefined : value.desc;
}

/**
 * Check if an enum value has a description
 */
export function hasEnumValueDescription(value: EnumValue): boolean {
  return typeof value === 'object' && value.desc !== undefined;
}

/**
 * Find an enum value by name
 */
export function findEnumValueByName(
  values: readonly EnumValue[],
  name: string
): EnumValue | undefined {
  return values.find(v => getEnumValueName(v) === name);
}

/**
 * Get all enum value names
 */
export function getEnumValueNames(values: readonly EnumValue[]): string[] {
  return values.map(getEnumValueName);
}
