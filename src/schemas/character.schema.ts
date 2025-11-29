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
  AttributeType,
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
 * Attributes schema (5 attributes with 0-4 range)
 */
export const AttributesSchema = z.object({
  [AttributeType.STR]: z.number().int().min(0).max(4),
  [AttributeType.DEX]: z.number().int().min(0).max(4),
  [AttributeType.INT]: z.number().int().min(0).max(4),
  [AttributeType.WIS]: z.number().int().min(0).max(4),
  [AttributeType.CHA]: z.number().int().min(0).max(4),
});

/**
 * Combat stats schema - dynamic record of stat IDs to numbers
 * Validates that all values are numbers
 */
export const CombatStatsSchema = z.record(z.string(), z.number());

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
  name: z.string(),
  level: z.array(LevelEntrySchema),
  species: SpeciesSchema,
  experience: ExperienceSchema,
  attributes: AttributesSchema,
  combatStats: CombatStatsSchema,
  movementRange: z.number().positive('Movement range must be positive').optional(), // DEPRECATED - kept for backward compatibility
  equipmentSlots: z.array(EquipmentItemSchema),
  consumableSlots: z.array(ConsumableItemSchema),
  experienceBank: z.array(ExperienceBankItemSchema),
  resourceCounters: z.array(ResourceCounterSchema),
}).refine(
  (data) => {
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
