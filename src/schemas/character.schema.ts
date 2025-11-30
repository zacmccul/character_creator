/**
 * Zod Schema Validation
 * Validation schemas for character sheet data
 */

import { z } from 'zod';
import {
  Species,
  CharacterClass,
  Experience,
  EquipmentItem,
  ConsumableItem,
  ExperienceBankItem,
} from '@/types/character.types';

// ============================================================================
// Enum Schemas
// ============================================================================

export const SpeciesSchema = z.nativeEnum(Species);
export const CharacterClassSchema = z.nativeEnum(CharacterClass);
export const ExperienceSchema = z.nativeEnum(Experience);
export const EquipmentItemSchema = z.nativeEnum(EquipmentItem);
export const ConsumableItemSchema = z.nativeEnum(ConsumableItem);
export const ExperienceBankItemSchema = z.nativeEnum(ExperienceBankItem);

// ============================================================================
// Core Schemas
// ============================================================================

/**
 * Level entry schema for multiclassing
 */
export const LevelEntrySchema = z.object({
  class: CharacterClassSchema,
  level: z.number().int().positive().min(1).max(20),
});

/**
 * Attributes schema - dynamic record of attribute IDs to numbers
 * Validates that all values are numbers (specific ranges enforced by config schema)
 */
export const AttributesSchema = z.record(z.string(), z.number());

/**
 * Combat stats schema - dynamic record of stat IDs to numbers
 * Validates that all values are numbers
 */
export const CombatStatsSchema = z.record(z.string(), z.number());

/**
 * Character info schema - dynamic record of field IDs to strings
 * Validates that all values are strings
 */
export const CharacterInfoSchema = z.record(z.string(), z.string());

/**
 * Inventory slots schema - dynamic record of tab IDs to string arrays
 * Validates that all values are arrays of strings
 */
export const InventorySlotsSchema = z.record(z.string(), z.array(z.string()));

/**
 * Resource counter schema (number or boolean)
 */
export const ResourceCounterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Resource name cannot be empty'),
  type: z.enum(['number', 'boolean']),
  value: z.union([z.number(), z.boolean()]),
}).refine(
  (data) => {
    if (data.type === 'number') {
      return typeof data.value === 'number';
    }
    return typeof data.value === 'boolean';
  },
  {
    message: 'Value type must match the specified type',
  }
);

/**
 * Complete character sheet schema
 */
export const CharacterSheetSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semantic versioning format (e.g., 1.0.0)'),
  characterInfo: CharacterInfoSchema,
  name: z.string().optional(), // DEPRECATED - kept for backward compatibility
  level: z.array(LevelEntrySchema),
  species: SpeciesSchema.optional(), // DEPRECATED - kept for backward compatibility
  experience: ExperienceSchema.optional(), // DEPRECATED - kept for backward compatibility
  attributes: AttributesSchema,
  combatStats: CombatStatsSchema,
  movementRange: z.number().positive('Movement range must be positive').optional(), // DEPRECATED - kept for backward compatibility
  inventorySlots: InventorySlotsSchema,
  equipmentSlots: z.array(EquipmentItemSchema).optional(), // DEPRECATED - kept for backward compatibility
  consumableSlots: z.array(ConsumableItemSchema).optional(), // DEPRECATED - kept for backward compatibility
  experienceBank: z.array(ExperienceBankItemSchema).optional(), // DEPRECATED - kept for backward compatibility
  resourceCounters: z.array(ResourceCounterSchema),
}).refine(
  (data) => {
    // DEPRECATED validation - skip if not present, empty array, or if STR attribute doesn't exist
    if (!data.equipmentSlots || data.equipmentSlots.length === 0 || data.attributes.STR === undefined) return true;
    // Validate that equipment slots length matches STR attribute
    const expectedEquipmentSlots = Math.max(0, data.attributes.STR);
    return data.equipmentSlots.length === expectedEquipmentSlots;
  },
  {
    message: 'Equipment slots length must match STR attribute value',
    path: ['equipmentSlots'],
  }
).refine(
  (data) => {
    // DEPRECATED validation - skip if not present, empty array, or if DEX attribute doesn't exist
    if (!data.consumableSlots || data.consumableSlots.length === 0 || data.attributes.DEX === undefined) return true;
    // Validate that consumable slots length matches DEX attribute
    const expectedConsumableSlots = Math.max(0, data.attributes.DEX);
    return data.consumableSlots.length === expectedConsumableSlots;
  },
  {
    message: 'Consumable slots length must match DEX attribute value',
    path: ['consumableSlots'],
  }
).refine(
  (data) => {
    // DEPRECATED validation - skip if not present, empty array, or if INT attribute doesn't exist
    if (!data.experienceBank || data.experienceBank.length === 0 || data.attributes.INT === undefined) return true;
    // Validate that experience bank length matches INT attribute
    const expectedExperienceBank = Math.max(0, data.attributes.INT);
    return data.experienceBank.length === expectedExperienceBank;
  },
  {
    message: 'Experience bank length must match INT attribute value',
    path: ['experienceBank'],
  }
);

// ============================================================================
// Type Inference
// ============================================================================

export type CharacterSheetValidated = z.infer<typeof CharacterSheetSchema>;
export type LevelEntryValidated = z.infer<typeof LevelEntrySchema>;
export type AttributesValidated = z.infer<typeof AttributesSchema>;
export type ResourceCounterValidated = z.infer<typeof ResourceCounterSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate character sheet data and return result
 */
export const validateCharacterSheet = (data: unknown) => {
  return CharacterSheetSchema.safeParse(data);
};

/**
 * Validate and parse character sheet data, throwing on error
 */
export const parseCharacterSheet = (data: unknown): CharacterSheetValidated => {
  return CharacterSheetSchema.parse(data);
};

/**
 * Validate partial character sheet updates
 */
export const PartialCharacterSheetSchema = CharacterSheetSchema.partial();

/**
 * Get user-friendly error messages from Zod validation errors
 */
export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
};

/**
 * Validate single attribute value
 */
export const validateAttribute = (value: unknown): value is number => {
  const result = z.number().int().min(0).max(4).safeParse(value);
  return result.success;
};

/**
 * Validate combat stat value (generic number validation)
 */
export const validateCombatStat = (value: unknown): value is number => {
  const result = z.number().safeParse(value);
  return result.success;
};

/**
 * DEPRECATED: Use validateCombatStat instead
 * Validate movement range value
 */
export const validateMovementRange = (value: unknown): value is number => {
  const result = z.number().positive().safeParse(value);
  return result.success;
};

/**
 * DEPRECATED: Use validateCombatStat instead
 * Validate HP value
 */
export const validateHP = (value: unknown): value is number => {
  const result = z.number().int().safeParse(value);
  return result.success;
};

/**
 * DEPRECATED: Use validateCombatStat instead
 * Validate MP value
 */
export const validateMP = (value: unknown): value is number => {
  const result = z.number().int().nonnegative().safeParse(value);
  return result.success;
};

/**
 * DEPRECATED: Use validateCombatStat instead
 * Validate range value
 */
export const validateRange = (value: unknown): value is number => {
  const result = z.number().int().positive().safeParse(value);
  return result.success;
};
