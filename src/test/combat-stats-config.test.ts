/**
 * Combat Stats Configuration Tests
 * Tests for combat stats configuration and validation
 */

import { describe, it, expect } from 'vitest';
import { CombatStatsConfigSchema, CombatStatConfigSchema } from '@/schemas/combat-stats-config.schema';
import type { CombatStatsConfig, CombatStatConfig } from '@/types/combat-stats-config.types';

const mockCombatStat: CombatStatConfig = {
  id: 'hp',
  label: 'HP',
  description: 'Hit Points',
  emoji: '❤️',
  schema: {
    type: 'integer',
    default: 0,
  },
};

const mockCombatStatsConfig: CombatStatsConfig = {
  title: '⚔️ Combat Stats',
  stats: [
    mockCombatStat,
    {
      id: 'mp',
      label: 'MP',
      description: 'Mana Points',
      emoji: '✨',
      schema: {
        type: 'integer',
        minimum: 0,
        default: 0,
      },
    },
  ],
};

describe('CombatStatConfigSchema', () => {
  it('validates a correct combat stat', () => {
    const result = CombatStatConfigSchema.safeParse(mockCombatStat);
    expect(result.success).toBe(true);
  });

  it('rejects stat without ID', () => {
    const invalid = { ...mockCombatStat, id: '' };
    const result = CombatStatConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects stat without label', () => {
    const invalid = { ...mockCombatStat, label: '' };
    const result = CombatStatConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts stat without emoji', () => {
    const { emoji, ...withoutEmoji } = mockCombatStat;
    const result = CombatStatConfigSchema.safeParse(withoutEmoji);
    expect(result.success).toBe(true);
  });

  it('validates numeric schema constraints', () => {
    const statWithMin: CombatStatConfig = {
      id: 'test',
      label: 'Test',
      description: 'Test stat',
      schema: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
      },
    };
    const result = CombatStatConfigSchema.safeParse(statWithMin);
    expect(result.success).toBe(true);
  });

  it('validates float type stats', () => {
    const floatStat: CombatStatConfig = {
      id: 'speed',
      label: 'Speed',
      description: 'Movement speed',
      schema: {
        type: 'number',
        exclusiveMinimum: 0,
        maximum: 10,
      },
    };
    const result = CombatStatConfigSchema.safeParse(floatStat);
    expect(result.success).toBe(true);
  });
});

describe('CombatStatsConfigSchema', () => {
  it('validates a correct combat stats configuration', () => {
    const result = CombatStatsConfigSchema.safeParse(mockCombatStatsConfig);
    expect(result.success).toBe(true);
  });

  it('rejects configuration without title', () => {
    const invalid = { ...mockCombatStatsConfig, title: '' };
    const result = CombatStatsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects configuration with empty stats array', () => {
    const invalid = { ...mockCombatStatsConfig, stats: [] };
    const result = CombatStatsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects configuration with duplicate stat IDs', () => {
    const invalid = {
      ...mockCombatStatsConfig,
      stats: [
        mockCombatStat,
        { ...mockCombatStat, label: 'Duplicate' },
      ],
    };
    const result = CombatStatsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts mixed integer and float stats', () => {
    const mixed = {
      title: 'Mixed Stats',
      stats: [
        {
          id: 'hp',
          label: 'HP',
          description: 'Health',
          schema: { type: 'integer' as const },
        },
        {
          id: 'speed',
          label: 'Speed',
          description: 'Movement',
          schema: { type: 'number' as const },
        },
      ],
    };
    const result = CombatStatsConfigSchema.safeParse(mixed);
    expect(result.success).toBe(true);
  });
});
