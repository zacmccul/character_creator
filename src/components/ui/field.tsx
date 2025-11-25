import { Field as ChakraField } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  children: ReactNode;
}

export const Field = ({ label, required, invalid, errorText, children }: FieldProps) => {
  return (
    <ChakraField.Root invalid={invalid} required={required}>
      <ChakraField.Label>{label}</ChakraField.Label>
      {children}
      {errorText && (
        <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
};
