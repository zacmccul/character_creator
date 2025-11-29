/**
 * Level & Class Section Component
 * Multiclass support with add/remove functionality
 * Configuration-driven using level-class.json
 */

import { useEffect, useState } from 'react';
import { Box, Button, Card, Flex, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
import { useCharacterStore, useDerivedStats } from '@/stores/character.store';
import { CharacterClass } from '@/types/character.types';
import { PlusCircle, XCircle } from 'lucide-react';
import { ChangeEvent } from 'react';
import type { LevelClassConfig } from '@/types/level-class-config.types';
import { configManager } from '@/utils/config-manager';

export const LevelClassSection = () => {
  const { character, addLevel, updateLevel, updateLevelClass, removeLevel } =
    useCharacterStore();
  const { totalLevel } = useDerivedStats();
  const [config, setConfig] = useState<LevelClassConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [classValues, setClassValues] = useState<readonly string[]>([]);

  // Load configuration on mount
  useEffect(() => {
    configManager.loadAllConfigs()
      .then((result) => {
        if (result.success) {
          setConfig(result.config.levelClass);
          
          // Load class enum values
          const classEnum = configManager.getEnum(result.config.levelClass.classEnum.enumId);
          if (classEnum) {
            setClassValues(classEnum.values);
          } else {
            setConfigError(`Enum '${result.config.levelClass.classEnum.enumId}' not found`);
          }
        } else {
          const errorMsg = configManager.formatErrors(result.errors);
          setConfigError(errorMsg);
        }
      })
      .catch((error) => {
        console.error('Failed to load configuration:', error);
        setConfigError(error.message);
      });
  }, []);

  const handleLevelChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      updateLevel(index, numValue);
    }
  };

  // Show error state if config failed to load
  if (configError) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold" color="red.500">
            Configuration Error
          </Text>
        </Card.Header>
        <Card.Body>
          <Text fontSize="sm" whiteSpace="pre-wrap">{configError}</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  // Show loading state while config is loading
  if (!config || classValues.length === 0) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">Loading...</Text>
        </Card.Header>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={2}>
            <Text fontSize="lg" fontWeight="semibold">{config.title}</Text>
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
                {config.emptyStateText}
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
                          {classValues.map((cls) => (
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
                    <Field label={config.levelField.label}>
                      <Input
                        id={`level-${index}`}
                        type="number"
                        min={config.levelField.min}
                        max={config.levelField.max}
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
            onClick={() => addLevel(classValues[0] as CharacterClass)}
            variant="outline"
            width="full"
            borderStyle="dashed"
          >
            <PlusCircle size={16} style={{ marginRight: 8 }} />
            {config.addButtonText}
          </Button>

          {/* Info Box */}
          {character.level.length > 1 && (
            <Box borderRadius="lg" borderWidth="1px" bg="blue.50" p={3}>
              <Text fontSize="sm">
                {config.multiclassInfoTemplate
                  .replace('{count}', character.level.length.toString())
                  .replace('{total}', totalLevel.toString())
                  .split('**')
                  .map((part, i) => i % 2 === 1 ? <Text as="strong" key={i}>{part}</Text> : part)}
              </Text>
            </Box>
          )}
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};
