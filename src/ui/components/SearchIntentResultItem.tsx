import React from 'react';
import { Box, Text } from 'ink';
import type { Intent } from '../../domain/types.js';

type Props = {
  intent: Intent;
  isSelected?: boolean;
};

export function SearchIntentResultItem({ intent, isSelected = false }: Props) {
  return (
    <Box
      flexDirection="column"
      paddingX={isSelected ? 1 : 0}
    >
      <Text color={isSelected ? 'green' : undefined} bold={isSelected}>
        {isSelected ? '▶ ' : '  '}
        {intent.id} : {intent.shortDesc}
      </Text>
    </Box>
  );
}
