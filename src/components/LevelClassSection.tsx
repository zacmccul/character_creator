/**
 * Level & Class Section Component
 * Multiclass support with add/remove functionality
 */

import { Box, Button, Card, Flex, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
import { useCharacterStore, useDerivedStats } from '@/stores/character.store';
import { CharacterClass } from '@/types/character.types';
import { PlusCircle, XCircle } from 'lucide-react';
import { ChangeEvent } from 'react';

export const LevelClassSection = () => {
  const { character, addLevel, updateLevel, updateLevelClass, removeLevel } =
    useCharacterStore();
  const { totalLevel } = useDerivedStats();

  const handleLevelChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      updateLevel(index, numValue);
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={2}>
            <Text fontSize="lg" fontWeight="semibold">🎭 Classes & Levels</Text>
          </Flex>
          <Flex align="center" gap={2} borderRadius="lg" borderWidth="1px" bg="gray.100" px={3} py={1.5}>
            <Text fontSize="sm" fontWeight="medium">Total Level:</Text>
            <Text fontSize="lg" fontWeight="bold">{totalLevel}</Text>
          </Flex>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Flex direction="column" gap={4}>
          {/* Class Entries */}
          {character.level.length === 0 ? (
            <Flex
              minH="120px"
              align="center"
              justify="center"
              borderRadius="lg"
              borderWidth="1px"
              borderStyle="dashed"
            >
              <Text fontSize="sm" color="gray.600">
                No classes added yet. Click "Add Class" to begin.
              </Text>
            </Flex>
          ) : (
            <Flex direction="column" gap={3}>
              {character.level.map((entry, index) => (
                <Flex
                  key={index}
                  align="flex-end"
                  gap={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  bg="white"
                  p={4}
                >
                  {/* Class Selection */}
                  <Box flex={1}>
                    <Field label="Class">
                      <NativeSelectRoot>
                        <NativeSelectField
                          id={`class-${index}`}
                          value={entry.class}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            updateLevelClass(index, e.target.value as CharacterClass)
                          }
                        >
                          {Object.values(CharacterClass).map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field>
                  </Box>

                  {/* Level Input */}
                  <Box w="24">
                    <Field label="Level">
                      <Input
                        id={`level-${index}`}
                        type="number"
                        min={1}
                        max={20}
                        value={entry.level}
                        onChange={(e) => handleLevelChange(index, e.target.value)}
                        textAlign="center"
                        fontWeight="semibold"
                      />
                    </Field>
                  </Box>

                  {/* Remove Button */}
                  <Tooltip content={<Text fontSize="sm">Remove this class</Text>}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(index)}
                      colorPalette="red"
                      aria-label={`Remove ${entry.class} class`}
                    >
                      <XCircle size={16} />
                    </Button>
                  </Tooltip>
                </Flex>
              ))}
            </Flex>
          )}

          {/* Add Class Button */}
          <Button
            onClick={() => addLevel(CharacterClass.FIGHTER)}
            variant="outline"
            width="full"
            borderStyle="dashed"
          >
            <PlusCircle size={16} style={{ marginRight: 8 }} />
            Add Class
          </Button>

          {/* Info Box */}
          {character.level.length > 1 && (
            <Box borderRadius="lg" borderWidth="1px" bg="blue.50" p={3}>
              <Text fontSize="sm">
                💡 <Text as="strong">Multiclassing:</Text> You have {character.level.length} classes
                for a total level of <Text as="strong">{totalLevel}</Text>.
              </Text>
            </Box>
          )}
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};
