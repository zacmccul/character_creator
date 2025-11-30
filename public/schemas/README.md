# JSON Schema Files

This directory contains JSON Schema files that define the structure and validation rules for all configuration files used in the character creator system.

## Available Schemas

### Core Configuration Schemas

1. **`attributes.schema.json`** - Defines ability scores/attributes
   - Used by: `public/config/attributes.json`
   - Defines numeric attributes with min/max constraints
   - Example: STR, DEX, INT, etc.

2. **`enums.schema.json`** - Defines dropdown/enum options
   - Used by: `public/config/enums.json`
   - Defines reusable lists of values for dropdowns
   - Example: species, classes, item lists

3. **`character-info.schema.json`** - Defines character information fields
   - Used by: `public/config/character-info.json`
   - Supports text and enum field types
   - Example: name, background, personality traits

4. **`combat-stats.schema.json`** - Defines combat statistics
   - Used by: `public/config/combat-stats.json`
   - Only supports numeric types (integer or number)
   - Example: HP, AC, initiative

5. **`inventory.schema.json`** - Defines inventory tabs and slots
   - Used by: `public/config/inventory.json`
   - Supports formula-based slot calculation
   - Example: equipment, consumables

6. **`level-class.schema.json`** - Defines class/level system
   - Used by: `public/config/level-class.json`
   - Supports multiclassing
   - Example: Fighter level 5, Wizard level 3

7. **`layout.schema.json`** - Defines UI layout and component arrangement
   - Used by: `public/config/layout.json`
   - Controls column-based responsive layouts
   - Example: two-column, three-column layouts

## Using Schemas in VS Code

To enable automatic validation and IntelliSense in VS Code, add a `$schema` property to your JSON files:

```json
{
  "$schema": "../schemas/attributes.schema.json",
  "title": "⚔️ Ability Scores",
  "attributes": [
    ...
  ]
}
```

Or configure in `.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["**/config/attributes.json"],
      "url": "./public/schemas/attributes.schema.json"
    },
    {
      "fileMatch": ["**/config/enums.json"],
      "url": "./public/schemas/enums.schema.json"
    },
    {
      "fileMatch": ["**/config/character-info.json"],
      "url": "./public/schemas/character-info.schema.json"
    },
    {
      "fileMatch": ["**/config/combat-stats.json"],
      "url": "./public/schemas/combat-stats.schema.json"
    },
    {
      "fileMatch": ["**/config/inventory.json"],
      "url": "./public/schemas/inventory.schema.json"
    },
    {
      "fileMatch": ["**/config/level-class.json"],
      "url": "./public/schemas/level-class.schema.json"
    },
    {
      "fileMatch": ["**/config/layout.json"],
      "url": "./public/schemas/layout.schema.json"
    }
  ]
}
```

## Key Validation Rules

### ID Uniqueness
All IDs across all configuration files must be unique. The system validates:
- Attribute IDs (from attributes.json)
- Enum IDs (from enums.json)
- Character info field IDs (from character-info.json)
- Combat stat IDs (from combat-stats.json)
- Inventory tab IDs (from inventory.json)

**Example of ID conflict:**
```json
// ❌ WRONG - enum ID conflicts with field ID
// enums.json
{"id": "alignment", ...}

// character-info.json
{"id": "alignment", "type": "text", ...}

// ✅ CORRECT
// enums.json
{"id": "alignment", ...}

// character-info.json
{"id": "character_alignment", "type": "enum", "enumRef": {"enumId": "alignment"}, ...}
```

### Field Types

**Character Info Fields:**
- `text` - Single-line text input
- `enum` - Dropdown referencing an enum

**NOT SUPPORTED:**
- ❌ `textarea` - Use `text` instead
- ❌ `number` - Use combat-stats or attributes instead

**Combat Stats:**
- Only supports `integer` and `number` types
- ❌ `string` is NOT supported

**Example:**
```json
// ❌ WRONG
{
  "id": "hitDice",
  "schema": {"type": "string", "default": "1d8"}
}

// ✅ CORRECT - Use resource counters for non-numeric values
```

### Enum References

When using enum fields, the `enumId` must reference an existing enum:

```json
// enums.json
{
  "enums": [
    {"id": "classes", "label": "Classes", "values": ["Fighter", "Wizard"]}
  ]
}

// character-info.json
{
  "fields": [
    {
      "id": "character_class",
      "type": "enum",
      "enumRef": {"enumId": "classes"}  // Must match enum ID
    }
  ]
}
```

### Slot Formulas

Inventory slots support formula-based calculation:

```json
{
  "slotFormula": "10"           // Fixed 10 slots
}
{
  "slotFormula": "STR"          // Slots equal to STR attribute
}
{
  "slotFormula": "DEX + 5"      // Slots = DEX + 5
}
{
  "slotFormula": "INT * 2 - 1"  // Complex formula
}
```

## Validation Tools

The system performs validation at:
1. **Build time** - When running `pnpm run build:examples`
2. **Runtime** - When loading configurations in the app
3. **Development** - VS Code with schema validation

Validation errors will show:
- Configuration name (e.g., "characterInfo")
- Field path (e.g., "fields.4.type")
- Error message (e.g., "Invalid input")

## Common Issues

### Issue: "Invalid input" for field type
**Cause:** Using unsupported field type like `textarea`  
**Fix:** Change to `text`

### Issue: ID conflict error
**Cause:** Same ID used in multiple places  
**Fix:** Rename one of the IDs to be unique

### Issue: Combat stat with string type
**Cause:** Combat stats only support numeric types  
**Fix:** Remove the stat or use a resource counter instead

### Issue: Enum reference not found
**Cause:** `enumRef.enumId` doesn't match any enum ID  
**Fix:** Ensure the enum exists in `enums.json`
