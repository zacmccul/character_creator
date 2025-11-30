/**
 * Enum Helper Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getEnumValueName,
  getEnumValueDescription,
  hasEnumValueDescription,
  findEnumValueByName,
  getEnumValueNames,
} from '@/utils/enum-helpers';
import type { EnumValue } from '@/types/enums-config.types';

describe('getEnumValueName', () => {
  it('extracts name from string value', () => {
    expect(getEnumValueName('Sword')).toBe('Sword');
  });

  it('extracts name from object value', () => {
    expect(getEnumValueName({ name: 'Sword', desc: 'A blade' })).toBe('Sword');
  });

  it('extracts name from object without description', () => {
    expect(getEnumValueName({ name: 'Shield' })).toBe('Shield');
  });
});

describe('getEnumValueDescription', () => {
  it('returns undefined for string value', () => {
    expect(getEnumValueDescription('Sword')).toBeUndefined();
  });

  it('returns description from object value', () => {
    expect(getEnumValueDescription({ name: 'Sword', desc: 'A blade' })).toBe('A blade');
  });

  it('returns undefined for object without description', () => {
    expect(getEnumValueDescription({ name: 'Shield' })).toBeUndefined();
  });
});

describe('hasEnumValueDescription', () => {
  it('returns false for string value', () => {
    expect(hasEnumValueDescription('Sword')).toBe(false);
  });

  it('returns true for object with description', () => {
    expect(hasEnumValueDescription({ name: 'Sword', desc: 'A blade' })).toBe(true);
  });

  it('returns false for object without description', () => {
    expect(hasEnumValueDescription({ name: 'Shield' })).toBe(false);
  });
});

describe('findEnumValueByName', () => {
  const values: EnumValue[] = [
    'None',
    { name: 'Sword', desc: 'A blade' },
    'Shield',
    { name: 'Potion' },
  ];

  it('finds string value by name', () => {
    const result = findEnumValueByName(values, 'None');
    expect(result).toBe('None');
  });

  it('finds object value by name', () => {
    const result = findEnumValueByName(values, 'Sword');
    expect(result).toEqual({ name: 'Sword', desc: 'A blade' });
  });

  it('returns undefined for non-existent name', () => {
    const result = findEnumValueByName(values, 'Axe');
    expect(result).toBeUndefined();
  });
});

describe('getEnumValueNames', () => {
  it('extracts all names from mixed values', () => {
    const values: EnumValue[] = [
      'None',
      { name: 'Sword', desc: 'A blade' },
      'Shield',
      { name: 'Potion' },
    ];
    expect(getEnumValueNames(values)).toEqual(['None', 'Sword', 'Shield', 'Potion']);
  });

  it('handles empty array', () => {
    expect(getEnumValueNames([])).toEqual([]);
  });

  it('handles all string values', () => {
    const values: EnumValue[] = ['A', 'B', 'C'];
    expect(getEnumValueNames(values)).toEqual(['A', 'B', 'C']);
  });

  it('handles all object values', () => {
    const values: EnumValue[] = [
      { name: 'A', desc: 'First' },
      { name: 'B' },
      { name: 'C', desc: 'Third' },
    ];
    expect(getEnumValueNames(values)).toEqual(['A', 'B', 'C']);
  });
});
