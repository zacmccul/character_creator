/**
 * Configurable Layout Component
 * Renders character sheet sections based on layout configuration using Chakra UI HStack/VStack
 */

import { useEffect, useState, memo } from 'react';
import { HStack, VStack, Box } from '@chakra-ui/react';
import { CharacterInfo } from '@/components/CharacterInfo';
import { AttributesSection } from '@/components/AttributesSection';
import { CombatStatsSection } from '@/components/CombatStatsSection';
import { LevelClassSection } from '@/components/LevelClassSection';
import { ResourceCounters } from '@/components/ResourceCounters';
import { InventorySection } from '@/components/InventorySection';
import type { LayoutConfig, ComponentId, LayoutComponentItem } from '@/types/layout-config.types';
import { layoutConfigSchema } from '@/schemas/layout-config.schema';

/**
 * Map of component IDs to their React components
 */
const componentMap: Record<ComponentId, React.ComponentType> = {
  'character-info': CharacterInfo,
  'attributes': AttributesSection,
  'combat-stats': CombatStatsSection,
  'level-class': LevelClassSection,
  'resource-counters': ResourceCounters,
  'inventory': InventorySection,
};

interface ConfigurableLayoutProps {
  /** Optional custom layout config. If not provided, will load from /config/layout.json */
  config?: LayoutConfig;
  /** Callback when layout config fails to load or validate */
  onError?: (error: string) => void;
}

/**
 * Renders a component item with optional styling
 */
const ComponentItem = memo(({ item }: { item: LayoutComponentItem }) => {
  const Component = componentMap[item.componentId];
  
  if (!Component) {
    console.error(`Unknown component ID: ${item.componentId}`);
    return null;
  }

  return (
    <Box
      minH={item.minH}
      display={item.display}
      className={item.className}
      width="full"
    >
      <Component />
    </Box>
  );
});

/**
 * Main configurable layout component
 * Loads layout config and renders components in a SimpleGrid
 */
export const ConfigurableLayout = ({ config: propConfig, onError }: ConfigurableLayoutProps) => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(propConfig || null);
  const [isLoading, setIsLoading] = useState(!propConfig);
  const [error, setError] = useState<string | null>(null);

  // Load layout config from JSON if not provided via props
  useEffect(() => {
    if (propConfig) {
      setLayoutConfig(propConfig);
      setIsLoading(false);
      return;
    }

    const loadLayoutConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/config/layout.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load layout config: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Validate against schema
        const result = layoutConfigSchema.safeParse(data);
        
        if (!result.success) {
          const errorMessage = `Invalid layout configuration: ${result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
          throw new Error(errorMessage);
        }

        setLayoutConfig(result.data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading layout config';
        console.error('Layout config error:', errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayoutConfig();
  }, [propConfig, onError]);

  // Show loading state
  if (isLoading) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        Loading layout...
      </Box>
    );
  }

  // Show error state
  if (error || !layoutConfig) {
    return (
      <Box p={4} color="red.500">
        <Box fontWeight="bold">Layout Error:</Box>
        <Box fontSize="sm" mt={2}>{error || 'No layout configuration available'}</Box>
      </Box>
    );
  }

  // Group items by column
  const columnItems = layoutConfig.columns.map((_, colIndex) => 
    layoutConfig.items.filter(item => item.column === colIndex)
  );

  return (
    <HStack
      align="stretch"
      gap={layoutConfig.columnGap ?? 6}
      flexDirection={{ base: 'column', lg: 'row' }}
    >
      {layoutConfig.columns.map((column, colIndex) => (
        <VStack
          key={colIndex}
          width={{ base: 'full', lg: column.width }}
          gap={layoutConfig.itemGap ?? 4}
          align="stretch"
        >
          {columnItems[colIndex]?.map((item, itemIndex) => (
            <ComponentItem key={`${item.componentId}-${itemIndex}`} item={item} />
          ))}
        </VStack>
      ))}
    </HStack>
  );
};

/**
 * Hook to access layout configuration
 * Useful for components that need to adapt based on current layout
 */
export const useLayoutConfig = () => {
  const [config, setConfig] = useState<LayoutConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config/layout.json');
        if (!response.ok) throw new Error('Failed to load layout config');
        
        const data = await response.json();
        const result = layoutConfigSchema.safeParse(data);
        
        if (!result.success) {
          throw new Error('Invalid layout configuration');
        }
        
        setConfig(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, isLoading, error };
};
