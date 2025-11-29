/**
 * Combat Stats Section Component
 * Configuration-driven combat statistics display
 */

import { useEffect, useState } from 'react';
import { Button, Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacterStore } from '@/stores/character.store';
import type { CombatStatsConfig } from '@/types/combat-stats-config.types';
import { validateAttributeValue, getAttributeBounds } from '@/utils/config-loader';
import { configManager } from '@/utils/config-manager';

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

  const handleStatChange = (statId: string, value: string) => {
    if (!config) return;

    const statConfig = config.stats.find(s => s.id === statId);
    if (!statConfig) return;

    const numValue = statConfig.schema.type === 'integer' 
      ? parseInt(value, 10) 
      : parseFloat(value);
    
    if (isNaN(numValue)) return;

    // Validate against schema constraints
    if (validateAttributeValue(statConfig, numValue)) {
      updateCombatStat(statId, numValue);
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
          {config.stats.map((statConfig) => {
            // Get value from combat stats record, defaulting to 0 if not present
            const value = character.combatStats[statConfig.id] ?? 0;
            const bounds = getAttributeBounds(statConfig);
            const inputType = statConfig.schema.type === 'integer' ? 'number' : 'number';
            const step = statConfig.schema.type === 'integer' ? 1 : 0.1;

            return (
              <Flex key={statConfig.id} direction="column" gap={2}>
                <Tooltip content={<Text fontSize="sm">{statConfig.description}</Text>}>
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
          })}
        </Grid>
      </Card.Body>
    </Card.Root>
  );
};
