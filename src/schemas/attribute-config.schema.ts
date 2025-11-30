/**
 * Attribute Configuration Schema
 * Zod schema for validating attribute configuration JSON
 */

import { z } from 'zod';

/**
 * OpenAPI-style numeric schema validator
 * Supports "dynamic" as a maximum value to indicate the value should be capped by a paired stat
 */
export const NumericSchemaSchema = z.object({
  type: z.enum(['integer', 'number']),
  minimum: z.number().optional(),
  maximum: z.union([z.number(), z.literal('dynamic')]).optional(),
  exclusiveMinimum: z.number().optional(),
  exclusiveMaximum: z.number().optional(),
  multipleOf: z.number().positive().optional(),
  default: z.number().optional(),
}).refine(
  (data) => {
    // Validate that minimum < maximum if both are present and maximum is not dynamic
    if (data.minimum !== undefined && data.maximum !== undefined && data.maximum !== 'dynamic') {
      return data.minimum <= data.maximum;
    }
    return true;
  },
  {
    message: 'minimum must be less than or equal to maximum',
  }
).refine(
  (data) => {
    // Validate exclusive bounds
    if (data.exclusiveMinimum !== undefined && data.exclusiveMaximum !== undefined) {
      return data.exclusiveMinimum < data.exclusiveMaximum;
    }
    return true;
  },
  {
    message: 'exclusiveMinimum must be less than exclusiveMaximum',
  }
);

/**
 * Single attribute configuration validator
 */
export const AttributeConfigSchema = z.object({
  id: z.string().min(1, 'Attribute ID cannot be empty'),
  label: z.string().min(1, 'Attribute label cannot be empty'),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  schema: NumericSchemaSchema,
});

/**
 * Complete attributes configuration validator
 */
export const AttributesConfigSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  attributes: z.array(AttributeConfigSchema).min(1, 'At least one attribute must be defined'),
}).refine(
  (data) => {
    // Validate that all attribute IDs are unique
    const ids = data.attributes.map(attr => attr.id);
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  },
  {
    message: 'All attribute IDs must be unique',
  }
);

/**
 * Attribute reference validator
 */
export const AttributeReferenceSchema = z.object({
  attributeId: z.string().min(1, 'Attribute ID cannot be empty'),
  formula: z.string().optional(),
});
