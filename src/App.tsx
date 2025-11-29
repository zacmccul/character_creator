/**
 * Main Application Component
 * Full character sheet interface with all sections
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Button, Flex, Heading, Spinner, Text, Container } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacterStore } from '@/stores/character.store';
import { useVersionHistoryStore } from '@/stores/version-history.store';
import {
  initializeData,
  saveToLocalStorage,
  downloadEmbeddedHTML,
} from '@/utils/persistence';
import {
  exportCharacterJSON,
  openFilePickerAndImport,
} from '@/utils/import-export';
import { createEmptyCharacter } from '@/types/character.types';
import { createEmptyVersionHistory } from '@/types/version-history.types';
import { Upload, FileJson, Save } from 'lucide-react';
import { VersionHistoryModal } from '@/components/VersionHistoryModal';
import { ConfigurableLayout } from '@/components/ConfigurableLayout';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const character = useCharacterStore((state) => state.character);
  const loadCharacter = useCharacterStore((state) => state.loadCharacter);
  const { saveVersion } = useVersionHistoryStore();
  
  // Use ref to track if we should save (prevents infinite loops)
  const saveTimeoutRef = useRef<number | null>(null);

  // Memoized error handler to prevent recreating on every render
  const handleLayoutError = useCallback((error: string) => {
    console.error('Layout error:', error);
  }, []);

  // Initialize data on mount (only once)
  useEffect(() => {
    const data = initializeData();

    if (data.character) {
      loadCharacter(data.character);
    } else {
      loadCharacter(createEmptyCharacter());
    }

    if (data.history) {
      useVersionHistoryStore.getState().loadHistoryData(data.history);
    } else {
      useVersionHistoryStore.getState().loadHistoryData(createEmptyVersionHistory());
    }

    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Auto-save to localStorage on character changes (with debounce)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save to prevent excessive writes
    saveTimeoutRef.current = window.setTimeout(() => {
      const currentHistory = useVersionHistoryStore.getState().history;
      saveToLocalStorage(character, currentHistory);
    }, 100);
    
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [character, isInitialized]);

  // Handle saving character sheet
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save version
      saveVersion(character, 'Manual save');

      // Download HTML file with embedded data
      const currentHistory = useVersionHistoryStore.getState().history;
      await downloadEmbeddedHTML(
        character,
        currentHistory,
        `${character.name || 'character'}-sheet.html`
      );
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save character sheet');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle exporting JSON
  const handleExportJSON = () => {
    exportCharacterJSON(character);
  };

  // Handle importing JSON
  const handleImportJSON = async () => {
    const result = await openFilePickerAndImport();
    if (result.success && result.data) {
      if (confirm('Import this character? Current character will be replaced.')) {
        loadCharacter(result.data);
      }
    } else {
      alert(`Import failed: ${result.error}`);
    }
  };

  if (!isInitialized) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Flex align="center" gap={2}>
          <Spinner size="md" />
          <Text fontSize="lg">Loading character sheet...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Floating Action Bar - Upper Right */}
      <Flex
        position="fixed"
        top={4}
        right={4}
        zIndex={50}
        gap={2}
        borderRadius="lg"
        borderWidth="1px"
        bg="white"
        p={2}
        shadow="lg"
      >
        <VersionHistoryModal />
        <Tooltip content={<Text fontSize="sm">Export character as JSON file</Text>}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
          >
            <FileJson size={16} style={{ marginRight: 8 }} />
            <Box display={{ base: 'none', sm: 'inline' }}>Export</Box>
          </Button>
        </Tooltip>
        <Tooltip content={<Text fontSize="sm">Import character from JSON file</Text>}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportJSON}
          >
            <Upload size={16} style={{ marginRight: 8 }} />
            <Box display={{ base: 'none', sm: 'inline' }}>Import</Box>
          </Button>
        </Tooltip>
        <Tooltip content={<Text fontSize="sm">Download character sheet as HTML</Text>}>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !character.name}
            colorPalette="brand"
          >
            <Save size={16} style={{ marginRight: 8 }} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Tooltip>
      </Flex>

      {/* Header Bar */}
      <Box
        position="sticky"
        top={0}
        zIndex={40}
        w="full"
        borderBottomWidth="1px"
        bg="white"
        backdropFilter="blur(10px)"
      >
        <Container maxW="container.xl">
          <Flex h={16} align="center" justify="space-between" px={4}>
            <Flex direction="column">
              <Heading size="lg">
                ⚔️ Character Sheet
              </Heading>
              <Text fontSize="sm" color="gray.600" truncate>
                {character.name || 'Unnamed Character'}
              </Text>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" px={4} py={{ base: 6, sm: 8 }}>
        <ConfigurableLayout onError={handleLayoutError} />
      </Container>

      {/* Footer */}
      <Box borderTopWidth="1px" py={{ base: 6, md: 8 }}>
        <Container maxW="container.xl">
          <Flex direction="column" align="center" justify="center" gap={2} px={4} textAlign="center">
            <Text fontSize="sm" fontWeight="medium">Version 1.0.0</Text>
            <Text fontSize="xs" color="gray.600">
              🔒 All data saved locally • 📦 Self-contained HTML file
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
