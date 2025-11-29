/**
 * Centralized Configuration Manager
 * Global config loader with validation and error reporting
 */

import { AttributesConfigSchema } from '@/schemas/attribute-config.schema';
import { EnumsConfigSchema } from '@/schemas/enums-config.schema';
import { CharacterInfoConfigSchema } from '@/schemas/character-info-config.schema';
import { CombatStatsConfigSchema } from '@/schemas/combat-stats-config.schema';
import { InventoryConfigSchema } from '@/schemas/inventory-config.schema';
import { LevelClassConfigSchema } from '@/schemas/level-class-config.schema';
import type { AttributesConfig } from '@/types/attribute-config.types';
import type { EnumsConfig, EnumDefinition } from '@/types/enums-config.types';
import type { CharacterInfoConfig } from '@/types/character-info-config.types';
import type { CombatStatsConfig } from '@/types/combat-stats-config.types';
import type { InventoryConfig } from '@/types/inventory-config.types';
import type { LevelClassConfig } from '@/types/level-class-config.types';
import { ZodError } from 'zod';

/**
 * Configuration validation error with detailed information
 */
export interface ConfigValidationError {
  readonly configName: string;
  readonly path: string;
  readonly message: string;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  readonly attributes: AttributesConfig;
  readonly enums: EnumsConfig;
  readonly characterInfo: CharacterInfoConfig;
  readonly combatStats: CombatStatsConfig;
  readonly inventory: InventoryConfig;
  readonly levelClass: LevelClassConfig;
}

/**
 * Configuration loading result
 */
export type ConfigLoadResult =
  | { success: true; config: AppConfig }
  | { success: false; errors: ConfigValidationError[] };

/**
 * Global configuration singleton
 */
class ConfigManager {
  private config: AppConfig | null = null;
  private loadPromise: Promise<ConfigLoadResult> | null = null;
  private errors: ConfigValidationError[] = [];

  /**
   * Load all configuration files
   */
  async loadAllConfigs(): Promise<ConfigLoadResult> {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Return cached config if already loaded successfully
    if (this.config) {
      return { success: true, config: this.config };
    }

    this.loadPromise = this._loadAllConfigs();
    const result = await this.loadPromise;
    this.loadPromise = null;

    return result;
  }

  private async _loadAllConfigs(): Promise<ConfigLoadResult> {
    const errors: ConfigValidationError[] = [];
    let attributes: AttributesConfig | null = null;
    let enums: EnumsConfig | null = null;
    let characterInfo: CharacterInfoConfig | null = null;
    let combatStats: CombatStatsConfig | null = null;
    let inventory: InventoryConfig | null = null;
    let levelClass: LevelClassConfig | null = null;

    // Load attributes configuration
    try {
      attributes = await this.loadConfig<AttributesConfig>(
        '/config/attributes.json',
        AttributesConfigSchema,
        'attributes'
      );
    } catch (error) {
      errors.push(...this.extractErrors(error, 'attributes'));
    }

    // Load enums configuration
    try {
      enums = await this.loadConfig<EnumsConfig>(
        '/config/enums.json',
        EnumsConfigSchema,
        'enums'
      );
    } catch (error) {
      errors.push(...this.extractErrors(error, 'enums'));
    }

    // Load character info configuration
    try {
      characterInfo = await this.loadConfig<CharacterInfoConfig>(
        '/config/character-info.json',
        CharacterInfoConfigSchema,
        'characterInfo'
      );
    } catch (error) {
      errors.push(...this.extractErrors(error, 'characterInfo'));
    }

    // Load combat stats configuration
    try {
      combatStats = await this.loadConfig<CombatStatsConfig>(
        '/config/combat-stats.json',
        CombatStatsConfigSchema,
        'combatStats'
      );
    } catch (error) {
      errors.push(...this.extractErrors(error, 'combatStats'));
    }

    // Load inventory configuration
    try {
      inventory = await this.loadConfig<InventoryConfig>(
        '/config/inventory.json',
        InventoryConfigSchema,
        'inventory'
      );
    } catch (error) {
      errors.push(...this.extractErrors(error, 'inventory'));
    }

    // Load level class configuration
    try {
      levelClass = await this.loadConfig<LevelClassConfig>(
        '/config/level-class.json',
        LevelClassConfigSchema,
        'levelClass'
      );
    } catch (error) {
      errors.push(...this.extractErrors(error, 'levelClass'));
    }

    // Validate cross-references between configs
    if (characterInfo && enums) {
      const enumRefErrors = this.validateEnumReferences(characterInfo, enums);
      errors.push(...enumRefErrors);
    }

    // Validate inventory enum references
    if (inventory && enums) {
      const inventoryEnumErrors = this.validateInventoryEnumReferences(inventory, enums);
      errors.push(...inventoryEnumErrors);
    }

    // Validate level class enum references
    if (levelClass && enums) {
      const levelClassEnumErrors = this.validateLevelClassEnumReferences(levelClass, enums);
      errors.push(...levelClassEnumErrors);
    }

    // Validate global ID uniqueness across all configs
    if (attributes && enums && characterInfo && combatStats && inventory) {
      const uniquenessErrors = this.validateGlobalIdUniqueness(attributes, enums, characterInfo, combatStats, inventory);
      errors.push(...uniquenessErrors);
    }

    // If any errors occurred, return them
    if (errors.length > 0 || !attributes || !enums || !characterInfo || !combatStats || !inventory || !levelClass) {
      this.errors = errors;
      return { success: false, errors };
    }

    // Cache successful config
    this.config = { attributes, enums, characterInfo, combatStats, inventory, levelClass };
    return { success: true, config: this.config };
  }

  /**
   * Load and validate a single configuration file
   */
  private async loadConfig<T>(
    path: string,
    schema: any,
    configName: string
  ): Promise<T> {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(
        `Failed to load ${configName}: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();
    const result = schema.safeParse(json);

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Extract validation errors from Zod error
   */
  private extractErrors(error: unknown, configName: string): ConfigValidationError[] {
    if (error instanceof ZodError) {
      return error.issues.map((err) => ({
        configName,
        path: err.path.join('.'),
        message: err.message,
      }));
    }

    if (error instanceof Error) {
      return [
        {
          configName,
          path: '',
          message: error.message,
        },
      ];
    }

    return [
      {
        configName,
        path: '',
        message: 'Unknown error occurred',
      },
    ];
  }

  /**
   * Validate that enum references in character info exist in enums config
   */
  private validateEnumReferences(
    characterInfo: CharacterInfoConfig,
    enums: EnumsConfig
  ): ConfigValidationError[] {
    const errors: ConfigValidationError[] = [];
    const enumIds = new Set(enums.enums.map((e) => e.id));

    characterInfo.fields.forEach((field) => {
      if (field.type === 'enum') {
        const enumId = field.enumRef.enumId;
        if (!enumIds.has(enumId)) {
          errors.push({
            configName: 'characterInfo',
            path: `fields.${field.id}.enumRef.enumId`,
            message: `Referenced enum '${enumId}' not found in enums configuration`,
          });
        }
      }
    });

    return errors;
  }

  /**
   * Validate that inventory tabs reference valid enums
   */
  private validateInventoryEnumReferences(
    inventory: InventoryConfig,
    enums: EnumsConfig
  ): ConfigValidationError[] {
    const errors: ConfigValidationError[] = [];
    const enumIds = new Set(enums.enums.map((e) => e.id));

    inventory.tabs.forEach((tab, index) => {
      if (!enumIds.has(tab.itemEnumId)) {
        errors.push({
          configName: 'inventory',
          path: `tabs.${index}.itemEnumId`,
          message: `Referenced enum '${tab.itemEnumId}' not found in enums configuration`,
        });
      }
    });

    return errors;
  }

  /**
   * Validate that level class configuration references a valid enum
   */
  private validateLevelClassEnumReferences(
    levelClass: LevelClassConfig,
    enums: EnumsConfig
  ): ConfigValidationError[] {
    const errors: ConfigValidationError[] = [];
    const enumIds = new Set(enums.enums.map((e) => e.id));

    if (!enumIds.has(levelClass.classEnum.enumId)) {
      errors.push({
        configName: 'levelClass',
        path: 'classEnum.enumId',
        message: `Referenced enum '${levelClass.classEnum.enumId}' not found in enums configuration`,
      });
    }

    return errors;
  }

  /**
   * Validate that all IDs are globally unique across all configurations
   * Enums, attributes, character info fields, combat stats, and inventory tabs must all have unique IDs
   */
  private validateGlobalIdUniqueness(
    attributes: AttributesConfig,
    enums: EnumsConfig,
    characterInfo: CharacterInfoConfig,
    combatStats: CombatStatsConfig,
    inventory: InventoryConfig
  ): ConfigValidationError[] {
    const errors: ConfigValidationError[] = [];
    const idMap = new Map<string, { configName: string; path: string }>();

    // Collect all enum IDs
    enums.enums.forEach((enumDef, index) => {
      const existing = idMap.get(enumDef.id);
      if (existing) {
        errors.push({
          configName: 'enums',
          path: `enums.${index}.id`,
          message: `ID '${enumDef.id}' is already used in ${existing.configName} at ${existing.path}`,
        });
      } else {
        idMap.set(enumDef.id, { configName: 'enums', path: `enums.${index}.id` });
      }
    });

    // Collect all attribute IDs
    attributes.attributes.forEach((attr, index) => {
      const existing = idMap.get(attr.id);
      if (existing) {
        errors.push({
          configName: 'attributes',
          path: `attributes.${index}.id`,
          message: `ID '${attr.id}' is already used in ${existing.configName} at ${existing.path}`,
        });
      } else {
        idMap.set(attr.id, { configName: 'attributes', path: `attributes.${index}.id` });
      }
    });

    // Collect all character info field IDs
    characterInfo.fields.forEach((field, index) => {
      const existing = idMap.get(field.id);
      if (existing) {
        errors.push({
          configName: 'characterInfo',
          path: `fields.${index}.id`,
          message: `ID '${field.id}' is already used in ${existing.configName} at ${existing.path}`,
        });
      } else {
        idMap.set(field.id, { configName: 'characterInfo', path: `fields.${index}.id` });
      }
    });

    // Collect all combat stat IDs
    combatStats.stats.forEach((stat, index) => {
      const existing = idMap.get(stat.id);
      if (existing) {
        errors.push({
          configName: 'combatStats',
          path: `stats.${index}.id`,
          message: `ID '${stat.id}' is already used in ${existing.configName} at ${existing.path}`,
        });
      } else {
        idMap.set(stat.id, { configName: 'combatStats', path: `stats.${index}.id` });
      }
    });

    // Collect all inventory tab IDs
    inventory.tabs.forEach((tab, index) => {
      const existing = idMap.get(tab.id);
      if (existing) {
        errors.push({
          configName: 'inventory',
          path: `tabs.${index}.id`,
          message: `ID '${tab.id}' is already used in ${existing.configName} at ${existing.path}`,
        });
      } else {
        idMap.set(tab.id, { configName: 'inventory', path: `tabs.${index}.id` });
      }
    });

    return errors;
  }

  /**
   * Get enum definition by ID
   */
  getEnum(enumId: string): EnumDefinition | undefined {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadAllConfigs() first.');
    }
    return this.config.enums.enums.find((e) => e.id === enumId);
  }

  /**
   * Get current configuration (throws if not loaded)
   */
  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadAllConfigs() first.');
    }
    return this.config;
  }

  /**
   * Get loading errors
   */
  getErrors(): ConfigValidationError[] {
    return this.errors;
  }

  /**
   * Check if config is loaded
   */
  isLoaded(): boolean {
    return this.config !== null;
  }

  /**
   * Reset configuration (for testing)
   */
  reset(): void {
    this.config = null;
    this.loadPromise = null;
    this.errors = [];
  }

  /**
   * Format errors as human-readable string
   */
  formatErrors(errors: ConfigValidationError[]): string {
    if (errors.length === 0) {
      return 'No errors';
    }

    return errors
      .map((error) => {
        const pathStr = error.path ? ` at ${error.path}` : '';
        return `[${error.configName}${pathStr}] ${error.message}`;
      })
      .join('\n');
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

/**
 * Hook-friendly wrapper for loading configuration
 */
export async function loadAppConfig(): Promise<ConfigLoadResult> {
  return configManager.loadAllConfigs();
}

/**
 * Get current configuration (must be loaded first)
 */
export function getAppConfig(): AppConfig {
  return configManager.getConfig();
}

/**
 * Get enum by ID (must be loaded first)
 */
export function getEnumById(enumId: string): EnumDefinition | undefined {
  return configManager.getEnum(enumId);
}

/**
 * Check if configuration is loaded
 */
export function isConfigLoaded(): boolean {
  return configManager.isLoaded();
}
