/**
 * Character Info Configuration Schema
 * Zod schema for validating character info configuration
 */

import { z } from 'zod';

/**
 * Enum reference validator
 */
export const EnumReferenceSchema = z.object({
  enumId: z.string().min(1, 'Enum ID cannot be empty'),
});

/**
 * Base field configuration
 */
const BaseFieldConfigSchema = z.object({
  id: z.string().min(1, 'Field ID cannot be empty'),
  label: z.string().min(1, 'Field label cannot be empty'),
  description: z.string().optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

/**
 * Text field configuration validator
 */
export const TextFieldConfigSchema = BaseFieldConfigSchema.extend({
  type: z.literal('text'),
  defaultValue: z.string().optional(),
});

/**
 * Enum field configuration validator
 */
export const EnumFieldConfigSchema = BaseFieldConfigSchema.extend({
  type: z.literal('enum'),
  enumRef: EnumReferenceSchema,
  defaultValue: z.string().optional(),
});

/**
 * Field configuration discriminated union
 */
export const FieldConfigSchema = z.discriminatedUnion('type', [
  TextFieldConfigSchema,
  EnumFieldConfigSchema,
]);

/**
 * Complete character info configuration validator
 */
export const CharacterInfoConfigSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  fields: z.array(FieldConfigSchema).min(1, 'At least one field must be defined'),
}).refine(
  (data) => {
    // Validate that all field IDs are unique
    const ids = data.fields.map(f => f.id);
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  },
  {
    message: 'All field IDs must be unique',
  }
);
