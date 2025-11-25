/**
 * Character Type Definitions
 * Core type system for the TTRPG character sheet
 */

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
export enum CharacterClass {
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
 * The five core attributes (0-4 scale)
 */
export enum AttributeType {
  STR = 'STR', // Strength - affects Equipment Slots
  DEX = 'DEX', // Dexterity - affects Consumable Slots
  INT = 'INT', // Intelligence - affects Experience Bank
  WIS = 'WIS', // Wisdom
  CHA = 'CHA', // Charisma
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Character level entry for multiclassing support
 */
export interface LevelEntry {
  readonly class: CharacterClass;
  readonly level: number;
}

/**
 * Character attributes (5 attributes with 0-4 range)
 */
export interface Attributes {
  readonly [AttributeType.STR]: number; // 0-4
  readonly [AttributeType.DEX]: number; // 0-4
  readonly [AttributeType.INT]: number; // 0-4
  readonly [AttributeType.WIS]: number; // 0-4
  readonly [AttributeType.CHA]: number; // 0-4
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
  readonly name: string;
  readonly level: readonly LevelEntry[];
  readonly species: Species;
  readonly experience: Experience;
  readonly attributes: Attributes;
  readonly movementRange: number; // Positive number
  readonly hp: number; // Integer
  readonly mp: number; // Positive integer
  readonly equipmentSlots: readonly EquipmentItem[]; // Length based on STR
  readonly consumableSlots: readonly ConsumableItem[]; // Length based on DEX
  readonly experienceBank: readonly ExperienceBankItem[]; // Length based on INT
  readonly resourceCounters: readonly ResourceCounter[];
  readonly abilityBonus: number; // Integer
  readonly attackPower: number; // Integer
  readonly spellPower: number; // Integer
  readonly range: number; // Positive integer
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Default empty character sheet
 */
export const createEmptyCharacter = (): CharacterSheet => ({
  version: '1.0.0',
  name: '',
  level: [],
  species: Species.HUMAN,
  experience: Experience.FOLK_HERO,
  attributes: {
    [AttributeType.STR]: 0,
    [AttributeType.DEX]: 0,
    [AttributeType.INT]: 0,
    [AttributeType.WIS]: 0,
    [AttributeType.CHA]: 0,
  },
  movementRange: 30,
  hp: 10,
  mp: 0,
  equipmentSlots: [],
  consumableSlots: [],
  experienceBank: [],
  resourceCounters: [],
  abilityBonus: 0,
  attackPower: 0,
  spellPower: 0,
  range: 5,
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
