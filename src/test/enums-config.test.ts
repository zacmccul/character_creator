/**
 * Enums Configuration Tests
 * Tests for enum definitions and validation
 */

import { describe, it, expect } from 'vitest';
import { EnumsConfigSchema, EnumDefinitionSchema } from '@/schemas/enums-config.schema';
import type { EnumsConfig, EnumDefinition } from '@/types/enums-config.types';

const mockEnumDef: EnumDefinition = {
  id: 'species',
  label: 'Species',
  description: 'Character species',
  values: ['Human', 'Elf', 'Dwarf'],
};

const mockEnumsConfig: EnumsConfig = {
  enums: [
    mockEnumDef,
    {
      id: 'classes',
      label: 'Classes',
      values: ['Fighter', 'Wizard', 'Rogue'],
    },
  ],
};

describe('EnumDefinitionSchema', () => {
  it('validates a correct enum definition', () => {
    const result = EnumDefinitionSchema.safeParse(mockEnumDef);
    expect(result.success).toBe(true);
  });

  it('rejects enum without ID', () => {
    const invalid = { ...mockEnumDef, id: '' };
    const result = EnumDefinitionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects enum without label', () => {
    const invalid = { ...mockEnumDef, label: '' };
    const result = EnumDefinitionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects enum with empty values array', () => {
    const invalid = { ...mockEnumDef, values: [] };
    const result = EnumDefinitionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects enum with duplicate values', () => {
    const invalid = {
      ...mockEnumDef,
      values: ['Human', 'Elf', 'Human'],
    };
    const result = EnumDefinitionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts enum without description', () => {
    const { description, ...withoutDesc } = mockEnumDef;
    const result = EnumDefinitionSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });

  it('accepts enum values as strings', () => {
    const result = EnumDefinitionSchema.safeParse(mockEnumDef);
    expect(result.success).toBe(true);
  });

  it('accepts enum values as objects with name and desc', () => {
    const withDescriptions: EnumDefinition = {
      id: 'species',
      label: 'Species',
      values: [
        { name: 'Human', desc: 'Versatile and adaptable' },
        { name: 'Elf', desc: 'Graceful and long-lived' },
        { name: 'Dwarf' },
      ],
    };
    const result = EnumDefinitionSchema.safeParse(withDescriptions);
    expect(result.success).toBe(true);
  });

  it('accepts mixed enum values (strings and objects)', () => {
    const mixed: EnumDefinition = {
      id: 'items',
      label: 'Items',
      values: [
        'None',
        { name: 'Sword', desc: 'A sharp blade' },
        'Shield',
        { name: 'Potion', desc: 'Restores health' },
      ],
    };
    const result = EnumDefinitionSchema.safeParse(mixed);
    expect(result.success).toBe(true);
  });

  it('rejects enum value object without name', () => {
    const invalid = {
      id: 'test',
      label: 'Test',
      values: [{ desc: 'Missing name' }],
    };
    const result = EnumDefinitionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects duplicate names across string and object values', () => {
    const invalid = {
      id: 'test',
      label: 'Test',
      values: ['Sword', { name: 'Sword', desc: 'Duplicate' }],
    };
    const result = EnumDefinitionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('EnumsConfigSchema', () => {
  it('validates a correct enums configuration', () => {
    const result = EnumsConfigSchema.safeParse(mockEnumsConfig);
    expect(result.success).toBe(true);
  });

  it('rejects configuration with empty enums array', () => {
    const invalid = { enums: [] };
    const result = EnumsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects configuration with duplicate enum IDs', () => {
    const invalid = {
      enums: [
        mockEnumDef,
        { ...mockEnumDef, label: 'Duplicate' },
      ],
    };
    const result = EnumsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
