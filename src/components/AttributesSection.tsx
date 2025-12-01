/**
 * Attributes Section Component
 * Configuration-driven attributes display with derived slot counts
 */

import { useEffect, useState } from 'react';
import { Box, Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { useCharacterStore } from '@/stores/character.store';
import type { AttributesConfig } from '@/types/attribute-config.types';
import { validateAttributeValue, getAttributeBounds } from '@/utils/config-loader';
import { configManager } from '@/utils/config-manager';

export const AttributesSection = () => {
  const { character, updateAttribute, syncWithConfigs } = useCharacterStore();
  const [config, setConfig] = useState<AttributesConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    configManager.loadAllConfigs()
      .then((result) => {
        if (result.success) {
          setConfig(result.config.attributes);
          // Sync character state with loaded configs
          syncWithConfigs(result.config.attributes, result.config.combatStats);
        } else {
          const errorMsg = configManager.formatErrors(result.errors);
          setConfigError(errorMsg);
        }
      })
      .catch((error) => {
        console.error('Failed to load attributes configuration:', error);
        setConfigError(error.message);
      });
  }, [syncWithConfigs]);

  const handleAttributeChange = (attrId: string, value: string) => {
    if (!config) return;
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const attrConfig = config.attributes.find(a => a.id === attrId);
    if (!attrConfig) return;

    // Validate against schema constraints
    if (validateAttributeValue(attrConfig, numValue)) {
      updateAttribute(attrId, numValue);
    }
  };

  // Show loading state
  if (!config && !configError) {
    return (
      <Card.Root>
        <Card.Body>
          <Text>Loading attributes configuration...</Text>
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
      <Card.Body>
        <Flex direction="column" gap={4}>
          <Text fontSize="lg" fontWeight="semibold">{config.title}</Text>
          <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
            {config.attributes.map((attrConfig) => {
              const value = character.attributes[attrConfig.id] ?? 0;
              const bounds = getAttributeBounds(attrConfig);

              return (
                <Field key={attrConfig.id} label={`${attrConfig.emoji || ''} ${attrConfig.id}`}>
                  <Tooltip content={
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">{attrConfig.label}</Text>
                      <Text fontSize="xs" color="gray.400" mt={1} whiteSpace="pre-wrap">{attrConfig.description}</Text>
                    </Box>
                  }>
                    <Input
                      id={`attr-${attrConfig.id}`}
                      type="number"
                      min={bounds.min}
                      max={bounds.max}
                      value={value}
                      onChange={(e) => handleAttributeChange(attrConfig.id, e.target.value)}
                      h={14}
                      textAlign="center"
                      fontSize="2xl"
                      fontWeight="bold"
                    />
                  </Tooltip>
                </Field>
              );
            })}
          </Grid>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};
