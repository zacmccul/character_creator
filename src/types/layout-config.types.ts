/**
 * Layout Configuration Types
 * Defines the structure for config-driven component layouts using Chakra UI SimpleGrid
 */

import { z } from 'zod';

/**
 * Responsive breakpoint values for Chakra UI
 * These match Chakra's default breakpoint system
 */
export type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

/**
 * Component identifiers that can be placed in the layout
 * These must match the component IDs defined in the system
 */
export type ComponentId =
  | 'character-info'
  | 'attributes'
  | 'combat-stats'
  | 'level-class'
  | 'resource-counters'
  | 'inventory';

/**
 * Component item configuration for column-based layout
 */
export interface LayoutComponentItem {
  /** Unique identifier for the component to render */
  componentId: ComponentId;
  
  /** Which column this component belongs to (0-indexed) */
  column: number;
  
  /** Minimum height for this component */
  minH?: ResponsiveValue<string | number>;
  
  /** Whether this item should be hidden at certain breakpoints */
  display?: ResponsiveValue<'none' | 'flex'>;
  
  /** Custom className for additional styling */
  className?: string;
}

/**
 * Column configuration
 */
export interface ColumnConfig {
  /** Width of this column (e.g., "400px", "1fr", "300px") */
  width: ResponsiveValue<string>;
  
  /** Optional label for this column (for debugging/documentation) */
  label?: string;
}

/**
 * Main layout configuration structure
 * Defines how components are arranged in columns using HStack + VStack
 */
export interface LayoutConfig {
  /** Version of the layout config format */
  version: string;
  
  /** Human-readable name for this layout */
  name: string;
  
  /** Description of the layout */
  description?: string;
  
  /** Column definitions (defines widths for each column) */
  columns: ColumnConfig[];
  
  /** Gap between columns */
  columnGap?: ResponsiveValue<string | number>;
  
  /** Gap between items within each column */
  itemGap?: ResponsiveValue<string | number>;
  
  /** Components and which column they belong to */
  items: LayoutComponentItem[];
  
  /** Container configuration */
  container?: {
    /** Max width for the main container (responsive) */
    maxW?: ResponsiveValue<string>;
    
    /** Padding for the container (responsive) */
    px?: ResponsiveValue<string | number>;
    
    /** Vertical padding (responsive) */
    py?: ResponsiveValue<string | number>;
  };
}

/**
 * Zod schema for runtime validation of layout configuration
 */

// Helper schemas for responsive values
const responsiveNumberSchema = z.union([
  z.number(),
  z.object({
    base: z.number().optional(),
    sm: z.number().optional(),
    md: z.number().optional(),
    lg: z.number().optional(),
    xl: z.number().optional(),
    '2xl': z.number().optional(),
  }),
]);

const responsiveStringSchema = z.union([
  z.string(),
  z.object({
    base: z.string().optional(),
    sm: z.string().optional(),
    md: z.string().optional(),
    lg: z.string().optional(),
    xl: z.string().optional(),
    '2xl': z.string().optional(),
  }),
]);

const componentIdSchema = z.enum([
  'character-info',
  'attributes',
  'combat-stats',
  'level-class',
  'resource-counters',
  'inventory',
]);

const columnConfigSchema = z.object({
  width: responsiveStringSchema,
  label: z.string().optional(),
});

const layoutComponentItemSchema = z.object({
  componentId: componentIdSchema,
  column: z.number(),
  minH: z.union([responsiveStringSchema, responsiveNumberSchema]).optional(),
  display: z.union([
    z.enum(['none', 'flex']),
    z.object({
      base: z.enum(['none', 'flex']).optional(),
      sm: z.enum(['none', 'flex']).optional(),
      md: z.enum(['none', 'flex']).optional(),
      lg: z.enum(['none', 'flex']).optional(),
      xl: z.enum(['none', 'flex']).optional(),
      '2xl': z.enum(['none', 'flex']).optional(),
    })
  ]).optional(),
  className: z.string().optional(),
});

export const layoutConfigSchema = z.object({
  version: z.string(),
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(columnConfigSchema),
  columnGap: z.union([responsiveStringSchema, responsiveNumberSchema]).optional(),
  itemGap: z.union([responsiveStringSchema, responsiveNumberSchema]).optional(),
  items: z.array(layoutComponentItemSchema),
  container: z.object({
    maxW: responsiveStringSchema.optional(),
    px: z.union([responsiveStringSchema, responsiveNumberSchema]).optional(),
    py: z.union([responsiveStringSchema, responsiveNumberSchema]).optional(),
  }).optional(),
});

export type LayoutConfigSchema = z.infer<typeof layoutConfigSchema>;
