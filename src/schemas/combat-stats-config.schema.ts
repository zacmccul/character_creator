/**
 * Combat Stats Configuration Schema
 * Zod schema for validating combat stats configuration
 */

import { z } from 'zod';
import { NumericSchemaSchema } from './attribute-config.schema';

/**
 * Single combat stat configuration validator
 */
export const CombatStatConfigSchema = z.object({
  id: z.string().min(1, 'Combat stat ID cannot be empty'),
  label: z.string().min(1, 'Combat stat label cannot be empty'),
  description: z.string(),
  emoji: z.string().optional(),
  schema: NumericSchemaSchema,
});

/**
 * Complete combat stats configuration validator
 */
export const CombatStatsConfigSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  stats: z.array(CombatStatConfigSchema).min(1, 'At least one stat must be defined'),
}).refine(
  (data) => {
    // Validate that all stat IDs are unique
    const ids = data.stats.map(stat => stat.id);
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  },
  {
    message: 'All combat stat IDs must be unique',
  }
);
