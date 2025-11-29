# Config-Driven Layout System - Implementation Summary

## Overview

Successfully implemented a comprehensive config-driven layout system for the character sheet that uses Chakra UI v3's SimpleGrid component. The layout of all components can now be controlled entirely through JSON configuration files.

## What Was Built

### 1. Type System (`src/types/layout-config.types.ts`)

**Core Types:**
- `ComponentId` - Type-safe component identifiers
- `ResponsiveValue<T>` - Support for Chakra's responsive breakpoints
- `LayoutGridItem` - Configuration for individual grid items
- `LayoutConfig` - Complete layout configuration structure

**Features:**
- Full TypeScript typing for all layout properties
- Responsive value support for all grid properties
- Comprehensive Zod schemas for runtime validation
- Support for colSpan, rowSpan, colStart/End, rowStart/End
- Display control and z-index stacking

### 2. Schema Validation (`src/schemas/layout-config.schema.ts`)

- OpenAPI schema generation for documentation
- Runtime validation using Zod
- Helpful error messages for invalid configurations
- Example configurations in schema

### 3. ConfigurableLayout Component (`src/components/ConfigurableLayout.tsx`)

**Main Component:**
- Loads layout config from `/public/config/layout.json`
- Validates config against Zod schema
- Maps component IDs to React components
- Renders SimpleGrid with GridItems
- Error handling and loading states

**Component Map:**
```typescript
{
  'character-info': CharacterInfo,
  'attributes': AttributesSection,
  'combat-stats': CombatStatsSection,
  'level-class': LevelClassSection,
  'resource-counters': ResourceCounters,
  'inventory': InventorySection,
}
```

**Export Hook:**
- `useLayoutConfig()` - Access layout config from any component

### 4. Configuration Files

**Default Layout** (`public/config/layout.json`):
- Two-column responsive layout
- Attributes sidebar on left (large screens)
- Main content on right
- Collapses to single column on mobile

**Example Layouts** (`public/config/layouts/`):
- `three-column.json` - Three-column wide screen layout
- `mobile-compact.json` - Single column for mobile
- `combat-focused.json` - Combat stats emphasized
- `dashboard-grid.json` - Auto-fit grid layout

### 5. Integration with App.tsx

Replaced hardcoded Grid layout with:
```tsx
<ConfigurableLayout onError={(error) => console.error('Layout error:', error)} />
```

Removed direct component imports in favor of dynamic loading through the layout system.

### 6. Documentation

**Comprehensive Docs:**
- `LAYOUT_SYSTEM.md` - Full system documentation
- `LAYOUT_QUICK_REFERENCE.md` - Quick examples and patterns

**Covers:**
- Configuration structure and properties
- Common layout patterns
- Responsive design patterns
- Adding new components
- Troubleshooting guide
- Best practices

## Key Features

### 1. Built on Chakra UI v3 SimpleGrid

Uses native Chakra components:
- `SimpleGrid` for the main grid container
- `GridItem` for positioned components
- All standard SimpleGrid props supported

### 2. Full Responsive Support

Every property can be responsive:
```json
{
  "columns": { "base": 1, "md": 2, "lg": 3 },
  "gap": { "base": 4, "md": 6 },
  "colSpan": { "base": 1, "lg": 2 }
}
```

### 3. Flexible Positioning

Multiple ways to position components:
- **Simple columns**: Just set number of columns
- **Auto-fit**: Use `minChildWidth` for automatic columns
- **Explicit sizing**: Use `templateColumns` for precise control
- **Spanning**: Use `colSpan` and `rowSpan`
- **Exact positioning**: Use `colStart`/`colEnd`, `rowStart`/`rowEnd`

### 4. Runtime Validation

- Zod schemas validate all configuration
- Clear error messages for invalid config
- Type-safe with TypeScript
- Fails gracefully with error display

### 5. Easy to Extend

**Add a new component:**
1. Add component ID to type union
2. Add to componentMap
3. Update Zod schema enum
4. Use in layout config

## Usage Examples

### Basic Two-Column Layout
```json
{
  "grid": {
    "templateColumns": { "base": "1fr", "lg": "400px 1fr" },
    "gap": 6
  },
  "items": [
    { "componentId": "attributes", "colStart": { "base": 1, "lg": 1 } },
    { "componentId": "character-info", "colStart": { "base": 1, "lg": 2 } }
  ]
}
```

### Three-Column Grid
```json
{
  "grid": {
    "columns": { "base": 1, "md": 2, "xl": 3 },
    "gap": 6
  },
  "items": [
    { "componentId": "attributes" },
    { "componentId": "combat-stats" },
    { "componentId": "level-class" }
  ]
}
```

### Auto-Fit Layout
```json
{
  "grid": {
    "minChildWidth": "300px",
    "gap": 6
  },
  "items": [
    { "componentId": "attributes" },
    { "componentId": "combat-stats" }
  ]
}
```

## How It Works

1. **App.tsx** renders `<ConfigurableLayout />`
2. **ConfigurableLayout** loads `/config/layout.json`
3. Config is **validated** against Zod schema
4. **SimpleGrid** is rendered with grid properties
5. For each item, **GridItem** wraps the component
6. Components are **mapped** from componentId to React component
7. All props are **passed through** to Chakra components

## Benefits

### For Developers
- No code changes needed to adjust layout
- Type-safe configuration
- Clear separation of layout from logic
- Easy to test different layouts
- Multiple layout presets possible

### For Users (Future)
- Could enable user-customizable layouts
- Layout preferences could be saved
- Different layouts for different use cases
- Accessibility: adjust for preferences

### For Project
- Maintains clean separation of concerns
- Follows configuration-driven architecture
- Consistent with attribute and combat config systems
- Well-documented and extensible

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                       │
│  ┌───────────────────────────────────────────┐ │
│  │      <ConfigurableLayout />               │ │
│  └───────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │
                   ├─ Loads /config/layout.json
                   │
                   ├─ Validates with Zod schema
                   │
                   ├─ Renders <SimpleGrid {...gridProps}>
                   │
                   └─ For each item:
                      ├─ Map componentId → Component
                      └─ Render <GridItem {...itemProps}>
                             <Component />
                          </GridItem>

┌─────────────────────────────────────────────────┐
│            Component Mapping                    │
├─────────────────────────────────────────────────┤
│ 'character-info' → CharacterInfo                │
│ 'attributes' → AttributesSection                │
│ 'combat-stats' → CombatStatsSection             │
│ 'level-class' → LevelClassSection               │
│ 'resource-counters' → ResourceCounters          │
│ 'inventory' → InventorySection                  │
└─────────────────────────────────────────────────┘
```

## Configuration Flow

```
layout.json
    ↓
Load & Parse
    ↓
Zod Validation
    ↓
TypeScript Types
    ↓
ConfigurableLayout
    ↓
SimpleGrid + GridItems
    ↓
Rendered Components
```

## Future Enhancements

Possible additions:
- **Layout Selector UI** - Choose from preset layouts
- **Visual Editor** - Drag-and-drop layout builder
- **User Preferences** - Save layout per user
- **Layout Templates** - Community-shared layouts
- **Animation** - Smooth transitions between layouts
- **Debugging Mode** - Visual grid overlay
- **Layout Analytics** - Track popular layouts

## Testing Recommendations

1. **Test All Breakpoints**
   - Resize browser window
   - Test on mobile, tablet, desktop
   - Check all responsive values work

2. **Test Component Spanning**
   - Verify colSpan works correctly
   - Test rowSpan positioning
   - Check overlapping doesn't occur

3. **Test Validation**
   - Try invalid component IDs
   - Test missing required fields
   - Verify error messages are clear

4. **Test Edge Cases**
   - Single component
   - Many components
   - Large colSpan values
   - Hidden components

## File Structure

```
src/
├── components/
│   └── ConfigurableLayout.tsx     # Main layout component
├── types/
│   └── layout-config.types.ts      # TypeScript types
└── schemas/
    └── layout-config.schema.ts     # Zod validation

public/
└── config/
    ├── layout.json                 # Active layout
    └── layouts/                    # Example layouts
        ├── three-column.json
        ├── mobile-compact.json
        ├── combat-focused.json
        └── dashboard-grid.json

docs/
├── LAYOUT_SYSTEM.md               # Full documentation
└── LAYOUT_QUICK_REFERENCE.md      # Quick reference guide
```

## Summary

The config-driven layout system is a powerful and flexible way to manage component positioning using Chakra UI v3's SimpleGrid. It provides:

✅ **Full type safety** with TypeScript  
✅ **Runtime validation** with Zod  
✅ **Responsive design** support  
✅ **Easy to use** JSON configuration  
✅ **Well documented** with examples  
✅ **Extensible** for new components  
✅ **Production ready** with error handling  

The system seamlessly integrates with the existing configuration-driven architecture and provides a solid foundation for future layout customization features.
