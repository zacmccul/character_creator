import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <ChakraTooltip.Root>
      <ChakraTooltip.Trigger asChild>
        {children}
      </ChakraTooltip.Trigger>
      <ChakraTooltip.Positioner>
        <ChakraTooltip.Content>
          {content}
        </ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </ChakraTooltip.Root>
  );
};
