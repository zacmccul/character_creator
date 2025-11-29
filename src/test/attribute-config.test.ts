/**
 * Attribute Configuration Tests
 * Tests for configuration loading and validation
 */

import { describe, it, expect } from 'vitest';
import {
  getAttributeById,
  getAttributeIds,
  validateAttributeValue,
  getAttributeDefault,
  getAttributeBounds,
  getAttributeValue,
  evaluateAttributeFormula,
} from '@/utils/config-loader';
import { AttributesConfigSchema } from '@/schemas/attribute-config.schema';
import type { AttributesConfig, AttributeConfig } from '@/types/attribute-config.types';

// Mock configuration for testing
const mockConfig: AttributesConfig = {
  title: 'Test Attributes',
  attributes: [
    {
      id: 'STR',
      label: 'Strength',
      description: 'Physical power',
      emoji: '💪',
      color: 'red',
      schema: {
        type: 'integer',
        minimum: 0,
        maximum: 4,
        default: 0,
      },
    },
    {
      id: 'DEX',
      label: 'Dexterity',
      description: 'Agility',
      schema: {
        type: 'integer',
        minimum: 0,
        maximum: 4,
        default: 2,
      },
    },
  ],
};

describe('AttributesConfigSchema', () => {
  it('validates a correct configuration', () => {
    const result = AttributesConfigSchema.safeParse(mockConfig);
    expect(result.success).toBe(true);
  });

  it('rejects configuration without title', () => {
    const invalid = { ...mockConfig, title: '' };
    const result = AttributesConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects configuration with empty attributes array', () => {
    const invalid = { ...mockConfig, attributes: [] };
    const result = AttributesConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects configuration with duplicate attribute IDs', () => {
    const invalid = {
      ...mockConfig,
      attributes: [
        mockConfig.attributes[0],
        { ...mockConfig.attributes[0], label: 'Duplicate' },
      ],
    };
    const result = AttributesConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid numeric schema (minimum > maximum)', () => {
    const invalid = {
      ...mockConfig,
      attributes: [
        {
          id: 'TEST',
          label: 'Test',
          description: 'Test',
          schema: {
            type: 'integer' as const,
            minimum: 10,
            maximum: 5,
          },
        },
      ],
    };
    const result = AttributesConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('getAttributeById', () => {
  it('finds attribute by ID', () => {
    const attr = getAttributeById(mockConfig, 'STR');
    expect(attr).toBeDefined();
    expect(attr?.label).toBe('Strength');
  });

  it('returns undefined for non-existent ID', () => {
    const attr = getAttributeById(mockConfig, 'INVALID');
    expect(attr).toBeUndefined();
  });
});

describe('getAttributeIds', () => {
  it('returns all attribute IDs', () => {
    const ids = getAttributeIds(mockConfig);
    expect(ids).toEqual(['STR', 'DEX']);
  });
});

describe('validateAttributeValue', () => {
  const strAttr = mockConfig.attributes[0];

  it('accepts valid integer within bounds', () => {
    expect(validateAttributeValue(strAttr, 2)).toBe(true);
  });

  it('accepts minimum value', () => {
    expect(validateAttributeValue(strAttr, 0)).toBe(true);
  });

  it('accepts maximum value', () => {
    expect(validateAttributeValue(strAttr, 4)).toBe(true);
  });

  it('rejects value below minimum', () => {
    expect(validateAttributeValue(strAttr, -1)).toBe(false);
  });

  it('rejects value above maximum', () => {
    expect(validateAttributeValue(strAttr, 5)).toBe(false);
  });

  it('rejects non-integer for integer type', () => {
    expect(validateAttributeValue(strAttr, 2.5)).toBe(false);
  });

  it('validates exclusive bounds correctly', () => {
    const exclusiveAttr: AttributeConfig = {
      id: 'TEST',
      label: 'Test',
      description: 'Test',
      schema: {
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 10,
      },
    };

    expect(validateAttributeValue(exclusiveAttr, 0)).toBe(false);
    expect(validateAttributeValue(exclusiveAttr, 0.1)).toBe(true);
    expect(validateAttributeValue(exclusiveAttr, 9.9)).toBe(true);
    expect(validateAttributeValue(exclusiveAttr, 10)).toBe(false);
  });

  it('validates multipleOf correctly', () => {
    const multipleAttr: AttributeConfig = {
      id: 'TEST',
      label: 'Test',
      description: 'Test',
      schema: {
        type: 'integer',
        multipleOf: 5,
      },
    };

    expect(validateAttributeValue(multipleAttr, 10)).toBe(true);
    expect(validateAttributeValue(multipleAttr, 15)).toBe(true);
    expect(validateAttributeValue(multipleAttr, 13)).toBe(false);
  });
});

describe('getAttributeDefault', () => {
  it('returns specified default value', () => {
    const dexAttr = mockConfig.attributes[1];
    expect(getAttributeDefault(dexAttr)).toBe(2);
  });

  it('returns 0 when no default specified', () => {
    const attrWithoutDefault: AttributeConfig = {
      id: 'TEST',
      label: 'Test',
      description: 'Test',
      schema: {
        type: 'integer',
        minimum: 0,
        maximum: 10,
      },
    };
    expect(getAttributeDefault(attrWithoutDefault)).toBe(0);
  });
});

describe('getAttributeBounds', () => {
  it('returns correct bounds for basic schema', () => {
    const strAttr = mockConfig.attributes[0];
    const bounds = getAttributeBounds(strAttr);
    expect(bounds.min).toBe(0);
    expect(bounds.max).toBe(4);
  });

  it('handles exclusive bounds for integers', () => {
    const exclusiveAttr: AttributeConfig = {
      id: 'TEST',
      label: 'Test',
      description: 'Test',
      schema: {
        type: 'integer',
        exclusiveMinimum: 0,
        exclusiveMaximum: 10,
      },
    };
    const bounds = getAttributeBounds(exclusiveAttr);
    expect(bounds.min).toBe(1);
    expect(bounds.max).toBe(9);
  });

  it('returns safe integer bounds when not specified', () => {
    const unboundedAttr: AttributeConfig = {
      id: 'TEST',
      label: 'Test',
      description: 'Test',
      schema: {
        type: 'integer',
      },
    };
    const bounds = getAttributeBounds(unboundedAttr);
    expect(bounds.min).toBe(Number.MIN_SAFE_INTEGER);
    expect(bounds.max).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('getAttributeValue', () => {
  const mockCharacter = {
    attributes: {
      STR: 3,
      DEX: 2,
      INT: 4,
    },
  };

  it('returns attribute value by ID', () => {
    expect(getAttributeValue(mockCharacter, 'STR')).toBe(3);
    expect(getAttributeValue(mockCharacter, 'DEX')).toBe(2);
  });

  it('returns undefined for non-existent attribute', () => {
    expect(getAttributeValue(mockCharacter, 'INVALID')).toBeUndefined();
  });
});

describe('evaluateAttributeFormula', () => {
  const mockCharacter = {
    attributes: {
      STR: 3,
      DEX: 2,
    },
  };

  it('evaluates simple attribute reference', () => {
    expect(evaluateAttributeFormula(mockCharacter, 'STR')).toBe(3);
    expect(evaluateAttributeFormula(mockCharacter, 'DEX')).toBe(2);
  });

  it('returns undefined for non-existent attribute', () => {
    expect(evaluateAttributeFormula(mockCharacter, 'INVALID')).toBeUndefined();
  });

  it('returns undefined for complex formulas (not yet supported)', () => {
    // Complex formulas are not yet implemented
    expect(evaluateAttributeFormula(mockCharacter, 'STR * 2')).toBeUndefined();
  });
});
