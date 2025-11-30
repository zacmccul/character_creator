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
 * Paired combat stat configuration validator (for current/max pairs like HP/Max HP)
 */
export const PairedCombatStatConfigSchema = z.tuple([
  CombatStatConfigSchema,
  CombatStatConfigSchema,
]).refine(
  (data) => {
    const [first, second] = data;
    // First stat should have maximum: "dynamic" if it's meant to be capped by the second
    if (first.schema.maximum === 'dynamic') {
      // Second stat should have a numeric maximum
      return second.schema.maximum !== 'dynamic';
    }
    return true;
  },
  {
    message: 'In paired stats, if first stat has dynamic maximum, second stat must have numeric maximum',
  }
);

/**
 * Combat stat or paired stat (union type)
 */
export const CombatStatOrPairSchema = z.union([
  CombatStatConfigSchema,
  PairedCombatStatConfigSchema,
]);

/**
 * Complete combat stats configuration validator
 */
export const CombatStatsConfigSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  stats: z.array(CombatStatOrPairSchema).min(1, 'At least one stat must be defined'),
}).refine(
  (data) => {
    // Validate that all stat IDs are unique
    const ids: string[] = [];
    data.stats.forEach(stat => {
      if (Array.isArray(stat)) {
        // Paired stat
        ids.push(stat[0].id, stat[1].id);
      } else {
        // Single stat
        ids.push(stat.id);
      }
    });
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  },
  {
    message: 'All combat stat IDs must be unique',
  }
);
