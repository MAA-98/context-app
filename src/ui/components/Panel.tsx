import React from 'react';
import { Box } from 'ink';

type PanelProps = {
  children: React.ReactNode;
  flexGrow?: number;
  borderColor?: string;
};

/**
 * Reusable bordered section for the TUI.
 * - Title is optional
 * - Useful for both labeled panels and plain content blocks
 */
export function Panel({ children, flexGrow = 1, borderColor = 'blue' }: PanelProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
      paddingY={0}
      flexGrow={flexGrow}
    >
      {children}
    </Box>
  );
}