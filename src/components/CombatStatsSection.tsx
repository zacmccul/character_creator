/**
 * Combat Stats Section Component
 * Configuration-driven combat statistics display
 * Supports both single stats and paired stats (e.g., HP/Max HP)
 */

import { useEffect, useState } from 'react';
import { Button, Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacterStore } from '@/stores/character.store';
import type { CombatStatsConfig, CombatStatOrPair, CombatStatConfig } from '@/types/combat-stats-config.types';
import { validateAttributeValue, getAttributeBounds } from '@/utils/config-loader';
import { configManager } from '@/utils/config-manager';

// Type guard to check if a stat is paired
const isPairedStat = (stat: CombatStatOrPair): stat is readonly [CombatStatConfig, CombatStatConfig] => {
  return Array.isArray(stat);
};

export const CombatStatsSection = () => {
  const { character, updateCombatStat, syncWithConfigs } = useCharacterStore();
  const [config, setConfig] = useState<CombatStatsConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    configManager.loadAllConfigs()
      .then((result) => {
        if (result.success) {
          setConfig(result.config.combatStats);
          // Sync character state with loaded configs
          syncWithConfigs(result.config.attributes, result.config.combatStats);
        } else {
          const errorMsg = configManager.formatErrors(result.errors);
          setConfigError(errorMsg);
        }
      })
      .catch((error) => {
        console.error('Failed to load combat stats configuration:', error);
        setConfigError(error.message);
      });
  }, [syncWithConfigs]);

  const handleStatChange = (statId: string, value: string, maxStatId?: string, currentStatId?: string) => {
    if (!config) return;

    // Find the stat config (either single or in a pair)
    let statConfig;
    for (const stat of config.stats) {
      if (isPairedStat(stat)) {
        const match = stat.find(s => s.id === statId);
        if (match) {
          statConfig = match;
          break;
        }
      } else {
        if (stat.id === statId) {
          statConfig = stat;
          break;
        }
      }
    }

    if (!statConfig) return;

    const numValue = statConfig.schema.type === 'integer' 
      ? parseInt(value, 10) 
      : parseFloat(value);
    
    if (isNaN(numValue)) return;

    // Get dynamic max value if this stat has a dynamic maximum
    const dynamicMaxValue = maxStatId ? character.combatStats[maxStatId] : undefined;

    // Validate against schema constraints
    if (validateAttributeValue(statConfig, numValue, dynamicMaxValue)) {
      updateCombatStat(statId, numValue);
      
      // If we're updating a max stat in a pair, check if the current value needs to be capped
      if (currentStatId) {
        const currentValue = character.combatStats[currentStatId];
        if (currentValue !== undefined && currentValue > numValue) {
          updateCombatStat(currentStatId, numValue);
        }
      }
    }
  };

  const renderStat = (statOrPair: CombatStatOrPair) => {
    // Check if this is a paired stat using type guard
    if (isPairedStat(statOrPair)) {
      const [firstStat, secondStat] = statOrPair;
      const firstValue = character.combatStats[firstStat.id] ?? 0;
      const secondValue = character.combatStats[secondStat.id] ?? 0;
      const firstBounds = getAttributeBounds(firstStat, secondValue);
      const secondBounds = getAttributeBounds(secondStat);
      
      const inputType = firstStat.schema.type === 'integer' ? 'number' : 'number';
      const step = firstStat.schema.type === 'integer' ? 1 : 0.1;

      return (
        <Flex key={`${firstStat.id}-${secondStat.id}`} direction="column" gap={2}>
          <Tooltip content={
            <Flex direction="column" gap={1}>
              <Text fontSize="sm" fontWeight="semibold">{firstStat.label}</Text>
              <Text fontSize="sm" whiteSpace="pre-wrap">{firstStat.description}</Text>
              {secondStat.description && (
                <>
                  <Text fontSize="sm" fontWeight="semibold" mt={1}>{secondStat.label}</Text>
                  <Text fontSize="sm" whiteSpace="pre-wrap">{secondStat.description}</Text>
                </>
              )}
            </Flex>
          }>
            <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
              {firstStat.emoji} {firstStat.label} / {secondStat.label}
            </Button>
          </Tooltip>
          <Flex gap={2} align="center">
            <Input
              id={firstStat.id}
              type={inputType}
              min={firstBounds.min}
              max={firstBounds.max !== Number.MAX_SAFE_INTEGER ? firstBounds.max : undefined}
              step={step}
              value={firstValue}
              onChange={(e) => handleStatChange(firstStat.id, e.target.value, secondStat.id)}
              flex={1}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
            <Text fontSize="xl" fontWeight="bold" color="gray.500">/</Text>
            <Input
              id={secondStat.id}
              type={inputType}
              min={secondBounds.min}
              max={secondBounds.max !== Number.MAX_SAFE_INTEGER ? secondBounds.max : undefined}
              step={step}
              value={secondValue}
              onChange={(e) => handleStatChange(secondStat.id, e.target.value, undefined, firstStat.id)}
              flex={1}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>
        </Flex>
      );
    } else {
      // Single stat rendering - TypeScript now knows statOrPair is CombatStatConfig
      const statConfig = statOrPair;
      const value = character.combatStats[statConfig.id] ?? 0;
      const bounds = getAttributeBounds(statConfig);
      const inputType = statConfig.schema.type === 'integer' ? 'number' : 'number';
      const step = statConfig.schema.type === 'integer' ? 1 : 0.1;

      return (
        <Flex key={statConfig.id} direction="column" gap={2}>
          <Tooltip content={<Text fontSize="sm" whiteSpace="pre-wrap">{statConfig.description}</Text>}>
            <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
              {statConfig.emoji} {statConfig.label}
            </Button>
          </Tooltip>
          <Input
            id={statConfig.id}
            type={inputType}
            min={bounds.min}
            max={bounds.max !== Number.MAX_SAFE_INTEGER ? bounds.max : undefined}
            step={step}
            value={value}
            onChange={(e) => handleStatChange(statConfig.id, e.target.value)}
            h={12}
            textAlign="center"
            fontSize="xl"
            fontWeight="semibold"
          />
        </Flex>
      );
    }
  };

  // Show loading state
  if (!config && !configError) {
    return (
      <Card.Root>
        <Card.Body>
          <Text>Loading combat stats configuration...</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  // Show error state
  if (configError) {
    return (
      <Card.Root>
        <Card.Body>
          <Text color="red.500" fontWeight="semibold" mb={2}>
            Configuration Error
          </Text>
          <Text color="red.400" fontSize="sm" whiteSpace="pre-wrap" fontFamily="mono">
            {configError}
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  // Config is loaded at this point
  if (!config) return null;

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">{config.title}</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Grid gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
          {config.stats.map((statOrPair) => renderStat(statOrPair))}
        </Grid>
      </Card.Body>
    </Card.Root>
  );
};
