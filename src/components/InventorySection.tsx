/**
 * Inventory Section Component
 * Dynamic configuration-driven inventory with formula-based slot calculations
 */

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Box, Card, Flex, Grid, Tabs, Text, IconButton } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Tooltip } from '@/components/ui/tooltip';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
import { useCharacterStore } from '@/stores/character.store';
import type { InventoryConfig } from '@/types/inventory-config.types';
import type { EnumDefinition } from '@/types/enums-config.types';
import { configManager, getEnumById } from '@/utils/config-manager';
import { evaluateFormula } from '@/utils/formula-evaluator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEnumValueName, getEnumValueDescription, findEnumValueByName } from '@/utils/enum-helpers';

export const InventorySection = () => {
  const { character, updateInventorySlot, syncWithAllConfigs } = useCharacterStore();
  const [config, setConfig] = useState<InventoryConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [enumCache, setEnumCache] = useState<Map<string, EnumDefinition>>(new Map());
  const tabsListRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const scrollAmount = 200;
      tabsListRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Load configuration on mount
  useEffect(() => {
    configManager.loadAllConfigs()
      .then((result) => {
        if (result.success) {
          setConfig(result.config.inventory);
          
          // Cache enums for each tab
          const cache = new Map<string, EnumDefinition>();
          for (const tab of result.config.inventory.tabs) {
            const enumDef = getEnumById(tab.itemEnumId);
            if (enumDef) {
              cache.set(tab.itemEnumId, enumDef);
            }
          }
          setEnumCache(cache);
          
          // Sync character state with all loaded configs
          syncWithAllConfigs(
            result.config.attributes,
            result.config.combatStats,
            result.config.inventory
          );
        } else {
          const errorMsg = configManager.formatErrors(result.errors);
          setConfigError(errorMsg);
        }
      })
      .catch((error) => {
        console.error('Failed to load inventory configuration:', error);
        setConfigError(error.message);
      });
  }, [syncWithAllConfigs]);

  // Show loading state
  if (!config && !configError) {
    return (
      <Card.Root>
        <Card.Body>
          <Text>Loading inventory configuration...</Text>
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
        <Tabs.Root defaultValue={config.tabs[0]?.id || 'equipment'}>
          <Flex position="relative" align="center" gap={2}>
            <IconButton
              aria-label="Scroll left"
              size="sm"
              variant="ghost"
              onClick={() => scrollTabs('left')}
              flexShrink={0}
            >
              <ChevronLeft />
            </IconButton>
            
            <Box flex="1" overflow="hidden">
              <Tabs.List 
                ref={tabsListRef}
                overflowX="auto" 
                height="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {config.tabs.map((tab) => {
                  // Calculate slot count using formula
                  const slotCount = evaluateFormula(tab.slotFormula, character.attributes);
                  
                  return (
                    <Tabs.Trigger key={tab.id} value={tab.id} height="auto" px={4} py={3} flexShrink={0}>
                      <Box textAlign="center" lineHeight="1.2">
                        {tab.emoji} {tab.label} ({slotCount})
                      </Box>
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>
            </Box>
            
            <IconButton
              aria-label="Scroll right"
              size="sm"
              variant="ghost"
              onClick={() => scrollTabs('right')}
              flexShrink={0}
            >
              <ChevronRight />
            </IconButton>
          </Flex>

          {config.tabs.map((tab) => {
            const slotCount = evaluateFormula(tab.slotFormula, character.attributes);
            const currentSlots = character.inventorySlots[tab.id] || [];
            const enumDef = enumCache.get(tab.itemEnumId);

            return (
              <Tabs.Content key={tab.id} value={tab.id}>
                <Box mt={4}>
                  {slotCount === 0 ? (
                    <Flex
                      minH="120px"
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      borderWidth="1px"
                      borderStyle="dashed"
                    >
                      <Text fontSize="sm" color="gray.600">
                        {tab.emptySlotMessage}
                      </Text>
                    </Flex>
                  ) : (
                    <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                      {currentSlots.slice(0, slotCount).map((item, index) => {
                        // Find the selected enum value to check for description
                        const selectedValue = item ? findEnumValueByName(enumDef?.values || [], item) : undefined;
                        const selectedDesc = selectedValue ? getEnumValueDescription(selectedValue) : undefined;

                        const selectField = (
                          <NativeSelectRoot>
                            <NativeSelectField
                              id={`${tab.id}-${index}`}
                              value={item}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                updateInventorySlot(tab.id, index, e.target.value)
                              }
                              title={selectedDesc ? undefined : `Select ${tab.label.toLowerCase()}`}
                            >
                              <option value="">Select {tab.label.toLowerCase()}...</option>
                              {enumDef?.values.map((enumValue) => {
                                const name = getEnumValueName(enumValue);
                                return (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                );
                              })}
                            </NativeSelectField>
                          </NativeSelectRoot>
                        );

                        return (
                          <Field key={index} label={`${tab.emoji} Slot ${index + 1}`}>
                            {selectedDesc ? (
                              <Tooltip content={<Text fontSize="sm">{selectedDesc}</Text>}>
                                {selectField}
                              </Tooltip>
                            ) : (
                              selectField
                            )}
                          </Field>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              </Tabs.Content>
            );
          })}
        </Tabs.Root>
      </Card.Body>
    </Card.Root>
  );
};
