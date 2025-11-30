/**
 * Configuration Module
 * Imports all config JSON files as modules for bundling into the standalone HTML
 */

// Import configs directly as modules so they get bundled
import attributesConfig from '../../public/config/attributes.json';
import characterInfoConfig from '../../public/config/character-info.json';
import combatStatsConfig from '../../public/config/combat-stats.json';
import enumsConfig from '../../public/config/enums.json';
import inventoryConfig from '../../public/config/inventory.json';
import layoutConfig from '../../public/config/layout.json';
import levelClassConfig from '../../public/config/level-class.json';

export const configs = {
  attributes: attributesConfig,
  characterInfo: characterInfoConfig,
  combatStats: combatStatsConfig,
  enums: enumsConfig,
  inventory: inventoryConfig,
  layout: layoutConfig,
  levelClass: levelClassConfig,
};

export type ConfigType = keyof typeof configs;
