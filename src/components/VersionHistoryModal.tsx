/**
 * Version History Modal Component
 * View, preview, and revert to previous character versions
 */

import { useState } from 'react';
import { Box, Button, DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, Flex, Grid, Separator, Text } from '@chakra-ui/react';
import { DialogTrigger } from '@/components/ui/dialog-trigger';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacterStore } from '@/stores/character.store';
import { useVersionHistoryStore } from '@/stores/version-history.store';
import { formatTimestamp, getRelativeTime } from '@/types/version-history.types';
import { History, Eye, RotateCcw, Clock } from 'lucide-react';

export const VersionHistoryModal = () => {
  const [open, setOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  
  const { loadCharacter } = useCharacterStore();
  const { getVersionList, loadVersion } = useVersionHistoryStore();
  
  const versions = getVersionList();

  const handleRevert = (timestamp: string) => {
    const version = loadVersion(timestamp);
    if (version) {
      if (confirm(`Revert to version from ${formatTimestamp(timestamp)}?`)) {
        loadCharacter(version.characterData);
        setOpen(false);
      }
    }
  };

  const handlePreview = (timestamp: string) => {
    setPreviewVersion(timestamp);
  };

  const closePreview = () => {
    setPreviewVersion(null);
  };

  const previewData = previewVersion ? loadVersion(previewVersion) : null;

  return (
    <>
      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
          >
            <History size={16} style={{ marginRight: 8 }} />
            <Box display={{ base: 'none', sm: 'inline' }}>History ({versions.length})</Box>
          </Button>
        </DialogTrigger>
        <DialogBackdrop />
        <DialogContent maxW="3xl" maxH="80vh">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <Text fontSize="sm" color="gray.600">
              View and restore previous versions of your character sheet.
            </Text>
          </DialogHeader>

          <DialogBody overflowY="auto">
            {versions.length === 0 ? (
              <Flex direction="column" align="center" py={8} color="gray.600" textAlign="center">
                <Clock size={48} opacity={0.5} style={{ marginBottom: 12 }} />
                <Text>No saved versions yet.</Text>
                <Text fontSize="sm" mt={1}>
                  Versions are saved automatically and when you download the character sheet.
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap={2}>
                {versions.map((version, index) => (
                  <Box
                    key={version.timestamp}
                    p={3}
                    borderWidth="1px"
                    borderRadius="lg"
                    _hover={{ bg: 'gray.50' }}
                    transition="all 0.2s"
                  >
                    <Flex align="flex-start" justify="space-between" gap={3}>
                      <Box flex={1} minW={0}>
                        <Flex align="center" gap={2}>
                          <Text fontSize="xs" fontFamily="mono" color="gray.600">
                            #{versions.length - index}
                          </Text>
                          <Text fontWeight="medium" truncate>
                            {version.characterData.name || 'Unnamed Character'}
                          </Text>
                        </Flex>
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          {formatTimestamp(version.timestamp)}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {getRelativeTime(version.timestamp)}
                        </Text>
                        {version.label && (
                          <Text fontSize="sm" mt={1} color="blue.600">
                            📝 {version.label}
                          </Text>
                        )}
                      </Box>

                      <Flex gap={1}>
                        <Tooltip content={<Text fontSize="sm">Preview this version</Text>}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(version.timestamp)}
                          >
                            <Eye size={16} />
                          </Button>
                        </Tooltip>
                        <Tooltip content={<Text fontSize="sm">Revert to this version</Text>}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevert(version.timestamp)}
                            colorPalette="blue"
                          >
                            <RotateCcw size={16} />
                          </Button>
                        </Tooltip>
                      </Flex>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>

      {/* Preview Dialog */}
      {previewData && (
        <DialogRoot open={!!previewVersion} onOpenChange={() => closePreview()}>
          <DialogBackdrop />
          <DialogContent maxW="2xl" maxH="80vh" overflowY="auto">
            <DialogHeader>
              <DialogTitle>Version Preview</DialogTitle>
              <Text fontSize="sm" color="gray.600">
                {formatTimestamp(previewData.timestamp)}
              </Text>
            </DialogHeader>

            <DialogBody>
              <Flex direction="column" gap={4}>
                <Grid gridTemplateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>Name</Text>
                    <Text fontSize="sm">{previewData.characterData.name}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>Species</Text>
                    <Text fontSize="sm">{previewData.characterData.species}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>HP</Text>
                    <Text fontSize="sm">{previewData.characterData.combatStats?.hp ?? 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>MP</Text>
                    <Text fontSize="sm">{previewData.characterData.combatStats?.mp ?? 'N/A'}</Text>
                  </Box>
                </Grid>

                <Separator />

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Attributes</Text>
                  <Grid gridTemplateColumns="repeat(5, 1fr)" gap={2}>
                    {Object.entries(previewData.characterData.attributes).map(([key, val]) => (
                      <Flex
                        key={key}
                        direction="column"
                        align="center"
                        p={2}
                        bg="gray.100"
                        borderRadius="md"
                      >
                        <Text fontSize="xs" color="gray.600">{key}</Text>
                        <Text fontSize="lg" fontWeight="bold">{val}</Text>
                      </Flex>
                    ))}
                  </Grid>
                </Box>

                {previewData.characterData.level.length > 0 && (
                  <>
                    <Separator />
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>Classes</Text>
                      <Flex direction="column" gap={1}>
                        {previewData.characterData.level.map((lvl, idx) => (
                          <Text key={idx} fontSize="sm">
                            {lvl.class} - Level {lvl.level}
                          </Text>
                        ))}
                      </Flex>
                    </Box>
                  </>
                )}
              </Flex>
            </DialogBody>

            <DialogFooter>
              <Button variant="outline" onClick={closePreview}>
                Close
              </Button>
              <Button onClick={() => {
                handleRevert(previewData.timestamp);
                closePreview();
              }}>
                <RotateCcw size={16} style={{ marginRight: 8 }} />
                Restore This Version
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      )}
    </>
  );
};
