/**
 * Inventory Configuration Schema
 * Zod validation for inventory configuration
 */

import { z } from 'zod';

/**
 * Inventory tab schema
 */
export const InventoryTabConfigSchema = z.object({
  id: z.string().min(1, 'Tab ID is required'),
  label: z.string().min(1, 'Label is required'),
  emoji: z.string(),
  description: z.string(),
  itemEnumId: z.string().min(1, 'Item enum ID is required'),
  slotFormula: z.string().min(1, 'Slot formula is required'),
  emptySlotMessage: z.string().optional(),
});

/**
 * Inventory configuration schema
 */
export const InventoryConfigSchema = z.object({
  title: z.string(),
  tabs: z.array(InventoryTabConfigSchema).min(1, 'At least one tab is required'),
});

// Type inference
export type InventoryTabConfigValidated = z.infer<typeof InventoryTabConfigSchema>;
export type InventoryConfigValidated = z.infer<typeof InventoryConfigSchema>;
