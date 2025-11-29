/**
 * Attributes Section Component
 * Configuration-driven attributes display with derived slot counts
 */

import { useEffect, useState } from 'react';
import { Box, Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { useCharacterStore, useDerivedStats } from '@/stores/character.store';
import { AttributeType } from '@/types/character.types';
import type { AttributesConfig } from '@/types/attribute-config.types';
import { validateAttributeValue, getAttributeBounds } from '@/utils/config-loader';
import { configManager } from '@/utils/config-manager';

export const AttributesSection = () => {
  const { character, updateAttribute } = useCharacterStore();
  const { equipmentSlotsCount, consumableSlotsCount, experienceBankCount } = useDerivedStats();
  const [config, setConfig] = useState<AttributesConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    configManager.loadAllConfigs()
      .then((result) => {
        if (result.success) {
          setConfig(result.config.attributes);
        } else {
          const errorMsg = configManager.formatErrors(result.errors);
          setConfigError(errorMsg);
        }
      })
      .catch((error) => {
        console.error('Failed to load attributes configuration:', error);
        setConfigError(error.message);
      });
  }, []);

  const handleAttributeChange = (attrId: string, value: string) => {
    if (!config) return;
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const attrConfig = config.attributes.find(a => a.id === attrId);
    if (!attrConfig) return;

    // Validate against schema constraints
    if (validateAttributeValue(attrConfig, numValue)) {
      // Convert config ID to AttributeType enum
      if (attrId in AttributeType) {
        updateAttribute(attrId as AttributeType, numValue);
      }
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
      <Card.Header>
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">{config.title}</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Flex direction="column" gap={6}>
          <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', '2xl': 'repeat(5, 1fr)' }} gap={4}>
            {config.attributes.map((attrConfig) => {
              const attributeKey = attrConfig.id as AttributeType;
              const value = character.attributes[attributeKey] ?? 0;
              const bounds = getAttributeBounds(attrConfig);

              return (
                <Field key={attrConfig.id} label={`${attrConfig.emoji || ''} ${attrConfig.id}`}>
                  <Tooltip content={
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">{attrConfig.label}</Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>{attrConfig.description}</Text>
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

          {/* Derived Stats Display */}
          <Box pt={4} borderTopWidth="1px">
            <Flex align="center" gap={2} mb={4}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">🎒 Derived Capacities</Text>
            </Flex>
            <Grid gridTemplateColumns="repeat(3, 1fr)" gap={4}>
              <Tooltip content={<Text fontSize="sm">Equipment slots based on STR attribute</Text>}>
                <Flex
                  direction="column"
                  gap={2}
                  borderRadius="lg"
                  borderWidth="1px"
                  bg="red.50"
                  p={4}
                  textAlign="center"
                  _hover={{ shadow: "md" }}
                  transition="all 0.2s"
                >
                  <Text fontSize="xs" fontWeight="medium" color="gray.600" textTransform="uppercase">Equipment</Text>
                  <Text fontSize="3xl" fontWeight="bold" color="red.600">{equipmentSlotsCount}</Text>
                  <Text fontSize="xs" color="gray.500" fontFamily="mono">from STR</Text>
                </Flex>
              </Tooltip>

              <Tooltip content={<Text fontSize="sm">Consumable slots based on DEX attribute</Text>}>
                <Flex
                  direction="column"
                  gap={2}
                  borderRadius="lg"
                  borderWidth="1px"
                  bg="green.50"
                  p={4}
                  textAlign="center"
                  _hover={{ shadow: "md" }}
                  transition="all 0.2s"
                >
                  <Text fontSize="xs" fontWeight="medium" color="gray.600" textTransform="uppercase">Consumables</Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">{consumableSlotsCount}</Text>
                  <Text fontSize="xs" color="gray.500" fontFamily="mono">from DEX</Text>
                </Flex>
              </Tooltip>

              <Tooltip content={<Text fontSize="sm">Experience bank slots based on INT attribute</Text>}>
                <Flex
                  direction="column"
                  gap={2}
                  borderRadius="lg"
                  borderWidth="1px"
                  bg="blue.50"
                  p={4}
                  textAlign="center"
                  _hover={{ shadow: "md" }}
                  transition="all 0.2s"
                >
                  <Text fontSize="xs" fontWeight="medium" color="gray.600" textTransform="uppercase">Experience</Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">{experienceBankCount}</Text>
                  <Text fontSize="xs" color="gray.500" fontFamily="mono">from INT</Text>
                </Flex>
              </Tooltip>
            </Grid>
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};
