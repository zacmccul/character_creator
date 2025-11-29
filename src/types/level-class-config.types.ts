/**
 * Level & Class Configuration Types
 * Configuration for the level/class section component
 */

/**
 * Reference to an enum definition
 */
export interface EnumReference {
  readonly enumId: string;
}

/**
 * Level field configuration
 */
export interface LevelFieldConfig {
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly default: number;
}

/**
 * Complete level & class section configuration
 */
export interface LevelClassConfig {
  readonly title: string;
  readonly description: string;
  readonly classEnum: EnumReference;
  readonly levelField: LevelFieldConfig;
  readonly addButtonText: string;
  readonly emptyStateText: string;
  readonly multiclassInfoTemplate: string;
}
