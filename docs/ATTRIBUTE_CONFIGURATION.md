# Attribute Configuration System

## Overview

The Attributes section is now configuration-driven using a JSON configuration file. This allows for flexible attribute definitions without modifying component code.

## Configuration File

Location: `public/config/attributes.json`

### Structure

```json
{
  "title": "🎲 Attributes",
  "attributes": [
    {
      "id": "STR",
      "label": "Strength",
      "description": "Physical power. Determines equipment slots.",
      "emoji": "💪",
      "color": "red",
      "schema": {
        "type": "integer",
        "minimum": 0,
        "maximum": 4,
        "default": 0
      }
    }
  ]
}
```

### Schema Properties

#### Root Configuration
- `title` (string, required): The section title displayed in the UI
- `attributes` (array, required): Array of attribute definitions

#### Attribute Definition
- `id` (string, required): Unique identifier for the attribute (e.g., "STR", "DEX")
  - Used to reference the attribute in the character data
  - Must be unique across all attributes
- `label` (string, required): Human-readable display name (e.g., "Strength")
- `description` (string, required): Tooltip description explaining the attribute
- `emoji` (string, optional): Emoji icon to display with the attribute
- `color` (string, optional): Chakra UI color scheme (e.g., "red", "blue", "green")

#### Numeric Schema (OpenAPI 3.0 Style)
The `schema` property defines validation rules using OpenAPI 3.0 numeric constraints:

- `type` (required): Either "integer" or "number"
- `minimum` (optional): Inclusive minimum value
- `maximum` (optional): Inclusive maximum value
- `exclusiveMinimum` (optional): Exclusive minimum value (value must be greater than this)
- `exclusiveMaximum` (optional): Exclusive maximum value (value must be less than this)
- `multipleOf` (optional): Value must be a multiple of this number
- `default` (optional): Default value when creating new characters

**Note:** You can use either `minimum`/`maximum` (inclusive) or `exclusiveMinimum`/`exclusiveMaximum` (exclusive), but not both for the same bound.

### Examples

#### Basic Integer Attribute (0-4 range)
```json
{
  "id": "STR",
  "label": "Strength",
  "description": "Physical power",
  "schema": {
    "type": "integer",
    "minimum": 0,
    "maximum": 4,
    "default": 0
  }
}
```

#### Floating Point Attribute with Exclusive Bounds
```json
{
  "id": "SPEED",
  "label": "Speed",
  "description": "Movement speed multiplier",
  "schema": {
    "type": "number",
    "exclusiveMinimum": 0.0,
    "maximum": 10.0,
    "default": 1.0
  }
}
```

#### Attribute with Step Constraint
```json
{
  "id": "GOLD",
  "label": "Gold",
  "description": "Currency in denominations of 5",
  "schema": {
    "type": "integer",
    "minimum": 0,
    "multipleOf": 5,
    "default": 0
  }
}
```

## Using Attribute References

Other components can reference attributes by their ID using the provided utility functions.

### Available Utilities

```typescript
import {
  getAttributeById,
  getAttributeIds,
  getAttributeValue,
  evaluateAttributeFormula,
  validateAttributeValue,
  getAttributeBounds,
} from '@/utils/config-loader';
```

#### Get Attribute Value from Character
```typescript
const character = useCharacterStore((state) => state.character);
const strValue = getAttributeValue(character, 'STR'); // Returns the STR attribute value
```

#### Validate User Input
```typescript
const config = await loadAttributesConfig();
const strConfig = getAttributeById(config, 'STR');

if (strConfig && validateAttributeValue(strConfig, userInput)) {
  // Value is valid
}
```

#### Get Min/Max for Input Fields
```typescript
const strConfig = getAttributeById(config, 'STR');
const bounds = getAttributeBounds(strConfig);
// bounds = { min: 0, max: 4 }

<Input min={bounds.min} max={bounds.max} />
```

### Future: Formula Support

The configuration system includes an `AttributeReference` type with optional formula support:

```typescript
interface AttributeReference {
  attributeId: string;
  formula?: string; // e.g., "STR * 2" or "DEX + INT"
}
```

This allows future components to define relationships like:
- Equipment slots = STR
- Max HP = (STR + CON) * 5
- Spell Save DC = 8 + INT + proficiency

The `evaluateAttributeFormula()` utility is provided but currently only supports simple attribute references. Complex formula evaluation will be added in future updates.

## Example: Referencing Attributes in Other Components

When creating a component that needs to reference attribute values:

```typescript
// In a future inventory component config:
{
  "maxSlots": {
    "attributeId": "STR",
    "formula": "STR"  // Future: could be "STR * 2 + 1"
  }
}
```

## Validation

The configuration is validated using Zod schemas at runtime:
- All attribute IDs must be unique
- Schema constraints must be valid (min ≤ max)
- Required fields must be present
- Types must be correct

Invalid configurations will show an error in the UI with details about what's wrong.

## Testing

Comprehensive tests are available in `src/test/attribute-config.test.ts` covering:
- Schema validation
- Attribute lookup by ID
- Value validation against constraints
- Bounds calculation
- Default value handling
- Formula evaluation (basic)

Run tests with:
```bash
pnpm test attribute-config
```

## Migration Notes

The existing `AttributesSection` component has been refactored to:
1. Load configuration from JSON on mount
2. Use configuration to render attributes dynamically
3. Validate input against schema constraints
4. Display loading and error states

The character data structure remains unchanged - this is purely a UI configuration enhancement.
