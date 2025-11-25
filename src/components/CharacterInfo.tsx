/**
 * Character Info Component
 * Basic character information: name, species, and experience
 */

import { Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
import { useCharacterStore } from '@/stores/character.store';
import { Species, Experience } from '@/types/character.types';
import { ChangeEvent } from 'react';

export const CharacterInfo = () => {
  const { character, updateName, updateSpecies, updateExperience } =
    useCharacterStore();

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">👤 Character Information</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Grid gap={4} gridTemplateColumns={{ base: '1fr', xl: 'repeat(3, 1fr)' }}>
          {/* Character Name */}
          <Field
            label="Name"
            required
            invalid={character.name === ''}
            errorText={character.name === '' ? 'Required field' : undefined}
          >
            <Input
              id="character-name"
              value={character.name}
              onChange={(e) => updateName(e.target.value)}
              placeholder="Enter name"
            />
          </Field>

          {/* Species Selection */}
          <Field label="Species">
            <NativeSelectRoot>
              <NativeSelectField
                id="species"
                value={character.species}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateSpecies(e.target.value as Species)}
              >
                {Object.values(Species).map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          {/* Experience/Background Selection */}
          <Field label="Background">
            <NativeSelectRoot>
              <NativeSelectField
                id="experience"
                value={character.experience}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateExperience(e.target.value as Experience)}
              >
                {Object.values(Experience).map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
};
