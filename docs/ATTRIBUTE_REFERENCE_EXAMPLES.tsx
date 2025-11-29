/**
 * Example: Using Attribute References in Other Components
 * 
 * This example shows how future components can reference attributes
 * from the configuration system.
 */

import { useCharacterStore } from '@/stores/character.store';
import { getAttributeValue } from '@/utils/config-loader';

// Example 1: Component that uses STR to determine max equipment slots
export function ExampleEquipmentComponent() {
  const character = useCharacterStore((state) => state.character);
  
  // Get the STR attribute value using the attribute ID
  const strValue = getAttributeValue(character, 'STR') ?? 0;
  
  // Calculate max equipment slots based on STR
  const maxEquipmentSlots = Math.max(0, strValue);
  
  return (
    <div>
      <p>Equipment Slots: {character.equipmentSlots.length} / {maxEquipmentSlots}</p>
      <p>Based on STR: {strValue}</p>
    </div>
  );
}

// Example 2: Component with configurable attribute reference
interface ComponentConfig {
  maxSlotsReference: {
    attributeId: string;
    formula?: string;
  };
}

export function ExampleConfigDrivenComponent({ config }: { config: ComponentConfig }) {
  const character = useCharacterStore((state) => state.character);
  
  // Get the referenced attribute value
  const attrValue = getAttributeValue(character, config.maxSlotsReference.attributeId) ?? 0;
  
  // In the future, this could evaluate complex formulas:
  // const maxSlots = evaluateAttributeFormula(character, config.maxSlotsReference.formula || config.maxSlotsReference.attributeId);
  
  return (
    <div>
      <p>Max Slots (from {config.maxSlotsReference.attributeId}): {attrValue}</p>
    </div>
  );
}

// Example 3: Future configuration file for inventory component
// This would be in a file like public/config/inventory.json
const exampleInventoryConfig = {
  "equipment": {
    "title": "Equipment",
    "maxSlotsReference": {
      "attributeId": "STR",
      "formula": "STR"  // Future: could be "STR * 2 + 1"
    }
  },
  "consumables": {
    "title": "Consumables",
    "maxSlotsReference": {
      "attributeId": "DEX",
      "formula": "DEX"  // Future: could be "DEX + INT"
    }
  },
  "experienceBank": {
    "title": "Experience Bank",
    "maxSlotsReference": {
      "attributeId": "INT",
      "formula": "INT"  // Future: could be "INT * 3"
    }
  }
};

// Example 4: Using attribute configuration to validate inputs
import { loadAttributesConfig, getAttributeById, validateAttributeValue, getAttributeBounds } from '@/utils/config-loader';

export async function ExampleAttributeInput({ attributeId, value, onChange }: { 
  attributeId: string; 
  value: number; 
  onChange: (value: number) => void;
}) {
  // Load configuration
  const config = await loadAttributesConfig();
  const attrConfig = getAttributeById(config, attributeId);
  
  if (!attrConfig) {
    return <div>Attribute not found</div>;
  }
  
  // Get bounds for the input
  const bounds = getAttributeBounds(attrConfig);
  
  // Handle change with validation
  const handleChange = (newValue: number) => {
    if (validateAttributeValue(attrConfig, newValue)) {
      onChange(newValue);
    } else {
      console.error(`Value ${newValue} is not valid for ${attributeId}`);
    }
  };
  
  return (
    <div>
      <label>{attrConfig.emoji} {attrConfig.label}</label>
      <input
        type="number"
        value={value}
        min={bounds.min}
        max={bounds.max}
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
        title={attrConfig.description}
      />
    </div>
  );
}

// Example 5: Future cross-component derived stats
// This shows how multiple components could reference attributes
export function ExampleDerivedStatsComponent() {
  const character = useCharacterStore((state) => state.character);
  
  const str = getAttributeValue(character, 'STR') ?? 0;
  const dex = getAttributeValue(character, 'DEX') ?? 0;
  const int = getAttributeValue(character, 'INT') ?? 0;
  
  // Calculate derived stats based on multiple attributes
  const carryCapacity = str * 15; // 15 lbs per STR point
  const initiative = dex; // Initiative bonus equals DEX
  const spellSlots = Math.floor(int / 2); // 1 spell slot per 2 INT
  
  return (
    <div>
      <p>Carry Capacity: {carryCapacity} lbs (STR × 15)</p>
      <p>Initiative Bonus: +{initiative} (DEX)</p>
      <p>Spell Slots: {spellSlots} (INT ÷ 2)</p>
    </div>
  );
}

export { exampleInventoryConfig };
