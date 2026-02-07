/**
 * Character Type Definitions
 * Core type system for the TTRPG character sheet
 */

import { ClassData } from "./enums-config.types";

// ============================================================================
// Enums
// ============================================================================

/**
 * Available character species/races
 */
export enum Species {
  HUMAN = 'Human',
  ELF = 'Elf',
  DWARF = 'Dwarf',
  HALFLING = 'Halfling',
  ORC = 'Orc',
  GNOME = 'Gnome',
  TIEFLING = 'Tiefling',
  DRAGONBORN = 'Dragonborn',
}

/**
 * Available character classes
 */
export enum CharacterClassEnum {
  FIGHTER = 'Fighter',
  WIZARD = 'Wizard',
  ROGUE = 'Rogue',
  CLERIC = 'Cleric',
  RANGER = 'Ranger',
  BARBARIAN = 'Barbarian',
  BARD = 'Bard',
  DRUID = 'Druid',
  MONK = 'Monk',
  PALADIN = 'Paladin',
  SORCERER = 'Sorcerer',
  WARLOCK = 'Warlock',
}

/**
 * Character background experiences
 */
export enum Experience {
  SOLDIER = 'Soldier',
  SCHOLAR = 'Scholar',
  CRIMINAL = 'Criminal',
  NOBLE = 'Noble',
  ACOLYTE = 'Acolyte',
  FOLK_HERO = 'Folk Hero',
  MERCHANT = 'Merchant',
  ENTERTAINER = 'Entertainer',
  OUTLANDER = 'Outlander',
  SAILOR = 'Sailor',
}

/**
 * Equipment item types
 */
export enum EquipmentItem {
  NONE = 'None',
  LONGSWORD = 'Longsword',
  SHORTSWORD = 'Shortsword',
  GREATSWORD = 'Greatsword',
  DAGGER = 'Dagger',
  BOW = 'Bow',
  CROSSBOW = 'Crossbow',
  STAFF = 'Staff',
  WAND = 'Wand',
  SHIELD = 'Shield',
  LIGHT_ARMOR = 'Light Armor',
  MEDIUM_ARMOR = 'Medium Armor',
  HEAVY_ARMOR = 'Heavy Armor',
  BACKPACK = 'Backpack',
  ROPE = 'Rope',
  TORCH = 'Torch',
  BEDROLL = 'Bedroll',
  RATIONS = 'Rations',
}

/**
 * Consumable item types
 */
export enum ConsumableItem {
  NONE = 'None',
  HEALTH_POTION = 'Health Potion',
  MANA_POTION = 'Mana Potion',
  ANTIDOTE = 'Antidote',
  ELIXIR = 'Elixir',
  SCROLL = 'Scroll',
  BOMB = 'Bomb',
  POISON = 'Poison',
  FOOD = 'Food',
  WATER = 'Water',
  BANDAGES = 'Bandages',
}

/**
 * Experience bank item types (memories, knowledge, training)
 */
export enum ExperienceBankItem {
  NONE = 'None',
  COMBAT_TRAINING = 'Combat Training',
  ARCANE_KNOWLEDGE = 'Arcane Knowledge',
  SURVIVAL_SKILLS = 'Survival Skills',
  DIPLOMATIC_EXPERIENCE = 'Diplomatic Experience',
  CRAFTING_EXPERTISE = 'Crafting Expertise',
  LORE = 'Lore',
  LANGUAGE = 'Language',
  TRADE_SKILL = 'Trade Skill',
  RITUAL = 'Ritual',
  TECHNIQUE = 'Technique',
}

/**
 * Attribute type - dynamic string keys from configuration
 * No longer an enum to support fully configuration-driven attributes
 */
export type AttributeType = string;

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Character Class Object
 */
export interface CharacterClass {
  readonly name: string;
  readonly desc: string;
  readonly data: ClassData;
}

/**
 * Character level entry for multiclassing support
 */
export interface LevelEntry {
  readonly class: CharacterClass;
  readonly level: number;
}

/**
 * Character attributes - dynamic record of attribute IDs to numbers
 * Attributes are fully configuration-driven
 */
export type Attributes = Record<string, number>;

/**
 * Combat statistics - dynamic record loaded from configuration
 * Keys are stat IDs from combat-stats.json, values are numbers
 */
export interface CombatStats {
  readonly [statId: string]: number;
}

/**
 * Character information fields - dynamic record loaded from configuration
 * Keys are field IDs from character-info.json, values are strings
 */
export interface CharacterInfo {
  readonly [fieldId: string]: string;
}

/**
 * Inventory slots - dynamic record loaded from configuration
 * Keys are tab IDs from inventory.json, values are arrays of item names
 */
export interface InventorySlots {
  readonly [tabId: string]: readonly string[];
}

/**
 * Custom resource counter (can be number or boolean)
 */
export interface ResourceCounter {
  readonly id: string;
  readonly name: string;
  readonly type: 'number' | 'boolean';
  readonly value: number | boolean;
}

/**
 * Complete character sheet data structure
 */
export interface CharacterSheet {
  readonly version: string; // Schema version (e.g., "1.0.0")
  readonly characterInfo: CharacterInfo; // Dynamic fields loaded from config
  readonly name?: string; // DEPRECATED: Use characterInfo.name instead
  readonly level: readonly LevelEntry[];
  readonly species?: Species; // DEPRECATED: Use characterInfo.character_species instead
  readonly experience?: Experience; // DEPRECATED: Use characterInfo.character_experience instead
  readonly attributes: Attributes;
  readonly combatStats: CombatStats; // Dynamic stats loaded from config
  readonly movementRange?: number; // DEPRECATED: Use combatStats.movementRange instead
  readonly inventorySlots: InventorySlots; // Dynamic inventory tabs loaded from config
  readonly equipmentSlots?: readonly EquipmentItem[]; // DEPRECATED: Use inventorySlots.equipment instead
  readonly consumableSlots?: readonly ConsumableItem[]; // DEPRECATED: Use inventorySlots.consumables instead
  readonly experienceBank?: readonly ExperienceBankItem[]; // DEPRECATED: Use inventorySlots.experience instead
  readonly resourceCounters: readonly ResourceCounter[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Default empty character sheet
 */
export const createEmptyCharacter = (): CharacterSheet => ({
  version: '1.0.0',
  characterInfo: {
    // Default fields - will be populated from config on first load
    name: '',
    character_species: Species.HUMAN,
    character_experience: Experience.FOLK_HERO,
  },
  name: '', // DEPRECATED
  level: [],
  species: Species.HUMAN, // DEPRECATED
  experience: Experience.FOLK_HERO, // DEPRECATED
  attributes: {
    // Attributes will be populated from config on first load
  },
  combatStats: {
    // Default stats - will be populated from config on first load
    hp: 10,
    mp: 0,
    movementRange: 30,
    abilityBonus: 0,
    attackPower: 0,
    spellPower: 0,
    range: 5,
  },
  movementRange: 30, // DEPRECATED - kept for backward compatibility
  inventorySlots: {
    // Default inventory - will be populated from config on first load
    equipment: [],
    consumables: [],
    experience_bank: [],
  },
  equipmentSlots: [], // DEPRECATED
  consumableSlots: [], // DEPRECATED
  experienceBank: [], // DEPRECATED
  resourceCounters: [],
});

/**
 * Calculate total character level from multiclass levels
 */
export const calculateTotalLevel = (levels: readonly LevelEntry[]): number => {
  return levels.reduce((total, entry) => total + entry.level, 0);
};

/**
 * Calculate number of equipment slots based on STR attribute
 */
export const calculateEquipmentSlots = (str: number): number => {
  return Math.max(0, str);
};

/**
 * Calculate number of consumable slots based on DEX attribute
 */
export const calculateConsumableSlots = (dex: number): number => {
  return Math.max(0, dex);
};

/**
 * Calculate number of experience bank slots based on INT attribute
 */
export const calculateExperienceBankSlots = (int: number): number => {
  return Math.max(0, int);
};
