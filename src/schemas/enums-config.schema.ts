/**
 * Enums Configuration Schema
 * Zod schema for validating enum definitions
 */

import { z } from 'zod';

/**
 * Class data config
 */
export const ValueDataSchema = z.object({
  type: z.string(),
  hp: z.number(),
})

/**
 * Enum value - can be a simple string or an object with name and optional description
 */
export const EnumValueSchema = z.union([
  z.string().min(1, 'Enum value string cannot be empty'),
  z.object({
    name: z.string().min(1, 'Enum value name cannot be empty'),
    desc: z.string().optional(),
    data: ValueDataSchema.optional(), // This will be OR'd with other data schemas as they are needed/created
  }),
]);

/**
 * Single enum definition validator
 */
export const EnumDefinitionSchema = z.object({
  id: z.string().min(1, 'Enum ID cannot be empty'),
  label: z.string().min(1, 'Enum label cannot be empty'),
  description: z.string().optional(),
  values: z.array(EnumValueSchema).min(1, 'Enum must have at least one value'),
}).refine(
  (data) => {
    // Validate that all values are unique within this enum
    // Extract names for comparison
    const names = data.values.map(v => typeof v === 'string' ? v : v.name);
    const uniqueNames = new Set(names);
    return names.length === uniqueNames.size;
  },
  {
    message: 'All enum value names must be unique',
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
