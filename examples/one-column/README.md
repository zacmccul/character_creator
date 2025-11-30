# Single Column Layout Example

This example demonstrates a simple, vertical single-column layout ideal for mobile devices or narrow displays.

## How the Layout System Works

The character creator uses a **config-driven layout system** that allows you to reorganize components without modifying code. Layouts are defined in JSON files that specify:

- **Columns**: Define the grid structure with responsive widths
- **Items**: Place components in columns with vertical stacking
- **Gaps**: Control spacing between columns and items
- **Container**: Set maximum width and padding

### Key Concepts

1. **Column-based**: The layout divides the screen into vertical columns (0-indexed)
2. **Responsive widths**: Use responsive objects like `{ "base": "1fr", "lg": "400px" }` for breakpoint-specific sizing
3. **Component mapping**: Each item references a `componentId` that maps to a React component
4. **Vertical stacking**: Items in the same column stack vertically with configurable gaps

## This Example

The `layout.json` file in this directory creates a single-column layout with:

```json
{
  "columns": [{ "width": { "base": "1fr" } }],
  "columnGap": 0,
  "itemGap": 4,
  "items": [
    { "componentId": "character-info", "column": 0 },
    { "componentId": "attributes", "column": 0 },
    { "componentId": "combat-stats", "column": 0 },
    { "componentId": "level-class", "column": 0 },
    { "componentId": "inventory", "column": 0 },
    { "componentId": "resource-counters", "column": 0 }
  ]
}
```

### Features

- **Single column**: All components stack vertically in one column
- **Mobile-friendly**: Optimized for narrow screens with `maxW: "container.md"`
- **Consistent spacing**: 4-unit gap between items (`itemGap: 4`)
- **Responsive padding**: Adjusts padding based on screen size

### Available Components

All standard components can be placed in any order:
- `character-info` - Name, species, experiences
- `attributes` - The 5 core attributes
- `combat-stats` - HP, MP, Attack/Spell Power, etc.
- `level-class` - Level and class selection
- `inventory` - Equipment and consumable slots
- `resource-counters` - Custom resource trackers

## Customization

To modify this layout:

1. Change component order by reordering items in the `items` array
2. Adjust spacing with `itemGap` (in Chakra spacing units)
3. Set minimum heights with `minH` on individual items
4. Modify container width with `container.maxW`

## Comparison to Default Layout

Unlike the default two-column layout which places attributes in a left sidebar, this layout:
- Uses only one column for all components
- Stacks everything vertically for better mobile experience
- Has narrower max width (`container.md` vs `container.xl`)
- Removes column gap (since there's only one column)

See `/docs/LAYOUT_SYSTEM.md` for complete layout documentation.