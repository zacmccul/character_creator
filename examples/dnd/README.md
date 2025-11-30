# D&D 5e Character Sheet Example

This example demonstrates how to configure the character sheet system to create a D&D 5th Edition character sheet with traditional ability scores, D&D classes, races, backgrounds, and classic inventory management.

## Features

### 🎲 Traditional D&D Ability Scores
- **6 Core Abilities**: STR, DEX, CON, INT, WIS, CHA
- Score range: 1-20 (standard D&D range)
- Default starting value: 10
- Color-coded for easy identification

### 🎭 D&D Classes & Multiclassing
- All 12 core D&D 5e classes:
  - Barbarian, Bard, Cleric, Druid
  - Fighter, Monk, Paladin, Ranger
  - Rogue, Sorcerer, Warlock, Wizard
- Level range: 1-20
- Full multiclassing support
- Automatic total level calculation

### 🧝 Character Races
- 9 playable races including:
  - Human, Elf, Dwarf, Halfling
  - Dragonborn, Gnome, Half-Elf
  - Half-Orc, Tiefling

### 📖 Character Background System
- 13 classic D&D backgrounds:
  - Acolyte, Charlatan, Criminal, Entertainer
  - Folk Hero, Guild Artisan, Hermit, Noble
  - Outlander, Sage, Sailor, Soldier, Urchin

### ⚔️ Combat Statistics
- **Hit Points**: Current and Max HP tracking
- **Armor Class**: Defense rating
- **Initiative**: Combat order modifier
- **Speed**: Movement in feet
- **Proficiency Bonus**: Skill modifier
- **Hit Dice**: For short rest healing (e.g., "3d8")
- **Death Saves**: Success and failure tracking (0-3 each)

### 👤 Rich Character Details
- Character and Player names
- Alignment system (9 alignments)
- **Personality Traits**: Character mannerisms and quirks
- **Ideals**: Values and beliefs
- **Bonds**: Connections to people, places, or events
- **Flaws**: Character weaknesses and vulnerabilities

### 🎒 Fixed Inventory System
- **Equipment Tab**: 10 slots for weapons, armor, and gear
- **Consumables Tab**: 10 slots for potions, scrolls, and single-use items
- Pre-populated item lists with common D&D items

### 🔢 Custom Resource Counters
- Track spell slots, ki points, rage uses, bardic inspiration, etc.
- Add unlimited custom counters with names and values

## Configuration Files

Each aspect of the character sheet is controlled by a JSON configuration file:

### `enums.json`
Defines all dropdown options:
- **species**: The 9 playable races
- **experience**: 13 character backgrounds
- **classes**: All 12 core D&D classes
- **alignment**: 9-point alignment system
- **equipment_items**: Weapons, armor, adventuring gear
- **consumable_items**: Potions, scrolls, consumables

### `attributes.json`
Configures the 6 ability scores:
- STR (Strength) - Physical power and athletics
- DEX (Dexterity) - Agility, reflexes, and AC
- CON (Constitution) - Health and stamina
- INT (Intelligence) - Reasoning and arcane knowledge
- WIS (Wisdom) - Awareness and divine magic
- CHA (Charisma) - Personality and leadership

Each ability score:
- Range: 1-20
- Default: 10
- Has an emoji, color, and description

### `character-info.json`
Defines character detail fields:
- Text inputs: Character name, Player name
- Enums: Race, Background, Alignment
- Text areas: Personality Traits, Ideals, Bonds, Flaws

### `level-class.json`
Configures class and level management:
- References the "classes" enum
- Level range: 1-20
- Supports multiclassing with automatic level totaling

### `combat-stats.json`
Defines combat-related statistics:
- HP tracking (current and max)
- AC, Initiative, Speed
- Proficiency Bonus
- Hit Dice (string field for "1d8", "3d10", etc.)
- Death Save successes and failures

### `inventory.json`
Configures inventory tabs:
- **Equipment tab**: 10 fixed slots using `"slotFormula": "10"`
- **Consumables tab**: 10 fixed slots
- Each tab references its enum for available items

### `layout.json`
Arranges the UI components:
- Two-column layout
- Left column: Ability scores, Combat stats, Resource counters
- Right column: Character info, Class/Level, Inventory

## Building the Example

To generate a standalone `index.html` with this D&D configuration:

```bash
pnpm run build:examples dnd
```

This will:
1. Copy the default configuration files
2. Merge them with the D&D-specific configs in this directory
3. Build the application with the merged configuration
4. Generate `examples/dnd/index.html`

The resulting file is completely standalone and can be opened directly in a browser.

## Customization Guide

### Adding More Races
Edit `enums.json` and add to the "species" enum:
```json
{
  "id": "species",
  "values": [
    "Human",
    "Elf",
    "Your New Race"
  ]
}
```

### Changing Ability Score Ranges
Edit `attributes.json` to modify any ability score:
```json
{
  "id": "STR",
  "schema": {
    "type": "integer",
    "minimum": 3,    // Change minimum
    "maximum": 25,   // Change maximum
    "default": 8     // Change default
  }
}
```

### Adding Combat Stats
Edit `combat-stats.json` to add new tracked stats:
```json
{
  "id": "tempHp",
  "label": "Temp HP",
  "description": "Temporary hit points",
  "emoji": "💙",
  "schema": {
    "type": "integer",
    "minimum": 0,
    "default": 0
  }
}
```

### Modifying Inventory Slots
Edit `inventory.json` to change slot counts:
```json
{
  "id": "equipment",
  "slotFormula": "15",  // Change from 10 to 15 slots
  ...
}
```

Or make slots dynamic based on ability scores:
```json
{
  "slotFormula": "STR + 5",  // Slots = Strength + 5
  ...
}
```

### Adding Character Fields
Edit `character-info.json` to add new fields:

**Text input:**
```json
{
  "id": "age",
  "type": "text",
  "label": "Age",
  "placeholder": "Enter age",
  "description": "Character's age"
}
```

**Dropdown enum:**
```json
{
  "id": "deity",
  "type": "enum",
  "label": "Deity",
  "enumRef": {
    "enumId": "deities"  // Must define "deities" in enums.json
  }
}
```

**Multi-line text:**
```json
{
  "id": "backstory",
  "type": "textarea",
  "label": "Backstory",
  "placeholder": "Write your character's backstory..."
}
```

### Rearranging the Layout
Edit `layout.json` to move components:
- Change `"column": 0` to `"column": 1` to move components between columns
- Reorder items in the `"items"` array to change vertical order
- Adjust `"minH"` values to set minimum heights

## Tips for Game Masters

This D&D example can serve as a template for:
- **House Rules**: Modify ability score ranges or add custom stats
- **Campaign-Specific Content**: Add custom races, classes, or items
- **Simplified Sheets**: Remove unused fields for new players
- **Advanced Tracking**: Add fields for inspiration, exhaustion, or conditions

## File Structure

```
examples/dnd/
├── README.md                 (this file)
├── attributes.json           (6 D&D ability scores)
├── character-info.json       (personality, alignment, etc.)
├── combat-stats.json         (HP, AC, saves, etc.)
├── enums.json               (races, classes, items, etc.)
├── inventory.json           (10-slot equipment and consumables)
├── layout.json              (two-column layout)
├── level-class.json         (class and multiclass config)
└── index.html               (generated by build:examples)
```

## Learn More

- See `docs/CONFIGURATION_SYSTEM.md` for complete configuration documentation
- See `examples/default/` for the base configuration this example modifies
- See `examples/one-column/` for an alternative layout example
