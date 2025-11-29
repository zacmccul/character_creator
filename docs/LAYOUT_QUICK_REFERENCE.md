# Layout System Quick Reference

Quick examples and recipes for common layout configurations.

## Quick Start

The layout system uses SimpleGrid from Chakra UI v3. Change `/public/config/layout.json` to update the layout.

### Minimal Example

```json
{
  "version": "1.0.0",
  "name": "Simple Layout",
  "grid": {
    "columns": 2,
    "gap": 6
  },
  "items": [
    { "componentId": "attributes" },
    { "componentId": "character-info" }
  ]
}
```

## Common Patterns

### 1. Two-Column Sidebar (Default)

**Use case**: Traditional layout with attributes sidebar

```json
{
  "grid": {
    "templateColumns": { "base": "1fr", "lg": "400px 1fr" },
    "gap": 6
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

**Visual**:
```
Mobile (< 1024px):        Desktop (≥ 1024px):
┌──────────────────┐      ┌─────────┬──────────────────┐
│   Attributes     │      │  Attr   │  Character Info  │
├──────────────────┤      │         ├──────────────────┤
│ Character Info   │      │         │  Combat Stats    │
└──────────────────┘      └─────────┴──────────────────┘
```

### 2. Three-Column Wide

**Use case**: Maximum info density on large screens

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
    { "componentId": "combat-stats" },
    { "componentId": "level-class" }
  ]
}
```

**Visual**:
```
Small: 1 column    Medium: 2 columns    XL: 3 columns
┌────────────┐     ┌───────┬───────┐    ┌─────┬─────┬─────┐
│   Attr     │     │ Attr  │ Combat│    │Attr │Cmbt │Lvl  │
└────────────┘     └───────┴───────┘    └─────┴─────┴─────┘
```

### 3. Auto-Fit Grid

**Use case**: Let the browser determine columns

```json
{
  "grid": {
    "minChildWidth": "300px",
    "gap": 6
  },
  "items": [
    { "componentId": "attributes" },
    { "componentId": "combat-stats" },
    { "componentId": "level-class" },
    { "componentId": "inventory" }
  ]
}
```

Automatically adjusts columns based on screen width!

### 4. Spanning Header

**Use case**: Full-width component at top

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
    { "componentId": "attributes" },
    { "componentId": "combat-stats" },
    { "componentId": "level-class" }
  ]
}
```

**Visual**:
```
┌─────────────────────────────┐
│    Character Info (3 col)   │
├─────────┬─────────┬─────────┤
│  Attr   │ Combat  │  Level  │
└─────────┴─────────┴─────────┘
```

### 5. Asymmetric Layout

**Use case**: Different component sizes

```json
{
  "grid": {
    "templateColumns": "300px 1fr 400px",
    "gap": 6
  },
  "items": [
    { "componentId": "attributes" },
    {
      "componentId": "character-info",
      "rowSpan": 2
    },
    { "componentId": "combat-stats" },
    { "componentId": "level-class" }
  ]
}
```

**Visual**:
```
┌───────┬─────────────┬──────────┐
│ Attr  │             │ Combat   │
├───────┤ Char Info   ├──────────┤
│ Level │             │ Inv      │
└───────┴─────────────┴──────────┘
```

## Properties Cheat Sheet

### Grid Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `columns` | number/responsive | `3` or `{ base: 1, md: 2 }` | Number of columns |
| `minChildWidth` | string/responsive | `"300px"` | Auto-fit column width |
| `gap` | number/string | `6` or `"24px"` | Space between items |
| `columnGap` | number/string | `4` | Horizontal spacing |
| `rowGap` | number/string | `6` | Vertical spacing |
| `templateColumns` | string | `"200px 1fr 1fr"` | Explicit column sizes |
| `templateRows` | string | `"auto 1fr"` | Explicit row sizes |
| `autoFlow` | string | `"dense"` | Item flow algorithm |

### Item Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `colSpan` | number/responsive | `2` or `{ base: 1, lg: 2 }` | Columns to span |
| `colStart` | number/responsive | `2` | Starting column |
| `colEnd` | number/responsive | `4` | Ending column |
| `rowSpan` | number/responsive | `2` | Rows to span |
| `rowStart` | number/responsive | `1` | Starting row |
| `rowEnd` | number/responsive | `3` | Ending row |
| `display` | string/responsive | `{ base: "none", md: "block" }` | Visibility |
| `zIndex` | number | `10` | Stacking order |

### Responsive Breakpoints

| Breakpoint | Screen Width | Example |
|------------|--------------|---------|
| `base` | All sizes | Default value |
| `sm` | ≥ 640px | Phones (landscape) |
| `md` | ≥ 768px | Tablets |
| `lg` | ≥ 1024px | Laptops |
| `xl` | ≥ 1280px | Desktops |
| `2xl` | ≥ 1536px | Large screens |

## Component IDs

```json
"character-info"      // Name, species, experiences
"attributes"          // STR, DEX, INT, WIS, CHA
"combat-stats"        // HP, MP, movement, attack/spell power
"level-class"         // Class and level management
"resource-counters"   // Custom resource trackers
"inventory"           // Equipment and consumable slots
```

## Common Spacing Values

Use Chakra's spacing scale (based on 4px):

```json
"gap": 2   // 8px
"gap": 4   // 16px
"gap": 6   // 24px (recommended)
"gap": 8   // 32px
"gap": 10  // 40px
```

Or use explicit values:
```json
"gap": "1rem"
"gap": "24px"
```

## Tips & Tricks

### 1. Mobile-First Design

Always define `base` first:
```json
{
  "columns": {
    "base": 1,      // ← Start here
    "md": 2,
    "lg": 3
  }
}
```

### 2. Hide Components

Hide on mobile, show on desktop:
```json
{
  "componentId": "inventory",
  "display": { "base": "none", "lg": "block" }
}
```

### 3. Explicit Positioning

Use `colStart` for precise control:
```json
{
  "componentId": "attributes",
  "colStart": 1,
  "colEnd": 2,
  "rowStart": 1,
  "rowEnd": 3
}
```

### 4. Equal Spacing

For even spacing, just use `columns` and `gap`:
```json
{
  "grid": {
    "columns": 3,
    "gap": 6
  }
}
```

### 5. Dense Packing

Fill empty spaces automatically:
```json
{
  "grid": {
    "autoFlow": "dense"
  }
}
```

## Testing Your Layout

1. **Save** your `layout.json` file
2. **Refresh** the browser
3. **Resize** window to test breakpoints
4. Check **browser console** for errors

## Need Help?

- See [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) for full documentation
- Check example layouts in `/public/config/layouts/`
- Review Chakra UI [SimpleGrid docs](https://chakra-ui.com)

## Example Layouts

Try these pre-made layouts:

### Default (Two-Column)
```bash
cp public/config/layouts/default.json public/config/layout.json
```

### Three-Column Wide
```bash
cp public/config/layouts/three-column.json public/config/layout.json
```

### Mobile Compact
```bash
cp public/config/layouts/mobile-compact.json public/config/layout.json
```

### Combat-Focused
```bash
cp public/config/layouts/combat-focused.json public/config/layout.json
```

### Dashboard Grid
```bash
cp public/config/layouts/dashboard-grid.json public/config/layout.json
```
