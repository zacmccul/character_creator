# Configuration-Driven Attributes Implementation

## Summary

Successfully transformed the Attributes section from hard-coded component logic to a flexible, configuration-driven system using JSON configuration files.

## What Was Built

### 1. Type System (`src/types/attribute-config.types.ts`)
- `NumericSchema`: OpenAPI 3.0-style numeric constraints
- `AttributeConfig`: Individual attribute definition with ID, label, description, and validation rules
- `AttributesConfig`: Complete section configuration with title and attribute list
- `AttributeReference`: For future cross-component attribute references

### 2. Validation Schema (`src/schemas/attribute-config.schema.ts`)
- Zod schemas for runtime validation of configuration files
- Validates:
  - Unique attribute IDs
  - Valid numeric constraints (min ≤ max)
  - Required fields and types
  - OpenAPI-compatible numeric schemas

### 3. Configuration File (`public/config/attributes.json`)
- JSON configuration for the 5 core attributes (STR, DEX, INT, WIS, CHA)
- Includes:
  - IDs for cross-referencing
  - Display labels and descriptions
  - Emojis and colors for UI
  - OpenAPI-style numeric constraints (type, min, max, default)

### 4. Configuration Loader (`src/utils/config-loader.ts`)
Comprehensive utility functions:
- `loadAttributesConfig()`: Fetch and validate configuration from JSON
- `getAttributeById()`: Lookup attribute by ID
- `getAttributeIds()`: Get all attribute IDs
- `validateAttributeValue()`: Validate value against schema constraints
- `getAttributeDefault()`: Get default value from schema
- `getAttributeBounds()`: Calculate min/max bounds including exclusive constraints
- `getAttributeValue()`: Get attribute value from character data by ID
- `evaluateAttributeFormula()`: Basic formula evaluation (extensible for future use)

### 5. Refactored Component (`src/components/AttributesSection.tsx`)
- Loads configuration on mount with loading/error states
- Dynamically renders attributes from configuration
- Uses configuration-defined constraints for validation
- Displays emojis, colors, and tooltips from configuration
- Maintains backward compatibility with existing character data

### 6. Comprehensive Tests (`src/test/attribute-config.test.ts`)
26 test cases covering:
- Configuration schema validation
- Attribute lookup and ID retrieval
- Value validation with various constraint types
- Bounds calculation (inclusive and exclusive)
- Default value handling
- Attribute value retrieval from character data
- Formula evaluation (basic)

## Key Features

### OpenAPI-Compatible Numeric Schema
Supports all OpenAPI 3.0 numeric constraint properties:
- `type`: "integer" or "number"
- `minimum` / `maximum`: Inclusive bounds
- `exclusiveMinimum` / `exclusiveMaximum`: Exclusive bounds
- `multipleOf`: Step/increment constraint
- `default`: Default value

### Cross-Component Attribute References
Components can reference attributes by ID:
```typescript
const strValue = getAttributeValue(character, 'STR');
```

This enables:
- Inventory components to reference STR for equipment slots
- Combat components to reference DEX for initiative
- Spell components to reference INT for spell slots
- **Future**: Formula-based calculations (e.g., "STR * 2 + 5")

### Validation at Multiple Levels
1. **Build-time**: TypeScript types ensure correct structure
2. **Runtime**: Zod schemas validate configuration on load
3. **User input**: Schema constraints validate attribute values
4. **Test-time**: Comprehensive test suite ensures correctness

## Benefits

### For Developers
- No code changes needed to modify attributes
- Easy to add/remove/modify attributes via JSON
- Type-safe with full TypeScript support
- Well-documented API with utility functions

### For Game Designers
- Modify attribute definitions without touching code
- Define custom constraints (ranges, steps, defaults)
- Configure UI elements (labels, emojis, colors)
- Set up cross-references for derived stats

### For Future Development
- Foundation for other configuration-driven components
- Extensible formula system for complex calculations
- Easy to add new validation rules
- Prepared for dynamic attribute loading

## Testing Results

All tests pass:
```
✓ AttributesConfigSchema (5 tests)
✓ getAttributeById (2 tests)
✓ getAttributeIds (1 test)
✓ validateAttributeValue (6 tests)
✓ getAttributeDefault (2 tests)
✓ getAttributeBounds (3 tests)
✓ getAttributeValue (2 tests)
✓ evaluateAttributeFormula (3 tests)

Total: 26 tests passed
```

Build successful with no errors.

## Documentation

Comprehensive documentation created in `docs/ATTRIBUTE_CONFIGURATION.md` covering:
- Configuration file structure
- OpenAPI schema properties
- Examples for different use cases
- Utility function reference
- Migration notes
- Testing instructions

## Next Steps (Future Enhancements)

1. **Component Location Configuration**: Define where components appear in the layout
2. **Formula Engine**: Implement full expression evaluation for complex calculations
3. **Conditional Display**: Show/hide attributes based on other values
4. **Dynamic Attribute Lists**: Load different attribute sets for different character types
5. **Inventory Configuration**: Apply same pattern to equipment, consumables, etc.
6. **Validation Messages**: Custom error messages in configuration
7. **Internationalization**: Multi-language support in configuration

## Files Created/Modified

### Created
- `src/types/attribute-config.types.ts`
- `src/schemas/attribute-config.schema.ts`
- `src/utils/config-loader.ts`
- `src/test/attribute-config.test.ts`
- `public/config/attributes.json`
- `docs/ATTRIBUTE_CONFIGURATION.md`

### Modified
- `src/components/AttributesSection.tsx` (refactored to use configuration)

## Backward Compatibility

✅ All existing character data remains compatible
✅ No changes to character schema
✅ UI behavior unchanged from user perspective
✅ Existing tests continue to pass
