/**
 * Level & Class Configuration Schema
 * Zod validation schema for level/class configuration
 */

import { z } from 'zod';

/**
 * Schema for enum reference
 */
export const EnumReferenceSchema = z.object({
  enumId: z.string().min(1, 'Enum ID must not be empty'),
});

/**
 * Schema for level field configuration
 */
export const LevelFieldConfigSchema = z.object({
  label: z.string().min(1, 'Label must not be empty'),
  min: z.number().int().positive('Min must be a positive integer'),
  max: z.number().int().positive('Max must be a positive integer'),
  default: z.number().int().positive('Default must be a positive integer'),
}).refine(
  (data) => data.min <= data.max,
  { message: 'Min must be less than or equal to max' }
).refine(
  (data) => data.default >= data.min && data.default <= data.max,
  { message: 'Default must be between min and max' }
);

/**
 * Schema for complete level & class configuration
 */
export const LevelClassConfigSchema = z.object({
  title: z.string().min(1, 'Title must not be empty'),
  description: z.string(),
  classEnum: EnumReferenceSchema,
  levelField: LevelFieldConfigSchema,
  addButtonText: z.string().min(1, 'Add button text must not be empty'),
  emptyStateText: z.string().min(1, 'Empty state text must not be empty'),
  multiclassInfoTemplate: z.string().min(1, 'Multiclass info template must not be empty'),
});

export type LevelClassConfigType = z.infer<typeof LevelClassConfigSchema>;
