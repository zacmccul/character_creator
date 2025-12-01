/**
 * Character Info Component
 * Configuration-driven character information fields
 */

import { useEffect, useState } from 'react';
import { Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Tooltip } from '@/components/ui/tooltip';
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select';
import { useCharacterStore } from '@/stores/character.store';
import { ChangeEvent } from 'react';
import type { CharacterInfoConfig, FieldConfig } from '@/types/character-info-config.types';
import { configManager } from '@/utils/config-manager';
import { getEnumValueName, getEnumValueDescription, findEnumValueByName } from '@/utils/enum-helpers';

export const CharacterInfo = () => {
  const { character, updateCharacterInfo } = useCharacterStore();
  const [config, setConfig] = useState<CharacterInfoConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    configManager.loadAllConfigs()
      .then((result) => {
        if (result.success) {
          setConfig(result.config.characterInfo);
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

  const handleFieldChange = (fieldId: string, value: string) => {
    updateCharacterInfo(fieldId, value);
  };

  const getFieldValue = (fieldId: string): string => {
    // Get value from character info record, defaulting to empty string
    return character.characterInfo[fieldId] ?? '';
  };

  const renderField = (field: FieldConfig) => {
    const value = getFieldValue(field.id);
    const isInvalid = field.required && value === '';

    if (field.type === 'text') {
      return (
        <Field
          key={field.id}
          label={field.label}
          required={field.required}
          invalid={isInvalid}
          errorText={isInvalid ? 'Required field' : undefined}
        >
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            title={field.description}
          />
        </Field>
      );
    }

    if (field.type === 'enum') {
      const enumDef = configManager.getEnum(field.enumRef.enumId);
      
      if (!enumDef) {
        return (
          <Field key={field.id} label={field.label}>
            <Text color="red.500" fontSize="sm">
              Enum not found: {field.enumRef.enumId}
            </Text>
          </Field>
        );
      }

      // Find the selected enum value to check for description
      const selectedValue = value ? findEnumValueByName(enumDef.values, value) : undefined;
      const selectedDesc = selectedValue ? getEnumValueDescription(selectedValue) : undefined;

      const selectField = (
        <NativeSelectRoot>
          <NativeSelectField
            id={field.id}
            value={value}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => 
              handleFieldChange(field.id, e.target.value)
            }
            title={selectedDesc ? undefined : field.description}
          >
            {enumDef.values.map((enumValue) => {
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
        <Field key={field.id} label={field.label}>
          {selectedDesc ? (
            <Tooltip content={<Text fontSize="sm" whiteSpace="pre-wrap">{selectedDesc}</Text>}>
              {selectField}
            </Tooltip>
          ) : (
            selectField
          )}
        </Field>
      );
    }

    return null;
  };

  // Show loading state
  if (!config && !configError) {
    return (
      <Card.Root>
        <Card.Body>
          <Text>Loading character info configuration...</Text>
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
        <Grid gap={4} gridTemplateColumns={{ base: '1fr', xl: 'repeat(3, 1fr)' }}>
          {config.fields.map((field) => renderField(field))}
        </Grid>
      </Card.Body>
    </Card.Root>
  );
};
