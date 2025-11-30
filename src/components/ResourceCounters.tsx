/**
 * Resource Counters Component
 * Custom counters for tracking various resources (number or boolean)
 */

import { useState, ChangeEvent } from 'react';
import { Box, Button, Card, Flex, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { Field } from '@/components/ui/field';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
import { useCharacterStore } from '@/stores/character.store';
import { PlusCircle, Trash2 } from 'lucide-react';

export const ResourceCounters = () => {
  const {
    character,
    addResourceCounter,
    updateResourceCounter,
    updateResourceCounterName,
    deleteResourceCounter,
  } = useCharacterStore();

  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterType, setNewCounterType] = useState<'number' | 'boolean'>('number');

  const handleAddCounter = () => {
    if (newCounterName.trim()) {
      addResourceCounter(newCounterName.trim(), newCounterType);
      setNewCounterName('');
      setNewCounterType('number');
    }
  };

  const handleValueChange = (id: string, type: 'number' | 'boolean', value: string) => {
    if (type === 'number') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updateResourceCounter(id, numValue);
      }
    } else {
      updateResourceCounter(id, value === 'true');
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">🎮 Resource Counters</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Flex direction="column" gap={6}>
          {/* Existing Counters */}
          {character.resourceCounters.length === 0 ? (
            <Flex
              minH="120px"
              align="center"
              justify="center"
              borderRadius="lg"
              borderWidth="1px"
              borderStyle="dashed"
            >
              <Text fontSize="sm" color="gray.600">
                No resource counters added yet.
              </Text>
            </Flex>
          ) : (
            <Flex direction="column" gap={3}>
              {character.resourceCounters.map((counter) => (
                <Flex
                  key={counter.id}
                  direction={{ base: 'column', md: 'row' }}
                  align={{ base: 'stretch', md: 'flex-end' }}
                  gap={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  bg="white"
                  p={4}
                >
                  {/* Counter Name - Full width on mobile */}
                  <Box flex={{ base: undefined, md: 1 }} w={{ base: 'full', md: 'auto' }} minW={{ md: '150px' }}>
                    <Field label="Name">
                      <Input
                        id={`counter-name-${counter.id}`}
                        value={counter.name}
                        onChange={(e) =>
                          updateResourceCounterName(counter.id, e.target.value)
                        }
                        placeholder="Counter name"
                      />
                    </Field>
                  </Box>

                  {/* Type Display - Full width on mobile, before value */}
                  <Box w={{ base: 'full', md: '24' }} display={{ base: 'block', md: 'block' }} order={{ base: 2, md: 3 }}>
                    <Field label="Type">
                      <Flex
                        h={10}
                        align="center"
                        justify="center"
                        borderRadius="md"
                        borderWidth="1px"
                        bg="gray.100"
                        px={3}
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        {counter.type}
                      </Flex>
                    </Field>
                  </Box>

                  {/* Counter Value */}
                  <Box w={{ base: 'full', md: '32' }} order={{ base: 3, md: 2 }}>
                    <Field label="Value">
                      {counter.type === 'number' ? (
                        <Input
                          id={`counter-value-${counter.id}`}
                          type="number"
                          value={counter.value as number}
                          onChange={(e) =>
                            handleValueChange(counter.id, counter.type, e.target.value)
                          }
                          textAlign="center"
                          fontWeight="semibold"
                        />
                      ) : (
                        <NativeSelectRoot>
                          <NativeSelectField
                            id={`counter-value-${counter.id}`}
                            value={String(counter.value)}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              handleValueChange(counter.id, counter.type, e.target.value)
                            }
                          >
                            <option value="true">✓ True</option>
                            <option value="false">✗ False</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      )}
                    </Field>
                  </Box>

                  {/* Delete Button */}
                  <Flex align={{ base: 'center', md: 'flex-end' }} justify={{ base: 'center', md: 'flex-start' }} order={4}>
                    <Tooltip content={<Text fontSize="sm">Delete this counter</Text>}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResourceCounter(counter.id)}
                        colorPalette="red"
                        aria-label={`Delete ${counter.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          )}

          {/* Add New Counter */}
          <Box borderRadius="lg" borderWidth="1px" borderStyle="dashed" p={4}>
            <Flex direction="column" gap={4}>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" fontWeight="medium">➕ Add New Counter</Text>
              </Flex>
              <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} gap={3}>
                <Box flex={{ base: undefined, md: 1 }} w={{ base: 'full', md: 'auto' }} minW={{ md: '150px' }}>
                  <Field label="Name">
                    <Input
                      id="new-counter-name"
                      value={newCounterName}
                      onChange={(e) => setNewCounterName(e.target.value)}
                      placeholder="e.g., Spell Slots, Inspiration"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCounterName.trim()) {
                          handleAddCounter();
                        }
                      }}
                    />
                  </Field>
                </Box>

                <Box w={{ base: 'full', md: '32' }}>
                  <Field label="Type">
                    <NativeSelectRoot>
                      <NativeSelectField
                        id="new-counter-type"
                        value={newCounterType}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          setNewCounterType(e.target.value as 'number' | 'boolean')
                        }
                      >
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Field>
                </Box>

                <Flex align={{ base: 'center', md: 'flex-end' }} justify={{ base: 'center', md: 'flex-start' }}>
                  <Button
                    onClick={handleAddCounter}
                    disabled={!newCounterName.trim()}
                    size="sm"
                  >
                    <PlusCircle size={16} />
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};
