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
