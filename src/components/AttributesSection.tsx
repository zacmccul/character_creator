/**
 * Attributes Section Component
 * Five core attributes (STR, DEX, INT, WIS, CHA) with derived slot counts
 */

import { Box, Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { useCharacterStore, useDerivedStats } from '@/stores/character.store';
import { AttributeType } from '@/types/character.types';

const ATTRIBUTE_INFO: Record<AttributeType, { label: string; description: string; color: string; emoji: string }> = {
  [AttributeType.STR]: {
    label: 'Strength',
    description: 'Physical power. Determines equipment slots.',
    color: 'red',
    emoji: '💪',
  },
  [AttributeType.DEX]: {
    label: 'Dexterity',
    description: 'Agility and reflexes. Determines consumable slots.',
    color: 'green',
    emoji: '⚡',
  },
  [AttributeType.INT]: {
    label: 'Intelligence',
    description: 'Mental acuity. Determines experience bank slots.',
    color: 'blue',
    emoji: '🧠',
  },
  [AttributeType.WIS]: {
    label: 'Wisdom',
    description: 'Awareness and insight.',
    color: 'purple',
    emoji: '🔮',
  },
  [AttributeType.CHA]: {
    label: 'Charisma',
    description: 'Force of personality and leadership.',
    color: 'pink',
    emoji: '✨',
  },
};

export const AttributesSection = () => {
  const { character, updateAttribute } = useCharacterStore();
  const { equipmentSlotsCount, consumableSlotsCount, experienceBankCount } = useDerivedStats();

  const handleAttributeChange = (attr: AttributeType, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 4) {
      updateAttribute(attr, numValue);
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">🎲 Attributes</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Flex direction="column" gap={6}>
          <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', '2xl': 'repeat(5, 1fr)' }} gap={4}>
            {Object.entries(ATTRIBUTE_INFO).map(([attr, info]) => {
              const attributeKey = attr as AttributeType;
              const value = character.attributes[attributeKey];

              return (
                <Field key={attr} label={`${info.emoji} ${attr}`}>
                  <Tooltip content={
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">{info.label}</Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>{info.description}</Text>
                    </Box>
                  }>
                    <Input
                      id={`attr-${attr}`}
                      type="number"
                      min={0}
                      max={4}
                      value={value}
                      onChange={(e) => handleAttributeChange(attributeKey, e.target.value)}
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
