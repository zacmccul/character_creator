# Quick Start Guide - Phase 4 Implementation

## Current Status
✅ **Phase 1-3 Complete** - Foundation, data architecture, and state management are fully implemented and tested.

## What's Working Right Now

### Run the Development Server
```bash
pnpm dev
```
Visit http://localhost:5173 to see the basic app running.

### Run Tests
```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:ui       # Visual test UI
```

### Build Production File
```bash
pnpm build
```
Outputs a single `dist/index.html` file (~260KB) with everything embedded.

## Available Stores

### Character Store
```typescript
import { useCharacterStore } from '@/stores/character.store';

// In a component:
const { character, updateName, updateAttribute } = useCharacterStore();

// Update name
updateName('Aragorn');

// Update attribute
updateAttribute(AttributeType.STR, 3);
```

### Version History Store
```typescript
import { useVersionHistoryStore } from '@/stores/version-history.store';

const { saveVersion, loadVersion, getVersionList } = useVersionHistoryStore();

// Save current state
const timestamp = saveVersion(character, 'Before battle');

// Load version
const version = loadVersion(timestamp);
```

## Available Utilities

### Import/Export
```typescript
import { exportCharacterJSON, openFilePickerAndImport } from '@/utils/import-export';

// Export
exportCharacterJSON(character);

// Import
const result = await openFilePickerAndImport();
if (result.success) {
  loadCharacter(result.data);
}
```

### Persistence
```typescript
import { downloadEmbeddedHTML, initializeData } from '@/utils/persistence';

// Download self-contained HTML
await downloadEmbeddedHTML(character, history);

// Load on app start
const data = initializeData(); // Checks HTML → localStorage → empty
```

## Type Definitions

### All Enums Available
```typescript
import { 
  Species,           // HUMAN, ELF, DWARF, etc.
  CharacterClass,    // FIGHTER, WIZARD, ROGUE, etc.
  Experience,        // SOLDIER, SCHOLAR, CRIMINAL, etc.
  EquipmentItem,     // LONGSWORD, BOW, SHIELD, etc.
  ConsumableItem,    // HEALTH_POTION, SCROLL, etc.
  ExperienceBankItem,// COMBAT_TRAINING, LORE, etc.
  AttributeType      // STR, DEX, INT, WIS, CHA
} from '@/types/character.types';
```

### Character Sheet Interface
```typescript
interface CharacterSheet {
  version: string;
  name: string;
  level: LevelEntry[];          // { class: CharacterClass, level: number }[]
  species: Species;
  experience: Experience;
  attributes: Attributes;       // { STR, DEX, INT, WIS, CHA: 0-4 }
  movementRange: number;
  hp: number;
  mp: number;
  equipmentSlots: EquipmentItem[];      // Length = STR
  consumableSlots: ConsumableItem[];    // Length = DEX
  experienceBank: ExperienceBankItem[]; // Length = INT
  resourceCounters: ResourceCounter[];  // Custom counters
  abilityBonus: number;
  attackPower: number;
  spellPower: number;
  range: number;
}
```

## Validation

### Validate Character Data
```typescript
import { validateCharacterSheet, getValidationErrors } from '@/schemas/character.schema';

const result = validateCharacterSheet(data);
if (!result.success) {
  const errors = getValidationErrors(result.error);
  console.log(errors); // { "name": "Character name cannot be empty" }
}
```

### Validation Rules
- Name: non-empty string
- Version: semantic versioning (e.g., "1.0.0")
- Attributes: integers 0-4
- Level: integers 1-20
- HP: any integer
- MP: non-negative integer
- Movement Range: positive number
- Range: positive integer
- Equipment slots length must match STR
- Consumable slots length must match DEX
- Experience bank length must match INT

## Component Development Pattern

### Example: Simple Input Component
```typescript
import { useCharacterStore } from '@/stores/character.store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const CharacterNameInput = () => {
  const { character, updateName } = useCharacterStore();
  
  return (
    <div>
      <Label htmlFor="name">Character Name</Label>
      <Input
        id="name"
        value={character.name}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  );
};
```

### Example: Select Component
```typescript
import { useCharacterStore } from '@/stores/character.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Species } from '@/types/character.types';

export const SpeciesSelect = () => {
  const { character, updateSpecies } = useCharacterStore();
  
  return (
    <Select value={character.species} onValueChange={updateSpecies}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Species).map((species) => (
          <SelectItem key={species} value={species}>
            {species}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

## Next Steps - Phase 4 UI Components

### 1. Install shadcn/ui Components
```bash
npx shadcn@latest add button input select card label tooltip dialog tabs separator
```

### 2. Create Component Structure
```
src/components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── CharacterInfo.tsx      # Name, species, experience
├── AttributesSection.tsx  # 5 attributes + derived slots
├── LevelClassSection.tsx  # Multiclass management
├── CombatStatsSection.tsx # HP, MP, combat stats
├── InventorySection.tsx   # Equipment, consumables, XP bank
├── ResourceCounters.tsx   # Custom counters CRUD
└── VersionHistoryModal.tsx # Version management
```

### 3. Build Order Recommendation
1. **CharacterInfo** - Simple fields, good starting point
2. **AttributesSection** - Shows derived state working
3. **CombatStatsSection** - More numeric inputs
4. **LevelClassSection** - Dynamic list management
5. **ResourceCounters** - Full CRUD operations
6. **InventorySection** - Dynamic arrays based on attributes
7. **VersionHistoryModal** - Complex modal with preview

### 4. Testing Strategy
- Unit test each component in isolation
- Test store integration
- Test keyboard navigation
- Test validation display
- Integration test full workflows

## Helpful Commands

```bash
# Add shadcn component
npx shadcn@latest add [component-name]

# List available components
npx shadcn@latest add

# Run dev server with specific port
pnpm dev --port 3000

# Build and preview
pnpm build && pnpm preview

# Check TypeScript errors
npx tsc --noEmit

# Format with prettier (if installed)
npx prettier --write src/
```

## Common Patterns

### Reading Character Data
```typescript
const character = useCharacterStore((state) => state.character);
const { name, species, hp } = character;
```

### Updating Character Data
```typescript
const updateName = useCharacterStore((state) => state.updateName);
updateName('New Name');
```

### Derived State
```typescript
const { totalLevel, equipmentSlotsCount } = useCharacterStore((state) => ({
  totalLevel: state.totalLevel,
  equipmentSlotsCount: state.equipmentSlotsCount,
}));
```

### Validation in Components
```typescript
const [error, setError] = useState<string | null>(null);

const handleChange = (value: string) => {
  if (value.length === 0) {
    setError('Name cannot be empty');
  } else {
    setError(null);
    updateName(value);
  }
};
```

## Resources

### Documentation
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Zod Docs](https://zod.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)

### Project Files
- `DEVELOPMENT_PLAN.md` - Full feature roadmap
- `IMPLEMENTATION_PROGRESS.md` - Detailed progress report
- `.github/copilot-instructions.md` - Project guidelines

## Tips

1. **Use TypeScript IntelliSense** - All types are properly defined
2. **Check store actions** - Browse `character.store.ts` for available actions
3. **Validation is automatic** - Zod validates on state updates
4. **Test frequently** - Run `pnpm test:watch` during development
5. **Build often** - Check single-file output with `pnpm build`
6. **Keep it simple** - Focus on one component at a time

---

**Ready to build the UI! All the hard work is done. 🚀**
