# Config-Driven Layout System

## Quick Demo

Change your character sheet layout by editing a single JSON file!

### Try It Now

1. **Open** `public/config/layout.json`
2. **Change** a value (e.g., change `"gap": 6` to `"gap": 8`)
3. **Save** the file
4. **Refresh** your browser
5. **See** the layout update instantly!

### Switch to Three-Column Layout

Replace the contents of `public/config/layout.json` with:

```json
{
  "version": "1.0.0",
  "name": "Three-Column Wide Screen Layout",
  "grid": {
    "columns": { "base": 1, "md": 2, "xl": 3 },
    "gap": 6
  },
  "items": [
    { "componentId": "character-info", "colSpan": { "base": 1, "md": 2, "xl": 3 } },
    { "componentId": "attributes", "colSpan": 1 },
    { "componentId": "combat-stats", "colSpan": 1 },
    { "componentId": "level-class", "colSpan": 1 },
    { "componentId": "resource-counters", "colSpan": 1 },
    { "componentId": "inventory", "colSpan": { "base": 1, "md": 1, "xl": 2 } }
  ]
}
```

## What's This?

This project features a **config-driven layout system** built on Chakra UI v3's SimpleGrid component. It allows you to:

- 📐 **Control layout** through JSON configuration
- 📱 **Responsive design** with breakpoint support
- 🎨 **Multiple layouts** without code changes
- ✅ **Type-safe** with TypeScript
- 🔒 **Validated** at runtime with Zod

## How It Works

```
┌──────────────────┐
│  layout.json     │  ← You edit this
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  ConfigurableLayout  │  ← Reads & validates config
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  SimpleGrid      │  ← Renders components
└──────────────────┘
```

## Core Concepts

### 1. Components Have IDs

```json
{
  "componentId": "attributes"
}
```

Available IDs:
- `character-info` - Name, species, experiences
- `attributes` - STR, DEX, INT, WIS, CHA
- `combat-stats` - HP, MP, attack power
- `level-class` - Class and levels
- `resource-counters` - Custom counters
- `inventory` - Equipment slots

### 2. Grid Controls Layout

```json
{
  "grid": {
    "columns": 2,
    "gap": 6
  }
}
```

Properties:
- `columns` - Number of columns
- `gap` - Space between items
- `templateColumns` - Explicit column sizes
- `minChildWidth` - Auto-fit columns

### 3. Items Control Position

```json
{
  "componentId": "attributes",
  "colSpan": 2,
  "rowSpan": 1
}
```

Properties:
- `colSpan` - Columns to span
- `rowSpan` - Rows to span
- `colStart/colEnd` - Explicit positioning
- `display` - Show/hide at breakpoints

### 4. Responsive by Default

```json
{
  "columns": {
    "base": 1,    // Mobile
    "md": 2,      // Tablet
    "lg": 3       // Desktop
  }
}
```

## Common Patterns

### Two-Column Sidebar
```json
{
  "grid": {
    "templateColumns": { "base": "1fr", "lg": "400px 1fr" }
  }
}
```

### Three Equal Columns
```json
{
  "grid": {
    "columns": 3,
    "gap": 6
  }
}
```

### Auto-Fit Grid
```json
{
  "grid": {
    "minChildWidth": "300px",
    "gap": 6
  }
}
```

### Spanning Components
```json
{
  "componentId": "character-info",
  "colSpan": 3  // Takes up 3 columns
}
```

## Documentation

- **[Full Guide](./LAYOUT_SYSTEM.md)** - Complete documentation
- **[Quick Reference](./LAYOUT_QUICK_REFERENCE.md)** - Common patterns
- **[Implementation Summary](./LAYOUT_IMPLEMENTATION_SUMMARY.md)** - Technical details

## Example Layouts

Pre-made layouts in `public/config/layouts/`:

### Default (Current)
Traditional two-column with sidebar

### Three-Column Wide (`three-column.json`)
Three columns on large screens

### Mobile Compact (`mobile-compact.json`)
Single column, compact spacing

### Combat-Focused (`combat-focused.json`)
Combat stats prominently displayed

### Dashboard Grid (`dashboard-grid.json`)
Auto-fit card-based layout

**Try them:**
```bash
# Linux/Mac
cp public/config/layouts/three-column.json public/config/layout.json

# Windows PowerShell
Copy-Item public\config\layouts\three-column.json public\config\layout.json
```

## Adding Your Own Component

1. **Create the component** (e.g., `NotesSection.tsx`)

2. **Add ID to types** (`layout-config.types.ts`):
```typescript
export type ComponentId =
  | 'character-info'
  | 'attributes'
  | 'notes';  // ← Add here
```

3. **Add to component map** (`ConfigurableLayout.tsx`):
```typescript
const componentMap: Record<ComponentId, React.ComponentType> = {
  'character-info': CharacterInfo,
  'attributes': AttributesSection,
  'notes': NotesSection,  // ← Add here
};
```

4. **Update schema enum** (`layout-config.types.ts`):
```typescript
const componentIdSchema = z.enum([
  'character-info',
  'attributes',
  'notes',  // ← Add here
]);
```

5. **Use in layout**:
```json
{
  "componentId": "notes",
  "colSpan": 2
}
```

## Tips

✅ **Always define `base` first** in responsive values  
✅ **Use standard spacing** (4, 6, 8) for consistency  
✅ **Test at all breakpoints** when making changes  
✅ **Check console** for validation errors  
✅ **Start simple** then add complexity  

## Technical Stack

- **Chakra UI v3** - SimpleGrid & GridItem components
- **TypeScript** - Full type safety
- **Zod** - Runtime validation
- **React** - Component rendering
- **JSON** - Configuration format

## Benefits

### For Developers
- No code changes to adjust layout
- Type-safe configuration
- Clear error messages
- Easy to test layouts

### For Users (Future)
- Customizable layouts
- Saved preferences
- Accessibility options
- Multiple presets

### For Project
- Separation of concerns
- Consistent architecture
- Well-documented
- Extensible

## See It In Action

1. Open the character sheet in your browser
2. Open DevTools (F12)
3. Inspect the SimpleGrid component
4. See how grid properties map to CSS
5. Resize window to see responsive behavior

## Getting Help

- 📖 Read [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) for complete docs
- 🚀 Check [LAYOUT_QUICK_REFERENCE.md](./LAYOUT_QUICK_REFERENCE.md) for examples
- 🔧 See [LAYOUT_IMPLEMENTATION_SUMMARY.md](./LAYOUT_IMPLEMENTATION_SUMMARY.md) for internals
- 💬 Ask in project discussions

## Summary

The config-driven layout system provides a powerful, flexible way to control component positioning using a simple JSON configuration file. It's built on Chakra UI v3's SimpleGrid, fully type-safe, runtime-validated, and ready for production use.

**Change your layout in seconds, not hours!** 🚀
