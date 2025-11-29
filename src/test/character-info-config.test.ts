/**
 * Character Info Configuration Tests
 * Tests for character info field definitions and validation
 */

import { describe, it, expect } from 'vitest';
import {
  CharacterInfoConfigSchema,
  TextFieldConfigSchema,
  EnumFieldConfigSchema,
} from '@/schemas/character-info-config.schema';
import type { CharacterInfoConfig, TextFieldConfig, EnumFieldConfig } from '@/types/character-info-config.types';

const mockTextField: TextFieldConfig = {
  id: 'name',
  type: 'text',
  label: 'Name',
  placeholder: 'Enter name',
  required: true,
  description: 'Character name',
  defaultValue: '',
};

const mockEnumField: EnumFieldConfig = {
  id: 'species',
  type: 'enum',
  label: 'Species',
  enumRef: { enumId: 'species' },
  description: 'Character species',
};

const mockCharacterInfoConfig: CharacterInfoConfig = {
  title: 'Character Information',
  fields: [mockTextField, mockEnumField],
};

describe('TextFieldConfigSchema', () => {
  it('validates a correct text field', () => {
    const result = TextFieldConfigSchema.safeParse(mockTextField);
    expect(result.success).toBe(true);
  });

  it('rejects field without ID', () => {
    const invalid = { ...mockTextField, id: '' };
    const result = TextFieldConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects field without label', () => {
    const invalid = { ...mockTextField, label: '' };
    const result = TextFieldConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts field without optional properties', () => {
    const minimal = {
      id: 'test',
      type: 'text' as const,
      label: 'Test',
    };
    const result = TextFieldConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });
});

describe('EnumFieldConfigSchema', () => {
  it('validates a correct enum field', () => {
    const result = EnumFieldConfigSchema.safeParse(mockEnumField);
    expect(result.success).toBe(true);
  });

  it('rejects field without enumRef', () => {
    const { enumRef, ...invalid } = mockEnumField;
    const result = EnumFieldConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects field with empty enumId', () => {
    const invalid = {
      ...mockEnumField,
      enumRef: { enumId: '' },
    };
    const result = EnumFieldConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('CharacterInfoConfigSchema', () => {
  it('validates a correct character info configuration', () => {
    const result = CharacterInfoConfigSchema.safeParse(mockCharacterInfoConfig);
    expect(result.success).toBe(true);
  });

  it('rejects configuration without title', () => {
    const invalid = { ...mockCharacterInfoConfig, title: '' };
    const result = CharacterInfoConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects configuration with empty fields array', () => {
    const invalid = { ...mockCharacterInfoConfig, fields: [] };
    const result = CharacterInfoConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects configuration with duplicate field IDs', () => {
    const invalid = {
      ...mockCharacterInfoConfig,
      fields: [
        mockTextField,
        { ...mockTextField, label: 'Duplicate' },
      ],
    };
    const result = CharacterInfoConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts mixed field types', () => {
    const config = {
      title: 'Test',
      fields: [
        mockTextField,
        mockEnumField,
        { id: 'another', type: 'text' as const, label: 'Another' },
      ],
    };
    const result = CharacterInfoConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });
});
