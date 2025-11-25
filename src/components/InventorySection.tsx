/**
 * Inventory Section Component
 * Equipment, consumable slots, and experience bank management
 */

import { Box, Card, Flex, Grid, Tabs, Text } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
import { useCharacterStore, useDerivedStats } from '@/stores/character.store';
import { EquipmentItem, ConsumableItem, ExperienceBankItem } from '@/types/character.types';
import { ChangeEvent } from 'react';

export const InventorySection = () => {
  const {
    character,
    updateEquipmentSlot,
    updateConsumableSlot,
    updateExperienceBankSlot,
  } = useCharacterStore();
  const { equipmentSlotsCount, consumableSlotsCount, experienceBankCount } = useDerivedStats();

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">🎒 Inventory</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Tabs.Root defaultValue="equipment">
          <Tabs.List>
            <Tabs.Trigger value="equipment">
              Equipment ({equipmentSlotsCount})
            </Tabs.Trigger>
            <Tabs.Trigger value="consumables">
              Consumables ({consumableSlotsCount})
            </Tabs.Trigger>
            <Tabs.Trigger value="experience">
              Experience ({experienceBankCount})
            </Tabs.Trigger>
          </Tabs.List>

          {/* Equipment Slots */}
          <Tabs.Content value="equipment">
            <Box mt={4}>
              {equipmentSlotsCount === 0 ? (
                <Flex
                  minH="120px"
                  align="center"
                  justify="center"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderStyle="dashed"
                >
                  <Text fontSize="sm" color="gray.600">
                    No equipment slots. Increase STR attribute to add slots.
                  </Text>
                </Flex>
              ) : (
                <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                  {character.equipmentSlots.map((item, index) => (
                    <Field key={index} label={`🛡️ Slot ${index + 1}`}>
                      <NativeSelectRoot>
                        <NativeSelectField
                          id={`equipment-${index}`}
                          value={item}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            updateEquipmentSlot(index, e.target.value as EquipmentItem)
                          }
                        >
                          <option value="">Select equipment...</option>
                          {Object.values(EquipmentItem).map((equipItem) => (
                            <option key={equipItem} value={equipItem}>
                              {equipItem}
                            </option>
                          ))}
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field>
                  ))}
                </Grid>
              )}
            </Box>
          </Tabs.Content>

          {/* Consumable Slots */}
          <Tabs.Content value="consumables">
            <Box mt={4}>
              {consumableSlotsCount === 0 ? (
                <Flex
                  minH="120px"
                  align="center"
                  justify="center"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderStyle="dashed"
                >
                  <Text fontSize="sm" color="gray.600">
                    No consumable slots. Increase DEX attribute to add slots.
                  </Text>
                </Flex>
              ) : (
                <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                  {character.consumableSlots.map((item, index) => (
                    <Field key={index} label={`🧪 Slot ${index + 1}`}>
                      <NativeSelectRoot>
                        <NativeSelectField
                          id={`consumable-${index}`}
                          value={item}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            updateConsumableSlot(index, e.target.value as ConsumableItem)
                          }
                        >
                          <option value="">Select consumable...</option>
                          {Object.values(ConsumableItem).map((consItem) => (
                            <option key={consItem} value={consItem}>
                              {consItem}
                            </option>
                          ))}
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field>
                  ))}
                </Grid>
              )}
            </Box>
          </Tabs.Content>

          {/* Experience Bank */}
          <Tabs.Content value="experience">
            <Box mt={4}>
              {experienceBankCount === 0 ? (
                <Flex
                  minH="120px"
                  align="center"
                  justify="center"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderStyle="dashed"
                >
                  <Text fontSize="sm" color="gray.600">
                    No experience bank slots. Increase INT attribute to add slots.
                  </Text>
                </Flex>
              ) : (
                <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                  {character.experienceBank.map((item, index) => (
                    <Field key={index} label={`📚 Slot ${index + 1}`}>
                      <NativeSelectRoot>
                        <NativeSelectField
                          id={`experience-${index}`}
                          value={item}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            updateExperienceBankSlot(index, e.target.value as ExperienceBankItem)
                          }
                        >
                          <option value="">Select experience...</option>
                          {Object.values(ExperienceBankItem).map((expItem) => (
                            <option key={expItem} value={expItem}>
                              {expItem}
                            </option>
                          ))}
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field>
                  ))}
                </Grid>
              )}
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Card.Body>
    </Card.Root>
  );
};
