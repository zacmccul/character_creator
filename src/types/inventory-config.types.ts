/**
 * Inventory Configuration Types
 * Defines structure for configurable inventory tabs and slot calculations
 */

/**
 * Inventory tab configuration
 * Each tab represents a category of items with:
 * - Dynamic slot count based on attribute formulas
 * - Reference to an enum for available items
 */
export interface InventoryTabConfig {
  readonly id: string; // Unique identifier (e.g., "equipment", "consumables")
  readonly label: string; // Display name
  readonly emoji: string; // Icon/emoji for the tab
  readonly description: string; // Tooltip description
  readonly itemEnumId: string; // Reference to enum ID in enums.json
  readonly slotFormula: string; // Math expression (e.g., "STR", "DEX * 2", "INT + WIS")
  readonly emptySlotMessage?: string; // Message when no slots available
}

/**
 * Complete inventory configuration
 */
export interface InventoryConfig {
  readonly title: string;
  readonly tabs: readonly InventoryTabConfig[];
}
