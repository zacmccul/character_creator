/**
 * Enums Configuration Schema
 * Zod schema for validating enum definitions
 */

import { z } from 'zod';

/**
 * Single enum definition validator
 */
export const EnumDefinitionSchema = z.object({
  id: z.string().min(1, 'Enum ID cannot be empty'),
  label: z.string().min(1, 'Enum label cannot be empty'),
  description: z.string().optional(),
  values: z.array(z.string()).min(1, 'Enum must have at least one value'),
}).refine(
  (data) => {
    // Validate that all values are unique within this enum
    const uniqueValues = new Set(data.values);
    return data.values.length === uniqueValues.size;
  },
  {
    message: 'All enum values must be unique',
  }
);

/**
 * Complete enums configuration validator
 */
export const EnumsConfigSchema = z.object({
  enums: z.array(EnumDefinitionSchema).min(1, 'At least one enum must be defined'),
}).refine(
  (data) => {
    // Validate that all enum IDs are unique
    const ids = data.enums.map(e => e.id);
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  },
  {
    message: 'All enum IDs must be unique',
  }
);
