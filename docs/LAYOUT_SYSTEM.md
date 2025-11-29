# Config-Driven Layout System

This document explains the config-driven layout system for positioning and sizing components in the character sheet interface.

## Overview

The layout system uses **Chakra UI v3's SimpleGrid** to create flexible, responsive layouts controlled entirely by a JSON configuration file. This allows you to:

- Reorganize components without touching code
- Create multiple layout presets
- Adapt layouts for different screen sizes
- Control component positioning, spanning, and sizing

## Architecture

### Components

1. **ConfigurableLayout** (`src/components/ConfigurableLayout.tsx`)
   - Main component that reads layout config and renders the grid
   - Handles loading, validation, and error states
   - Maps component IDs to actual React components

2. **Layout Configuration** (`public/config/layout.json`)
   - JSON file defining the grid structure and component placement
   - Validated against Zod schema at runtime

3. **Type Definitions** (`src/types/layout-config.types.ts`)
   - TypeScript types for layout configuration
   - Zod schemas for runtime validation

## Configuration Structure

### Basic Layout Config

```json
{
  "version": "1.0.0",
  "name": "My Layout",
  "description": "Optional description",
  "grid": {
    "gap": 6,
    "templateColumns": {
      "base": "1fr",
      "lg": "400px 1fr"
    }
  },
  "items": [
    {
      "componentId": "attributes",
      "colSpan": { "base": 1, "lg": 1 }
    }
  ],
  "container": {
    "maxW": "container.xl",
    "px": 4,
    "py": { "base": 6, "sm": 8 }
  }
}
```

### Grid Properties

The `grid` object supports all Chakra UI SimpleGrid properties:

#### Core Properties

- **`columns`** (number | responsive): Number of columns in the grid
  ```json
  "columns": { "base": 1, "md": 2, "lg": 3 }
  ```

- **`minChildWidth`** (string | responsive): Minimum width for auto-fit columns
  ```json
  "minChildWidth": { "base": "200px", "md": "300px" }
  ```

- **`gap`** (string/number | responsive): Spacing between items
  ```json
  "gap": 6
  // or
  "gap": { "base": 4, "md": 6 }
  ```

#### Advanced Properties

- **`columnGap`** / **`rowGap`**: Separate control for column and row spacing
  ```json
  "columnGap": 4,
  "rowGap": 6
  ```

- **`templateColumns`** / **`templateRows`**: Explicit grid track sizes
  ```json
  "templateColumns": "200px 1fr 1fr",
  "templateRows": "auto 1fr auto"
  ```

- **`autoFlow`**: How items flow into the grid
  - Values: `"row"`, `"column"`, `"dense"`, `"row dense"`, `"column dense"`
  ```json
  "autoFlow": "dense"
  ```

- **`autoColumns`** / **`autoRows`**: Size of auto-generated tracks
  ```json
  "autoColumns": "minmax(100px, 1fr)",
  "autoRows": "auto"
  ```

### Grid Item Properties

Each item in the `items` array can have:

#### Positioning

- **`colSpan`**: Number of columns to span
- **`colStart`** / **`colEnd`**: Explicit column position (1-indexed)
- **`rowSpan`**: Number of rows to span
- **`rowStart`** / **`rowEnd`**: Explicit row position (1-indexed)

Example:
```json
{
  "componentId": "attributes",
  "colSpan": { "base": 1, "lg": 2 },
  "rowSpan": 1,
  "colStart": 1
}
```

#### Display Control

- **`display`**: Show/hide at different breakpoints
  ```json
  "display": { "base": "none", "md": "block" }
  ```

- **`zIndex`**: Stacking order
  ```json
  "zIndex": 10
  ```

- **`className`**: Custom CSS class for additional styling

### Component IDs

Available component IDs (must match exactly):

- `"character-info"` - Character name, species, experiences
- `"attributes"` - The 5 main attributes (STR, DEX, etc.)
- `"combat-stats"` - HP, MP, movement, attack/spell power
- `"level-class"` - Class selection and level management
- `"resource-counters"` - Custom resource trackers
- `"inventory"` - Equipment and consumable slots

### Responsive Values

Most properties support responsive values using Chakra's breakpoint system:

- `base` - Base size (all screens)
- `sm` - ≥ 640px
- `md` - ≥ 768px
- `lg` - ≥ 1024px
- `xl` - ≥ 1280px
- `2xl` - ≥ 1536px

Example:
```json
{
  "gap": { "base": 4, "md": 6, "lg": 8 },
  "columns": { "base": 1, "md": 2, "xl": 3 }
}
```

## Common Layout Patterns

### Two-Column Layout (Default)

Left sidebar with content on the right:

```json
{
  "grid": {
    "gap": 6,
    "templateColumns": {
      "base": "1fr",
      "lg": "400px 1fr"
    }
  },
  "items": [
    {
      "componentId": "attributes",
      "colStart": { "base": 1, "lg": 1 }
    },
    {
      "componentId": "character-info",
      "colStart": { "base": 1, "lg": 2 }
    }
  ]
}
```

### Three-Column Layout

Wide screens get three columns:

```json
{
  "grid": {
    "columns": { "base": 1, "md": 2, "xl": 3 },
    "gap": 6
  },
  "items": [
    {
      "componentId": "attributes",
      "colSpan": { "base": 1, "md": 2, "xl": 1 }
    },
    {
      "componentId": "character-info",
      "colSpan": 1
    },
    {
      "componentId": "combat-stats",
      "colSpan": 1
    }
  ]
}
```

### Auto-fit Layout

Let the grid automatically fit items:

```json
{
  "grid": {
    "minChildWidth": { "base": "300px", "md": "400px" },
    "gap": 6
  },
  "items": [
    { "componentId": "character-info" },
    { "componentId": "attributes" },
    { "componentId": "combat-stats" }
  ]
}
```

### Spanning Layout

Components that span multiple columns/rows:

```json
{
  "grid": {
    "columns": 3,
    "gap": 4
  },
  "items": [
    {
      "componentId": "character-info",
      "colSpan": 3
    },
    {
      "componentId": "attributes",
      "colSpan": 1,
      "rowSpan": 2
    },
    {
      "componentId": "combat-stats",
      "colSpan": 2
    },
    {
      "componentId": "inventory",
      "colSpan": 2
    }
  ]
}
```

## Usage in Components

### Using ConfigurableLayout

In `App.tsx`:

```tsx
import { ConfigurableLayout } from '@/components/ConfigurableLayout';

function App() {
  return (
    <Container maxW="container.xl" px={4} py={8}>
      <ConfigurableLayout 
        onError={(error) => console.error('Layout error:', error)} 
      />
    </Container>
  );
}
```

### Using Custom Layout Config

Pass a config directly instead of loading from file:

```tsx
import { ConfigurableLayout } from '@/components/ConfigurableLayout';
import type { LayoutConfig } from '@/types/layout-config.types';

const customLayout: LayoutConfig = {
  version: "1.0.0",
  name: "Custom",
  grid: { columns: 2, gap: 4 },
  items: [
    { componentId: "attributes", colSpan: 1 },
    { componentId: "character-info", colSpan: 1 }
  ]
};

function App() {
  return <ConfigurableLayout config={customLayout} />;
}
```

### Using the Layout Hook

Access current layout configuration in any component:

```tsx
import { useLayoutConfig } from '@/components/ConfigurableLayout';

function MyComponent() {
  const { config, isLoading, error } = useLayoutConfig();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Current layout: {config?.name}</div>;
}
```

## Validation

The layout configuration is validated at runtime using Zod schemas. Common validation errors:

- **Invalid component ID**: Must be one of the allowed component IDs
- **Invalid responsive value**: Must follow Chakra's breakpoint structure
- **Missing required fields**: `version`, `name`, `grid`, and `items` are required
- **Type mismatches**: Values must match expected types (number, string, etc.)

Error messages will appear in the console and can be handled via the `onError` callback.

## Best Practices

1. **Start with Mobile**: Define `base` values first, then add breakpoints for larger screens

2. **Test Responsiveness**: Check your layout at all breakpoint sizes

3. **Use Semantic Spacing**: Stick to Chakra's spacing scale (4, 6, 8, etc.)

4. **Explicit Column Positions**: For complex layouts, use `colStart`/`colEnd` to avoid ambiguity

5. **Keep It Simple**: Start with basic properties before adding advanced grid features

6. **Version Your Layouts**: Increment version numbers when making breaking changes

7. **Document Custom Layouts**: Add meaningful `name` and `description` fields

## Adding New Components

To add a new component to the layout system:

1. **Update ComponentId type** in `layout-config.types.ts`:
   ```ts
   export type ComponentId =
     | 'character-info'
     | 'attributes'
     | 'my-new-component'; // Add here
   ```

2. **Add to componentMap** in `ConfigurableLayout.tsx`:
   ```tsx
   const componentMap: Record<ComponentId, React.ComponentType> = {
     'character-info': CharacterInfo,
     'attributes': AttributesSection,
     'my-new-component': MyNewComponent, // Add here
   };
   ```

3. **Update schema** in `layout-config.types.ts`:
   ```ts
   const componentIdSchema = z.enum([
     'character-info',
     'attributes',
     'my-new-component', // Add here
   ]);
   ```

## Troubleshooting

### Layout Not Loading

- Check browser console for errors
- Verify `layout.json` is in `/public/config/`
- Ensure JSON is valid (use a JSON validator)

### Components Not Appearing

- Verify component IDs match exactly (case-sensitive)
- Check if `display` property is hiding the component
- Ensure components span visible columns

### Responsive Issues

- Test at different screen sizes
- Check that responsive values use correct breakpoints
- Verify `colStart` positions work at all sizes

### Validation Errors

- Read the full error message in console
- Check that all required fields are present
- Ensure types match (numbers vs strings)
- Verify responsive objects use correct breakpoint keys

## Future Enhancements

Potential improvements to the layout system:

- Layout presets selector in UI
- Visual layout editor
- Layout templates library
- Per-user layout customization
- Saved layout preferences
- Layout animation/transitions
- Grid debugging overlay

## Related Documentation

- [Chakra UI SimpleGrid Documentation](https://chakra-ui.com/docs/components/simple-grid)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Configuration System](./CONFIGURATION_SYSTEM.md)
- [Attribute Configuration](./ATTRIBUTE_CONFIGURATION.md)
