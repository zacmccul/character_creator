# Configuration System Overview

## Architecture

The application now uses a **centralized configuration system** that loads all UI configurations from JSON files with comprehensive validation and error reporting.

### Key Components

1. **Enums Configuration** (`public/config/enums.json`)
   - Reusable dropdown/enum definitions
   - Referenced by ID across multiple components
   
2. **Character Info Configuration** (`public/config/character-info.json`)
   - Defines character information fields
   - Supports text inputs and enum dropdowns
   
3. **Attributes Configuration** (`public/config/attributes.json`)
   - Defines attribute fields with OpenAPI-style constraints
   
4. **Config Manager** (`src/utils/config-manager.ts`)
   - Centralized singleton for loading all configs
   - Validates all configurations using Zod schemas
   - Cross-validates references between configs
   - Provides detailed error reporting

## Configuration Files

### 1. Enums Configuration

**Location:** `public/config/enums.json`

Defines reusable enum lists that can be referenced by other configurations.

```json
{
  "enums": [
    {
      "id": "species",
      "label": "Species",
      "description": "Available character species/races",
      "values": ["Human", "Elf", "Dwarf", "Halfling"]
    },
    {
      "id": "classes",
      "label": "Character Classes",
      "values": ["Fighter", "Wizard", "Rogue"]
    }
  ]
}
```

**Properties:**
- `id` (required): Unique identifier for the enum
- `label` (required): Human-readable name
- `description` (optional): Description of the enum
- `values` (required): Array of string values (must be unique)

### 2. Character Info Configuration

**Location:** `public/config/character-info.json`

Defines fields for the character information section.

```json
{
  "title": "👤 Character Information",
  "fields": [
    {
      "id": "name",
      "type": "text",
      "label": "Name",
      "placeholder": "Enter name",
      "required": true,
      "description": "Your character's name"
    },
    {
      "id": "species",
      "type": "enum",
      "label": "Species",
      "enumRef": {
        "enumId": "species"
      },
      "description": "Your character's species"
    }
  ]
}
```

**Field Types:**

#### Text Field
```json
{
  "id": "name",
  "type": "text",
  "label": "Name",
  "placeholder": "Enter name",
  "required": true,
  "description": "Tooltip text",
  "defaultValue": ""
}
```

#### Enum Field
```json
{
  "id": "species",
  "type": "enum",
  "label": "Species",
  "enumRef": {
    "enumId": "species"
  },
  "description": "Tooltip text",
  "defaultValue": "Human"
}
```

**Properties:**
- `id` (required): Unique identifier for the field
- `type` (required): Either "text" or "enum"
- `label` (required): Display label
- `description` (optional): Tooltip text
- `required` (optional): Whether field is required (default: false)
- `placeholder` (optional, text only): Placeholder text
- `enumRef` (required for enum): Reference to enum ID
- `defaultValue` (optional): Default value

## Config Manager API

### Loading Configuration

```typescript
import { configManager, loadAppConfig } from '@/utils/config-manager';

// Load all configurations
const result = await loadAppConfig();

if (result.success) {
  const { attributes, enums, characterInfo } = result.config;
  // Use configurations
} else {
  // Handle errors
  const errorMessage = configManager.formatErrors(result.errors);
  console.error(errorMessage);
}
```

### Using Config Manager in Components

```typescript
import { configManager } from '@/utils/config-manager';

useEffect(() => {
  configManager.loadAllConfigs()
    .then((result) => {
      if (result.success) {
        setConfig(result.config.characterInfo);
      } else {
        const errorMsg = configManager.formatErrors(result.errors);
        setConfigError(errorMsg);
      }
    });
}, []);
```

### Getting Enum by ID

```typescript
import { getEnumById } from '@/utils/config-manager';

// After config is loaded
const speciesEnum = getEnumById('species');
// Returns: { id: 'species', label: 'Species', values: ['Human', 'Elf', ...] }
```

### Checking if Config is Loaded

```typescript
import { isConfigLoaded } from '@/utils/config-manager';

if (isConfigLoaded()) {
  // Safe to use config
}
```

## Validation

The config manager performs comprehensive validation:

### Schema Validation
- All JSON files are validated against Zod schemas
- Type checking for all properties
- Required field validation
- Uniqueness constraints (IDs, enum values)

### Global ID Uniqueness ⚠️
**All IDs must be globally unique across all configuration types.**

This means:
- Enum IDs (from `enums.json`)
- Attribute IDs (from `attributes.json`)
- Character info field IDs (from `character-info.json`)

**Must all be unique from each other.**

❌ **Invalid Example:**
```json
// enums.json
{ "id": "species", "label": "Species", ... }

// character-info.json
{ "id": "species", "type": "text", ... }  // ❌ Conflicts with enum ID!
```

✅ **Valid Example:**
```json
// enums.json
{ "id": "species", "label": "Species", ... }

// character-info.json
{ "id": "character_species", "type": "enum", ... }  // ✅ Unique ID
```

The config manager will detect and report any ID conflicts:
```
[characterInfo at fields.1.id] ID 'species' is already used in enums at enums.0.id
```

### Cross-Reference Validation
- Enum references in character info are validated against enums config
- Missing enum references generate clear error messages

### Error Reporting

Errors are structured with detailed information:

```typescript
interface ConfigValidationError {
  configName: string;  // e.g., "characterInfo"
  path: string;        // e.g., "fields.0.enumRef.enumId"
  message: string;     // Error message
}
```

Example error output:
```
[characterInfo at fields.species.enumRef.enumId] Referenced enum 'nonexistent' not found in enums configuration
[enums at enums.0.values] All enum values must be unique
```

## Component Integration

Components now load configuration on mount and handle loading/error states:

```typescript
export const CharacterInfo = () => {
  const [config, setConfig] = useState<CharacterInfoConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    configManager.loadAllConfigs()
      .then((result) => {
        if (result.success) {
          setConfig(result.config.characterInfo);
        } else {
          setConfigError(configManager.formatErrors(result.errors));
        }
      });
  }, []);

  // Loading state
  if (!config && !configError) {
    return <LoadingComponent />;
  }

  // Error state
  if (configError) {
    return <ErrorDisplay error={configError} />;
  }

  // Render configured fields
  return config.fields.map(field => renderField(field));
};
```

## Testing

Comprehensive test coverage for all configuration systems:

- **Enums Config Tests** (9 tests): `src/test/enums-config.test.ts`
- **Character Info Config Tests** (12 tests): `src/test/character-info-config.test.ts`
- **Config Manager Tests** (9 tests): `src/test/config-manager.test.ts`
- **Attributes Config Tests** (26 tests): `src/test/attribute-config.test.ts`

Run tests:
```bash
pnpm test
```

## Benefits

1. **Centralized Management**: Single point for loading and validating all configurations
2. **Type Safety**: Full TypeScript types with Zod runtime validation
3. **Error Reporting**: Detailed, actionable error messages
4. **Cross-Validation**: Automatic validation of references between configs
5. **Reusability**: Enums can be shared across multiple components
6. **Extensibility**: Easy to add new configuration types
7. **Testing**: Comprehensive test coverage ensures reliability

## Future Enhancements

1. **Config Hot Reloading**: Auto-reload configs in development
2. **Config Editor UI**: Visual editor for configuration files
3. **Default Values**: Automatic initialization from config defaults
4. **Conditional Fields**: Show/hide fields based on other values
5. **Field Dependencies**: Calculate field values from other fields
6. **Custom Validators**: Plugin system for custom validation rules
7. **Config Versioning**: Support for config schema versions and migrations
